// src/mirage/server.js
import { createServer, Model, Response } from "miragejs";

const pick = (obj, keys) =>
  keys.reduce((acc, k) => (obj[k] !== undefined ? ((acc[k] = obj[k]), acc) : acc), {});

export function makeServer({ environment = "development" } = {}) {
  return createServer({
    environment,

    models: {
      job: Model,
      candidate: Model,
      assessment: Model, // one per jobId (or multiple versions if you prefer)
    },

    seeds(server) {
      // ---- Jobs with "order" for drag-reorder ----
      const seedJobs = [
        { id: "1", title: "Frontend Developer", slug: "frontend-dev", status: "active", tags: ["remote"], order: 1 },
        { id: "2", title: "Backend Engineer", slug: "backend-eng", status: "active", tags: ["full-time"], order: 2 },
        { id: "3", title: "Data Analyst", slug: "data-analyst", status: "archived", tags: ["onsite"], order: 3 },
      ];
      seedJobs.forEach((j) => server.create("job", j));

      // ---- Candidates with stages + timeline ----
      const seedCandidates = [
        {
          id: "1",
          name: "Alice Johnson",
          email: "alice@example.com",
          stage: "applied",
          tags: ["React", "UI"],
          timeline: [{ at: new Date().toISOString(), stage: "applied", by: "System" }],
        },
        {
          id: "2",
          name: "Bob Smith",
          email: "bob@example.com",
          stage: "tech",
          tags: ["Node", "API"],
          timeline: [{ at: new Date().toISOString(), stage: "tech", by: "System" }],
        },
        {
          id: "3",
          name: "Charlie Brown",
          email: "charlie@example.com",
          stage: "screen",
          tags: ["SQL", "Excel"],
          timeline: [{ at: new Date().toISOString(), stage: "screen", by: "System" }],
        },
      ];
      seedCandidates.forEach((c) => server.create("candidate", c));

      // ---- One assessment per job (empty by default) ----
      server.create("assessment", {
        id: "a-1",
        jobId: "1",
        title: "FE Onsite",
        sections: [],
        status: "active",
      });
      server.create("assessment", {
        id: "a-2",
        jobId: "2",
        title: "BE Take-home",
        sections: [],
        status: "active",
      });
    },

    routes() {
      this.namespace = "api";
      this.timing = 400; // simulate latency

      /* =========================
         JOBS
         ========================= */
      // GET /jobs?search=&status=&page=&pageSize=&sort=
      this.get("/jobs", (schema, request) => {
        let jobs = schema.jobs.all().models.map((m) => m.attrs);

        const search = (request.queryParams.search || "").toLowerCase();
        const status = request.queryParams.status || "";
        const page = parseInt(request.queryParams.page || "1", 10);
        const pageSize = parseInt(request.queryParams.pageSize || "5", 10);
        const sort = request.queryParams.sort || "order"; // order|title|-title|...

        if (search) {
          jobs = jobs.filter((j) => j.title?.toLowerCase().includes(search) || j.tags?.join(" ").toLowerCase().includes(search));
        }
        if (status) {
          jobs = jobs.filter((j) => j.status === status);
        }

        // sort
        const dir = sort.startsWith("-") ? -1 : 1;
        const key = sort.replace(/^-/, "");
        jobs.sort((a, b) => {
          const va = a[key]; const vb = b[key];
          if (va < vb) return -1 * dir;
          if (va > vb) return 1 * dir;
          return 0;
        });

        const totalPages = Math.max(1, Math.ceil(jobs.length / pageSize));
        const start = (page - 1) * pageSize;
        const end = start + pageSize;

        return { jobs: jobs.slice(start, end), totalPages };
      });

      // POST /jobs
      this.post("/jobs", (schema, request) => {
        const attrs = JSON.parse(request.requestBody || "{}");
        if (!attrs.title || !attrs.slug) {
          return new Response(400, {}, { error: "title and slug are required" });
        }
        // compute next order (append)
        const all = schema.jobs.all().models.map((m) => m.attrs);
        const maxOrder = all.reduce((acc, j) => Math.max(acc, j.order || 0), 0);
        const id = String(Date.now());
        const job = schema.jobs.create({
          id,
          title: attrs.title,
          slug: attrs.slug,
          status: attrs.status || "active",
          tags: attrs.tags || [],
          order: maxOrder + 1,
        });
        return job.attrs;
      });

      // PATCH /jobs/:id
      this.patch("/jobs/:id", (schema, request) => {
        const job = schema.jobs.find(request.params.id);
        if (!job) return new Response(404, {}, { error: "Job not found" });
        const patch = JSON.parse(request.requestBody || "{}");
        job.update(pick(patch, ["title", "slug", "status", "tags"]));
        return job.attrs;
      });

      // PATCH /jobs/:id/reorder  → { fromOrder, toOrder }  (sometimes 500)
      this.patch("/jobs/:id/reorder", (schema, request) => {
        // 1 in 6 chance to simulate server failure
        if (Math.random() < 1 / 6) {
          return new Response(500, {}, { error: "Randomized reorder failure (test rollback)" });
        }

        const job = schema.jobs.find(request.params.id);
        if (!job) return new Response(404, {}, { error: "Job not found" });

        const body = JSON.parse(request.requestBody || "{}");
        let { fromOrder, toOrder } = body;

        // Back-compat: if only toOrder is provided, infer fromOrder from the job
        if (fromOrder == null) fromOrder = job.attrs.order;
        if (toOrder == null) return new Response(400, {}, { error: "toOrder required" });

        // Normalize: swap/move orders by shifting others
        const all = schema.jobs.all().models.sort((a, b) => (a.attrs.order || 0) - (b.attrs.order || 0));
        const moving = job;

        // Remove moving from list
        const remaining = all.filter((m) => m.id !== moving.id);

        // Insert at target (1-based order)
        const targetIndex = Math.max(0, Math.min(remaining.length, toOrder - 1));
        const reordered = [
          ...remaining.slice(0, targetIndex),
          moving,
          ...remaining.slice(targetIndex),
        ];

        // Reassign sequential orders starting at 1
        reordered.forEach((m, idx) => m.update({ order: idx + 1 }));

        return { success: true, id: job.id, fromOrder, toOrder };
      });

      /* =========================
         CANDIDATES
         ========================= */
      // GET /candidates?search=&stage=&page=
      this.get("/candidates", (schema, request) => {
        let list = schema.candidates.all().models.map((m) => m.attrs);

        const search = (request.queryParams.search || "").toLowerCase();
        const stage = request.queryParams.stage || "";
        const page = parseInt(request.queryParams.page || "1", 10);
        const pageSize = 20;

        if (search) {
          list = list.filter((c) =>
            [c.name, c.email, ...(c.tags || [])].join(" ").toLowerCase().includes(search)
          );
        }
        if (stage) {
          list = list.filter((c) => c.stage === stage);
        }

        const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
        const start = (page - 1) * pageSize;
        const end = start + pageSize;

        return { candidates: list.slice(start, end), totalPages };
      });

      // POST /candidates
      this.post("/candidates", (schema, request) => {
        const attrs = JSON.parse(request.requestBody || "{}");
        const id = String(Date.now());
        const stage = attrs.stage || "applied";
        const created = schema.candidates.create({
          id,
          name: attrs.name,
          email: attrs.email,
          stage,
          tags: attrs.tags || [],
          timeline: [{ at: new Date().toISOString(), stage, by: "You" }],
        });
        return created.attrs;
      });

      // PATCH /candidates/:id  (stage transitions, general updates)
      this.patch("/candidates/:id", (schema, request) => {
        const cand = schema.candidates.find(request.params.id);
        if (!cand) return new Response(404, {}, { error: "Candidate not found" });

        const patch = JSON.parse(request.requestBody || "{}");
        const prev = cand.attrs.stage;

        cand.update(pick(patch, ["name", "email", "stage", "tags"]));

        if (patch.stage && patch.stage !== prev) {
          const tl = cand.attrs.timeline || [];
          tl.unshift({ at: new Date().toISOString(), stage: patch.stage, by: "You" });
          cand.update({ timeline: tl });
        }
        return cand.attrs;
      });

      // GET /candidates/:id/timeline
      this.get("/candidates/:id/timeline", (schema, request) => {
        const cand = schema.candidates.find(request.params.id);
        if (!cand) return new Response(404, {}, { error: "Candidate not found" });
        return { timeline: cand.attrs.timeline || [] };
      });

      /* =========================
         ASSESSMENTS (per job)
         ========================= */
      // GET /assessments/:jobId
      this.get("/assessments/:jobId", (schema, request) => {
        const jobId = request.params.jobId;
        const records = schema.assessments.where({ jobId }).models;
        if (records.length === 0) {
          // initialize empty assessment for this job
          const created = schema.assessments.create({
            id: `a-${jobId}`,
            jobId,
            title: "",
            sections: [],
            status: "active",
          });
          return created.attrs;
        }
        return records[0].attrs;
      });

      // PUT /assessments/:jobId  (replace)
      this.put("/assessments/:jobId", (schema, request) => {
        const jobId = request.params.jobId;
        const body = JSON.parse(request.requestBody || "{}");
        let record = schema.assessments.where({ jobId }).models[0];
        if (!record) {
          record = schema.assessments.create({
            id: `a-${jobId}`,
            jobId,
            title: body.title || "",
            sections: body.sections || [],
            status: body.status || "active",
          });
        } else {
          record.update({
            title: body.title || "",
            sections: Array.isArray(body.sections) ? body.sections : [],
            status: body.status || "active",
          });
        }
        return record.attrs;
      });

      // POST /assessments/:jobId/submit  (store response locally)
      this.post("/assessments/:jobId/submit", (schema, request) => {
        const jobId = request.params.jobId;
        const body = JSON.parse(request.requestBody || "{}");

        // store in localStorage: assessment_responses:<jobId>
        const key = `assessment_responses:${jobId}`;
        let existing = [];
        try {
          const raw = localStorage.getItem(key);
          if (raw) existing = JSON.parse(raw);
        } catch {}

        const saved = {
          id: String(Date.now()),
          at: new Date().toISOString(),
          payload: body, // includes candidate info + answers
        };
        existing.unshift(saved);
        localStorage.setItem(key, JSON.stringify(existing));
        return { success: true, saved };
      });
    },
  });
}
