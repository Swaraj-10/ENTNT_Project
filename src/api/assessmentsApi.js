// src/api/assessmentsApi.js

// GET /assessments/:jobId
export async function fetchAssessment(jobId) {
  const res = await fetch(`/api/assessments/${jobId}`);
  if (!res.ok) throw new Error("Failed to fetch assessment");
  return res.json();
}

// PUT /assessments/:jobId
export async function saveAssessment(jobId, data) {
  const res = await fetch(`/api/assessments/${jobId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save assessment");
  return res.json();
}

// POST /assessments/:jobId/submit
export async function submitAssessment(jobId, payload) {
  const res = await fetch(`/api/assessments/${jobId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to submit assessment");
  return res.json(); // { success, saved }
}
