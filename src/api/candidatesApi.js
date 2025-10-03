// src/api/candidatesApi.js
const API_URL = "/api/candidates";

// robust JSON parse
async function parse(res) {
  if (!res.ok) throw new Error("API error");
  const data = await res.json();
  return data?.candidates ?? data;
}

// GET /candidates?search=&stage=&page=
export async function fetchCandidates({ search = "", stage = "", page = 1 } = {}) {
  const qs = new URLSearchParams({
    ...(search ? { search } : {}),
    ...(stage ? { stage } : {}),
    page: String(page),
  }).toString();
  const res = await fetch(`${API_URL}?${qs}`);
  return parse(res);
}

export async function fetchCandidateById(id) {
  const res = await fetch(`${API_URL}?id=${id}`);
  const data = await parse(res);
  return (data.candidates || []).find((c) => c.id === id) || null;
}

export async function createCandidate(candidate) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(candidate),
  });
  if (!res.ok) throw new Error("Failed to create candidate");
  return res.json();
}

export async function updateCandidate(candidate) {
  const res = await fetch(`${API_URL}/${candidate.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(candidate),
  });
  if (!res.ok) throw new Error("Failed to update candidate");
  return res.json();
}

export async function deleteCandidate(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete candidate");
  return res.json();
}

// Toggle archive/unarchive (if you use status for candidates separately)
export async function toggleCandidateArchive(candidate) {
  const updated = { ...candidate, status: candidate.status === "active" ? "archived" : "active" };
  return updateCandidate(updated);
}

// GET /candidates/:id/timeline
export async function fetchCandidateTimeline(id) {
  const res = await fetch(`${API_URL}/${id}/timeline`);
  if (!res.ok) throw new Error("Failed to fetch candidate timeline");
  return res.json(); // { timeline: [...] }
}
