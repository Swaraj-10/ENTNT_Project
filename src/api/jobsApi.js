// src/api/jobsApi.js
import { db } from "../lib/dexieDB";

// GET /jobs?search=&status=&page=&pageSize=&sort=
export async function fetchJobs(page = 1, pageSize = 5, { search = "", status = "", sort = "order" } = {}) {
  const qs = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    ...(search ? { search } : {}),
    ...(status ? { status } : {}),
    ...(sort ? { sort } : {}),
  }).toString();

  const res = await fetch(`/api/jobs?${qs}`);
  if (!res.ok) throw new Error("Failed to fetch jobs");
  const data = await res.json();
  data.jobs = data.jobs.map((job) => ({ ...job, id: String(job.id) }));
  return data; // { jobs, totalPages }
}

export async function fetchJobById(id) {
  const res = await fetch(`/api/jobs/${id}`);
  if (!res.ok) throw new Error("Failed to fetch job");
  return res.json();
}

export async function createJob(job) {
  const res = await fetch("/api/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(job),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to create job");
  }
  const data = await res.json();
  await db.jobs.put(data);
  return data;
}

export async function updateJob(job) {
  const res = await fetch(`/api/jobs/${job.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(job),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to update job");
  }
  const data = await res.json();
  await db.jobs.put(data);
  return data;
}

export async function toggleArchive(job) {
  const updated = { ...job, status: job.status === "active" ? "archived" : "active" };
  return updateJob(updated);
}

// PATCH /jobs/:id/reorder → { fromOrder, toOrder }  (server sometimes returns 500)
export async function reorderJobs({ id, fromOrder, toOrder }) {
  const res = await fetch(`/api/jobs/${id}/reorder`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fromOrder, toOrder }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Failed to reorder job");
  }
  return res.json();
}
