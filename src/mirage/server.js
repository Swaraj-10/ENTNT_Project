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
  { id: "3", title: "Fullstack Engineer", slug: "fullstack-eng", status: "archived", tags: ["onsite"], order: 3 },
  { id: "4", title: "Data Analyst", slug: "data-analyst", status: "active", tags: ["excel", "sql"], order: 4 },
  { id: "5", title: "Data Scientist", slug: "data-scientist", status: "active", tags: ["ml", "python"], order: 5 },
  { id: "6", title: "DevOps Engineer", slug: "devops-eng", status: "archived", tags: ["aws", "docker"], order: 6 },
  { id: "7", title: "UI/UX Designer", slug: "uiux-designer", status: "active", tags: ["figma"], order: 7 },
  { id: "8", title: "Product Manager", slug: "product-manager", status: "active", tags: ["roadmap"], order: 8 },
  { id: "9", title: "QA Engineer", slug: "qa-engineer", status: "archived", tags: ["testing"], order: 9 },
  { id: "10", title: "Mobile Developer", slug: "mobile-dev", status: "active", tags: ["ios", "android"], order: 10 },
  { id: "11", title: "AI Engineer", slug: "ai-eng", status: "active", tags: ["ai", "ml"], order: 11 },
  { id: "12", title: "Cloud Architect", slug: "cloud-architect", status: "archived", tags: ["cloud"], order: 12 },
  { id: "13", title: "Database Admin", slug: "db-admin", status: "active", tags: ["db", "sql"], order: 13 },
  { id: "14", title: "System Analyst", slug: "system-analyst", status: "active", tags: ["analysis"], order: 14 },
  { id: "15", title: "Business Analyst", slug: "business-analyst", status: "archived", tags: ["finance"], order: 15 },
  { id: "16", title: "HR Specialist", slug: "hr-specialist", status: "active", tags: ["hr"], order: 16 },
  { id: "17", title: "Marketing Manager", slug: "marketing-manager", status: "active", tags: ["seo"], order: 17 },
  { id: "18", title: "SEO Specialist", slug: "seo-specialist", status: "archived", tags: ["seo"], order: 18 },
  { id: "19", title: "Support Engineer", slug: "support-eng", status: "active", tags: ["support"], order: 19 },
  { id: "20", title: "Network Engineer", slug: "network-eng", status: "active", tags: ["network"], order: 20 },
  { id: "21", title: "Security Specialist", slug: "security-specialist", status: "archived", tags: ["cybersecurity"], order: 21 },
  { id: "22", title: "Embedded Engineer", slug: "embedded-eng", status: "active", tags: ["iot"], order: 22 },
  { id: "23", title: "Game Developer", slug: "game-dev", status: "active", tags: ["unity", "gaming"], order: 23 },
  { id: "24", title: "Project Coordinator", slug: "project-coordinator", status: "archived", tags: ["coordination"], order: 24 },
  { id: "25", title: "Technical Writer", slug: "tech-writer", status: "active", tags: ["docs"], order: 25 },
];

      seedJobs.forEach((j) => server.create("job", j));

      // ---- Candidates with stages + timeline ----
      const seedCandidates = [
  { id: "1", name: "Rohit Sharma", email: "rohit.sharma@example.com", stage: "applied", tags: ["React", "JS"], timeline: [{ at: new Date().toISOString(), stage: "applied", by: "System" }] },
  { id: "2", name: "Anita Verma", email: "anita.verma@example.com", stage: "screen", tags: ["Python", "SQL"], timeline: [{ at: new Date().toISOString(), stage: "screen", by: "System" }] },
  { id: "3", name: "Rahul Khanna", email: "rahul.khanna@example.com", stage: "interview", tags: ["AWS"], timeline: [{ at: new Date().toISOString(), stage: "interview", by: "System" }] },
  { id: "4", name: "Priya Reddy", email: "priya.reddy@example.com", stage: "offer", tags: ["UI/UX"], timeline: [{ at: new Date().toISOString(), stage: "offer", by: "System" }] },
  { id: "5", name: "Suresh Iyer", email: "suresh.iyer@example.com", stage: "rejected", tags: ["C++"], timeline: [{ at: new Date().toISOString(), stage: "rejected", by: "System" }] },
  { id: "6", name: "Neha Gupta", email: "neha.gupta@example.com", stage: "applied", tags: ["Java"], timeline: [{ at: new Date().toISOString(), stage: "applied", by: "System" }] },
  { id: "7", name: "Vikram Singh", email: "vikram.singh@example.com", stage: "tech", tags: ["Node"], timeline: [{ at: new Date().toISOString(), stage: "tech", by: "System" }] },
  { id: "8", name: "Simran Kaur", email: "simran.kaur@example.com", stage: "screen", tags: ["HTML", "CSS"], timeline: [{ at: new Date().toISOString(), stage: "screen", by: "System" }] },
  { id: "9", name: "Arjun Mehta", email: "arjun.mehta@example.com", stage: "interview", tags: ["React", "Next.js"], timeline: [{ at: new Date().toISOString(), stage: "interview", by: "System" }] },
  { id: "10", name: "Pooja Das", email: "pooja.das@example.com", stage: "offer", tags: ["Marketing"], timeline: [{ at: new Date().toISOString(), stage: "offer", by: "System" }] },
  { id: "11", name: "Amit Roy", email: "amit.roy@example.com", stage: "applied", tags: ["SQL", "Excel"], timeline: [{ at: new Date().toISOString(), stage: "applied", by: "System" }] },
  { id: "12", name: "Sneha Nair", email: "sneha.nair@example.com", stage: "screen", tags: ["Java", "Spring"], timeline: [{ at: new Date().toISOString(), stage: "screen", by: "System" }] },
  { id: "13", name: "Karan Patel", email: "karan.patel@example.com", stage: "rejected", tags: ["DevOps"], timeline: [{ at: new Date().toISOString(), stage: "rejected", by: "System" }] },
  { id: "14", name: "Divya Kapoor", email: "divya.kapoor@example.com", stage: "tech", tags: ["AI", "ML"], timeline: [{ at: new Date().toISOString(), stage: "tech", by: "System" }] },
  { id: "15", name: "Sanjay Yadav", email: "sanjay.yadav@example.com", stage: "applied", tags: ["Networking"], timeline: [{ at: new Date().toISOString(), stage: "applied", by: "System" }] },
  { id: "16", name: "Meena Saxena", email: "meena.saxena@example.com", stage: "offer", tags: ["HR"], timeline: [{ at: new Date().toISOString(), stage: "offer", by: "System" }] },
  { id: "17", name: "Nikhil Bansal", email: "nikhil.bansal@example.com", stage: "screen", tags: ["C#", ".NET"], timeline: [{ at: new Date().toISOString(), stage: "screen", by: "System" }] },
  { id: "18", name: "Anjali Chopra", email: "anjali.chopra@example.com", stage: "interview", tags: ["Cloud"], timeline: [{ at: new Date().toISOString(), stage: "interview", by: "System" }] },
  { id: "19", name: "Manoj Das", email: "manoj.das@example.com", stage: "rejected", tags: ["Support"], timeline: [{ at: new Date().toISOString(), stage: "rejected", by: "System" }] },
  { id: "20", name: "Kavita Roy", email: "kavita.roy@example.com", stage: "tech", tags: ["Game Dev"], timeline: [{ at: new Date().toISOString(), stage: "tech", by: "System" }] },
];

            seedCandidates.forEach((c) =>
        server.create("candidate", {
          ...c,
          timeline: [{ at: new Date().toISOString(), stage: c.stage, by: "System" }],
        })
      );

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

        return { candidates: list.slice(start, start + pageSize), totalPages };
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
