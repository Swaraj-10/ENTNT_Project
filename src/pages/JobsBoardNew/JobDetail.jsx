// src/pages/jobs/JobDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchJobById, fetchJobs } from "../../api/jobsApi"; // fetchJobs for fallback
import { cls, btn } from "../../Components/ui";

/* ---------- Hardcoded candidate pool ---------- */
const CANDIDATE_POOL = [
  { id: "cand-1",  name: "Aarav Mehta",    email: "aarav.mehta@example.com",  status: "applied",
    academic: { degree: "B.Tech Computer Science", university: "IIT Bombay", cgpa: 8.5, graduationYear: 2022 },
    experienceYears: 1.5, skills: ["React", "TypeScript", "Tailwind", "Jest"], resumeUrl: "#",
  },
  { id: "cand-2",  name: "Sara Ali",       email: "sara.ali@example.com",     status: "screen",
    academic: { degree: "B.E. Information Technology", university: "Pune University", cgpa: 8.2, graduationYear: 2021 },
    experienceYears: 2.0, skills: ["Node.js", "Express", "MongoDB", "REST"], resumeUrl: "#",
  },
  { id: "cand-3",  name: "Vikram Rao",     email: "vikram.rao@example.com",   status: "tech",
    academic: { degree: "M.Tech Data Science", university: "IISc Bangalore", cgpa: 9.0, graduationYear: 2020 },
    experienceYears: 3.2, skills: ["Python", "Pandas", "SQL", "Airflow"], resumeUrl: "#",
  },
  { id: "cand-4",  name: "Meera Kapoor",   email: "meera.kapoor@example.com", status: "offer",
    academic: { degree: "B.Sc. Mathematics", university: "Delhi University", cgpa: 8.8, graduationYear: 2019 },
    experienceYears: 4.0, skills: ["Analytics", "PowerBI", "SQL", "Excel"], resumeUrl: "#",
  },
  { id: "cand-5",  name: "Rohit Patil",    email: "rohit.patil@example.com",  status: "applied",
    academic: { degree: "B.Tech Electronics", university: "VJTI Mumbai", cgpa: 7.9, graduationYear: 2023 },
    experienceYears: 0.6, skills: ["C++", "Embedded", "Linux"], resumeUrl: "#",
  },
  { id: "cand-6",  name: "Ananya Gupta",   email: "ananya.gupta@example.com", status: "screen",
    academic: { degree: "B.Tech IT", university: "NIT Trichy", cgpa: 8.7, graduationYear: 2022 },
    experienceYears: 1.2, skills: ["React", "Next.js", "GraphQL"], resumeUrl: "#",
  },
  { id: "cand-7",  name: "Karan Singh",    email: "karan.singh@example.com",  status: "tech",
    academic: { degree: "B.Tech Computer Science", university: "IIT Kanpur", cgpa: 9.1, graduationYear: 2018 },
    experienceYears: 5.5, skills: ["Go", "Kubernetes", "gRPC"], resumeUrl: "#",
  },
  { id: "cand-8",  name: "Priya Nair",     email: "priya.nair@example.com",   status: "rejected",
    academic: { degree: "MCA", university: "Anna University", cgpa: 8.0, graduationYear: 2019 },
    experienceYears: 3.8, skills: ["Java", "Spring Boot", "MySQL"], resumeUrl: "#",
  },
  { id: "cand-9",  name: "Farhan Khan",    email: "farhan.khan@example.com",  status: "hired",
    academic: { degree: "B.Tech AI/ML", university: "IIIT Hyderabad", cgpa: 9.2, graduationYear: 2021 },
    experienceYears: 2.5, skills: ["PyTorch", "FastAPI", "MLOps"], resumeUrl: "#",
  },
  { id: "cand-10", name: "Divya Sharma",   email: "divya.sharma@example.com", status: "offer",
    academic: { degree: "BCA", university: "Manipal University", cgpa: 8.4, graduationYear: 2020 },
    experienceYears: 3.0, skills: ["Angular", "RxJS", "NgRx"], resumeUrl: "#",
  },
];

/* ---------- helpers ---------- */
const LS_KEY_PREFIX = "jobApplicants:";

function getStoredApplicants(jobId) {
  try {
    const raw = localStorage.getItem(LS_KEY_PREFIX + jobId);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}
function storeApplicants(jobId, list) {
  localStorage.setItem(LS_KEY_PREFIX + jobId, JSON.stringify(list));
}
function sampleRandom(arr, min = 3, max = 7) {
  const n = Math.max(min, Math.min(max, arr.length));
  const count = Math.floor(Math.random() * (n - min + 1)) + min;
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}
const statusTone = (s) =>
  ({
    applied: "bg-blue-100 text-blue-700",
    screen: "bg-indigo-100 text-indigo-700",
    tech: "bg-amber-100 text-amber-700",
    offer: "bg-emerald-100 text-emerald-700",
    hired: "bg-green-100 text-green-700",
    rejected: "bg-rose-100 text-rose-700",
  }[s] || "bg-gray-100 text-gray-700");

export default function JobDetail() {
  const { jobId } = useParams();

  // Try to fetch the job by id; fall back to looking it up in the list (or minimal stub)
  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => {
      try {
        return await fetchJobById(jobId);
      } catch {
        // fallback: ask first page for a match (Mirage may not have GET /jobs/:id)
        const page1 = await fetchJobs(1, 50, {});
        const found = page1.jobs.find((j) => String(j.id) === String(jobId));
        return (
          found || {
            id: jobId,
            title: `Job #${jobId}`,
            slug: `job-${jobId}`,
            status: "active",
            tags: [],
          }
        );
      }
    },
  });

  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    if (!jobId) return;
    const saved = getStoredApplicants(jobId);
    if (saved) {
      setCandidates(saved);
      return;
    }
    const chosen = sampleRandom(CANDIDATE_POOL, 3, 7);
    storeApplicants(jobId, chosen);
    setCandidates(chosen);
  }, [jobId]);

  const grouped = useMemo(() => {
    const by = {};
    for (const c of candidates) {
      (by[c.status] ||= []).push(c);
    }
    return by;
  }, [candidates]);

  if (jobLoading) {
    return <p className="text-center text-gray-500 mt-8">Loading job…</p>;
  }

  return (
    <div className={cls.container}>
      {/* Job header */}
      <div className={`${cls.card} ${cls.cardPad}`}>
        <h1 className={`${cls.h1} mb-4`}>{job.title}</h1>
        <p className="mb-2">
          <span className="font-semibold">Status: </span>
          <span
            className={`${cls.badge} ${
              job.status === "active" ? cls.badgeTone.success : cls.badgeTone.danger
            }`}
          >
            {job.status}
          </span>
        </p>
        <p className="mb-2"><span className="font-semibold">Slug:</span> {job.slug}</p>
        {!!job.tags?.length && (
          <p className="mb-2">
            <span className="font-semibold">Tags:</span>{" "}
            {job.tags.map((t, i) => (
              <span key={i} className={`${cls.badge} ${cls.badgeTone.info} mr-2`}>{t}</span>
            ))}
          </p>
        )}
        <div className="mt-6">
          <Link to="/jobs" className={btn("secondary")}>← Back to Jobs</Link>
        </div>
      </div>

      {/* Applicants */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className={cls.h2}>Applicants</h2>
          <div className="text-sm text-gray-500">
            Total: <span className="font-semibold">{candidates.length}</span>
          </div>
        </div>

        <div className="mt-4 space-y-6">
          {["applied", "screen", "tech", "offer", "hired", "rejected"].map((st) => {
            const list = grouped[st] || [];
            if (list.length === 0) return null;
            return (
              <div key={st} className={`${cls.card} ${cls.cardPad}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${statusTone(st)}`}>
                      {st.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">({list.length})</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {list.map((c) => (
                    <div key={c.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-lg font-semibold">{c.name}</div>
                          <div className="text-sm text-gray-500">{c.email}</div>
                        </div>
                       <a
                            href="/Swaraj_Resume.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 text-sm hover:underline"
                            title="Resume"
                          >
                            View Resume
                          </a>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-gray-500">Degree</div>
                          <div className="font-medium">{c.academic.degree}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">University</div>
                          <div className="font-medium">{c.academic.university}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">CGPA</div>
                          <div className="font-medium">{c.academic.cgpa}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Graduation</div>
                          <div className="font-medium">{c.academic.graduationYear}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Experience</div>
                          <div className="font-medium">{c.experienceYears} yrs</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Skills</div>
                          <div className="font-medium">{c.skills.join(", ")}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {candidates.length === 0 && (
            <div className={`${cls.card} ${cls.cardPad}`}>
              <p className="text-gray-500">No applicants yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
