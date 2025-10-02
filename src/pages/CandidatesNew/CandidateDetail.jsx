import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCandidateById, updateCandidate } from "../../api/candidatesApi";

const MENTION_USERS = [
  { id: "u1", name: "Priya Singh" },
  { id: "u2", name: "Rahul Mehta" },
  { id: "u3", name: "Aisha Khan" },
  { id: "u4", name: "Vikram Joshi" },
];

function MentionInput({ value, onChange, onSubmit }) {
  const [anchorIdx, setAnchorIdx] = useState(-1); // index of '@'
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const suggestions = useMemo(() => {
    if (!open || !query) return [];
    const q = query.toLowerCase();
    return MENTION_USERS.filter((u) => u.name.toLowerCase().includes(q)).slice(0, 6);
  }, [query, open]);

  const handleChange = (e) => {
    const v = e.target.value;
    onChange(v);
    const pos = e.target.selectionStart ?? v.length;

    // Find the last '@' before cursor which starts a mention token
    const lastAt = v.lastIndexOf("@", pos - 1);
    if (lastAt >= 0) {
      const after = v.slice(lastAt + 1, pos);
      // Stop if space/newline encountered or '@' is part of email-like token
      if (!/\s/.test(after) && after.length <= 32) {
        setAnchorIdx(lastAt);
        setQuery(after);
        setOpen(after.length > 0);
        return;
      }
    }
    setOpen(false);
    setQuery("");
    setAnchorIdx(-1);
  };

  const insertMention = (name) => {
    if (anchorIdx < 0) return;
    const before = value.slice(0, anchorIdx);
    const restStart = anchorIdx + 1 + query.length;
    const after = value.slice(restStart);
    const mentionToken = `@${name}`;
    const next = `${before}${mentionToken}${after}`;
    onChange(next);
    setOpen(false);
    setQuery("");
    setAnchorIdx(-1);
  };

  return (
    <div className="relative">
      <textarea
        rows={3}
        value={value}
        onChange={handleChange}
        placeholder="Add a note — use @ to mention someone"
        className="w-full px-3 py-2 border rounded-lg text-black dark:text-white bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {open && suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 max-h-60 overflow-auto w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow">
          {suggestions.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => insertMention(u.name)}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {u.name}
            </button>
          ))}
        </div>
      )}
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={onSubmit}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Add note
        </button>
      </div>
    </div>
  );
}

export default function CandidateDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [note, setNote] = useState("");

  const updMut = useMutation({
    mutationFn: updateCandidate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["candidates"] }),
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchCandidateById(id);
        setCandidate(data);
      } catch (e) {
        setErr(e.message || "Failed to load candidate");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const timeline = useMemo(() => {
    // Prefer backend-provided timeline if present
    if (candidate?.timeline?.length) return candidate.timeline;
    // Fallback to a single current stage entry
    if (candidate?.stage) {
      return [{ stage: candidate.stage, at: candidate.updatedAt || candidate.createdAt || "—", by: candidate.updatedBy || "System" }];
    }
    return [];
  }, [candidate]);

  const notes = candidate?.notes || [];

  const addNote = () => {
    const text = note.trim();
    if (!text || !candidate) return;
    const newNote = {
      id: String(Date.now()),
      text,
      at: new Date().toISOString(),
      by: "You",
    };
    const next = { ...candidate, notes: [newNote, ...notes] };
    setCandidate(next);
    setNote("");
    // Persist via your API (adjust as needed)
    updMut.mutate(next);
  };

  if (loading) return <p>Loading candidate...</p>;
  if (err) return <p className="text-red-500">{err}</p>;
  if (!candidate) return <p>Candidate not found.</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white">{candidate.name}</h2>
          <p className="text-gray-600 dark:text-gray-300">{candidate.appliedFor || "—"}</p>
        </div>
        <Link
          to="/candidates"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          ← Back
        </Link>
      </div>

      {/* Current status */}
      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
        <span className="font-semibold">Stage:</span>
        <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-700 dark:text-indigo-100">
          {candidate.stage || "Applied"}
        </span>
      </div>

      {/* Timeline */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Timeline</h3>
        <ol className="relative border-s border-gray-200 dark:border-gray-700">
          {timeline.length === 0 && (
            <li className="ms-4 my-2 text-gray-500">No timeline available.</li>
          )}
          {timeline.map((t) => (
            <li key={`${t.stage}-${t.at}`} className="ms-4 mb-6">
              <div className="absolute w-3 h-3 bg-blue-600 rounded-full mt-2 -start-1.5 border border-white dark:border-gray-900" />
              <time className="mb-1 text-xs text-gray-500">{t.at}</time>
              <h4 className="text-sm font-semibold">Moved to <span className="underline">{t.stage}</span></h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">by {t.by || "System"}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Notes with @mentions */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Notes</h3>
        <MentionInput value={note} onChange={setNote} onSubmit={addNote} />
        <div className="mt-4 space-y-3">
          {notes.length === 0 ? (
            <p className="text-gray-500">No notes yet.</p>
          ) : (
            notes.map((n) => (
              <div key={n.id} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500">{n.by} • {new Date(n.at).toLocaleString()}</div>
                <div className="whitespace-pre-wrap mt-1">
                  {/* simple render; mentions already in text as @Name */}
                  {n.text}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
