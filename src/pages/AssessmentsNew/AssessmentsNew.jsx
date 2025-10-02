import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/** localStorage key shared with AssessmentDetail.jsx */
const LS_KEY = "assessments:v1";

/* ---------- storage helpers ---------- */
const loadAssessments = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
};
const saveAssessments = (assessments) => {
  localStorage.setItem(LS_KEY, JSON.stringify(assessments));
};

/* ---------- small utils ---------- */
const newId = (p) => `${p}_${Math.random().toString(36).slice(2, 8)}`;

function Badge({ status }) {
  const cls =
    status === "active"
      ? "bg-green-100 text-green-700"
      : "bg-gray-200 text-gray-700";
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

export default function AssessmentsNew() {
  const navigate = useNavigate();

  const [items, setItems] = useState(loadAssessments());
  const [qTitle, setQTitle] = useState("");
  const [status, setStatus] = useState("all");

  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [draft, setDraft] = useState(null); // the assessment being edited/created

  useEffect(() => {
    saveAssessments(items);
  }, [items]);

  const list = useMemo(
    () =>
      items
        .filter((a) =>
          qTitle ? a.title?.toLowerCase().includes(qTitle.toLowerCase()) : true
        )
        .filter((a) => (status === "all" ? true : a.status === status)),
    [items, qTitle, status]
  );

  /* ---------- actions ---------- */
  const createNew = () => {
    setDraft({
      id: Date.now(),
      title: "",
      job: "",
      status: "active",
      sections: [],
    });
    setIsBuilderOpen(true);
  };

  const onEdit = (a) => {
    setDraft(JSON.parse(JSON.stringify(a))); // deep clone
    setIsBuilderOpen(true);
  };

  const onToggleArchive = (id) => {
    setItems((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: a.status === "active" ? "archived" : "active" }
          : a
      )
    );
  };

  const onSaveBuilder = () => {
    if (!draft.title?.trim()) return; // minimal guard
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.id === draft.id);
      if (idx === -1) return [draft, ...prev];
      const cp = [...prev];
      cp[idx] = draft;
      return cp;
    });
    setIsBuilderOpen(false);
    setDraft(null);
  };

  const onCancelBuilder = () => {
    setIsBuilderOpen(false);
    setDraft(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* header/filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold">Assessments</h2>
          <p className="text-sm text-gray-500">Build, preview, and manage per-job assessments.</p>
        </div>
        <div className="flex gap-2">
          <input
            value={qTitle}
            onChange={(e) => setQTitle(e.target.value)}
            placeholder="Search title…"
            className="px-3 py-2 border rounded"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 border rounded"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
          <button
            onClick={createNew}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            + New Assessment
          </button>
        </div>
      </div>

      {/* cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((a) => (
          <div
            key={a.id}
            className="p-5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{a.title || "Untitled"}</h3>
                <div className="text-sm text-gray-500">Job: {a.job || "—"}</div>
              </div>
              <Badge status={a.status} />
            </div>

            <div className="mt-3 text-xs text-gray-500">
              Sections: {a.sections?.length || 0}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => navigate(`/assessments/${a.id}`)}
                className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 text-sm"
              >
                View
              </button>
              <button
                onClick={() => onEdit(a)}
                className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => onToggleArchive(a.id)}
                className="px-3 py-1 rounded bg-gray-600 text-white hover:bg-gray-700 text-sm"
              >
                {a.status === "active" ? "Archive" : "Unarchive"}
              </button>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <div className="col-span-full text-gray-500">No assessments found.</div>
        )}
      </div>

      {/* builder modal */}
      {isBuilderOpen && draft && (
        <BuilderModal draft={draft} setDraft={setDraft} onSave={onSaveBuilder} onCancel={onCancelBuilder} />
      )}
    </div>
  );
}

/* =========================
   Builder + Live Preview
   ========================= */

function BuilderModal({ draft, setDraft, onSave, onCancel }) {
  const addSection = () => {
    setDraft((d) => ({
      ...d,
      sections: [...(d.sections || []), { id: newId("s"), title: "New Section", questions: [] }],
    }));
  };
  const updateSection = (sid, patch) => {
    setDraft((d) => ({
      ...d,
      sections: d.sections.map((s) => (s.id === sid ? { ...s, ...patch } : s)),
    }));
  };
  const removeSection = (sid) => {
    setDraft((d) => ({ ...d, sections: d.sections.filter((s) => s.id !== sid) }));
  };
  const addQuestion = (sid, type) => {
    const base = {
      id: newId("q"),
      type, // single|multi|short|long|number|file
      label: "Untitled Question",
      required: false,
    };
    const extra =
      type === "single" || type === "multi"
        ? { options: ["Option 1", "Option 2"] }
        : type === "number"
        ? { min: null, max: null }
        : type === "short" || type === "long"
        ? { maxLength: null }
        : {}; // file
    setDraft((d) => ({
      ...d,
      sections: d.sections.map((s) =>
        s.id === sid ? { ...s, questions: [...s.questions, { ...base, ...extra }] } : s
      ),
    }));
  };
  const updateQuestion = (sid, qid, patch) => {
    setDraft((d) => ({
      ...d,
      sections: d.sections.map((s) =>
        s.id === sid
          ? { ...s, questions: s.questions.map((q) => (q.id === qid ? { ...q, ...patch } : q)) }
          : s
      ),
    }));
  };
  const removeQuestion = (sid, qid) => {
    setDraft((d) => ({
      ...d,
      sections: d.sections.map((s) =>
        s.id === sid ? { ...s, questions: s.questions.filter((q) => q.id !== qid) } : s
      ),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        {/* header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex flex-col md:flex-row gap-2 md:items-center">
            <input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Assessment title"
              className="px-3 py-2 border rounded"
            />
            <input
              value={draft.job}
              onChange={(e) => setDraft({ ...draft, job: e.target.value })}
              placeholder="Linked job"
              className="px-3 py-2 border rounded"
            />
            <select
              value={draft.status}
              onChange={(e) => setDraft({ ...draft, status: e.target.value })}
              className="px-3 py-2 border rounded"
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={onCancel} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
            >
              Save
            </button>
          </div>
        </div>

        {/* body: builder | preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* builder side */}
          <div className="p-4 border-r border-gray-200 dark:border-gray-700">
            <div className="mb-3 flex justify-between items-center">
              <h4 className="font-semibold">Sections</h4>
              <button
                onClick={addSection}
                className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
              >
                + Section
              </button>
            </div>

            <div className="space-y-4">
              {(draft.sections || []).map((s) => (
                <div key={s.id} className="border border-gray-200 dark:border-gray-700 rounded p-3">
                  <div className="flex gap-2 items-center mb-2">
                    <input
                      value={s.title}
                      onChange={(e) => updateSection(s.id, { title: e.target.value })}
                      placeholder="Section title"
                      className="px-3 py-2 border rounded flex-1"
                    />
                    <button
                      onClick={() => removeSection(s.id)}
                      className="px-2 py-1 rounded bg-red-600 text-white text-xs"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="flex gap-2 mb-2">
                    {["single", "multi", "short", "long", "number", "file"].map((t) => (
                      <button
                        key={t}
                        onClick={() => addQuestion(s.id, t)}
                        className="px-2 py-1 rounded bg-gray-100 text-xs border"
                        title={`Add ${t}`}
                      >
                        + {t}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {(s.questions || []).map((q) => (
                      <div key={q.id} className="rounded border border-gray-200 dark:border-gray-700 p-3">
                        <div className="flex gap-2 items-center">
                          <span className="text-xs px-2 py-0.5 rounded bg-gray-100 border">{q.type}</span>
                          <input
                            value={q.label}
                            onChange={(e) => updateQuestion(s.id, q.id, { label: e.target.value })}
                            placeholder="Question label"
                            className="px-3 py-2 border rounded flex-1"
                          />
                          <label className="text-xs flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={!!q.required}
                              onChange={(e) => updateQuestion(s.id, q.id, { required: e.target.checked })}
                            />
                            required
                          </label>
                          <button
                            onClick={() => removeQuestion(s.id, q.id)}
                            className="px-2 py-1 rounded bg-red-600 text-white text-xs"
                          >
                            Delete
                          </button>
                        </div>

                        {(q.type === "single" || q.type === "multi") && (
                          <div className="mt-2">
                            <label className="text-xs block mb-1">Options (comma separated)</label>
                            <input
                              value={(q.options || []).join(", ")}
                              onChange={(e) =>
                                updateQuestion(s.id, q.id, {
                                  options: e.target.value
                                    .split(",")
                                    .map((x) => x.trim())
                                    .filter(Boolean),
                                })
                              }
                              className="px-3 py-2 border rounded w-full"
                            />
                          </div>
                        )}

                        {(q.type === "short" || q.type === "long") && (
                          <div className="mt-2">
                            <label className="text-xs block mb-1">Max length</label>
                            <input
                              type="number"
                              value={q.maxLength ?? ""}
                              onChange={(e) =>
                                updateQuestion(s.id, q.id, {
                                  maxLength: e.target.value === "" ? null : Number(e.target.value),
                                })
                              }
                              className="px-3 py-2 border rounded w-40"
                            />
                          </div>
                        )}

                        {q.type === "number" && (
                          <div className="mt-2 flex gap-2">
                            <div>
                              <label className="text-xs block mb-1">Min</label>
                              <input
                                type="number"
                                value={q.min ?? ""}
                                onChange={(e) =>
                                  updateQuestion(s.id, q.id, {
                                    min: e.target.value === "" ? null : Number(e.target.value),
                                  })
                                }
                                className="px-3 py-2 border rounded w-32"
                              />
                            </div>
                            <div>
                              <label className="text-xs block mb-1">Max</label>
                              <input
                                type="number"
                                value={q.max ?? ""}
                                onChange={(e) =>
                                  updateQuestion(s.id, q.id, {
                                    max: e.target.value === "" ? null : Number(e.target.value),
                                  })
                                }
                                className="px-3 py-2 border rounded w-32"
                              />
                            </div>
                          </div>
                        )}

                        {/* Conditional visibility */}
                        <div className="mt-3 border-t pt-3">
                          <div className="text-xs font-semibold mb-1">Conditional visibility</div>
                          <div className="flex flex-col md:flex-row gap-2">
                            <input
                              value={q.visibleIf?.questionId || ""}
                              onChange={(e) =>
                                updateQuestion(s.id, q.id, {
                                  visibleIf: { ...(q.visibleIf || {}), questionId: e.target.value || undefined },
                                })
                              }
                              placeholder="Depends on Question ID (e.g., q_abc123)"
                              className="px-3 py-2 border rounded"
                            />
                            <input
                              value={q.visibleIf?.equals || ""}
                              onChange={(e) =>
                                updateQuestion(s.id, q.id, {
                                  visibleIf: { ...(q.visibleIf || {}), equals: e.target.value || undefined },
                                })
                              }
                              placeholder='Show when answer equals (e.g., "Yes")'
                              className="px-3 py-2 border rounded"
                            />
                            <button
                              type="button"
                              onClick={() => updateQuestion(s.id, q.id, { visibleIf: undefined })}
                              className="px-2 py-1 text-xs rounded border"
                            >
                              Clear
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {s.questions?.length === 0 && (
                      <div className="text-xs text-gray-500">No questions yet.</div>
                    )}
                  </div>
                </div>
              ))}
              {(draft.sections || []).length === 0 && (
                <div className="text-gray-500 text-sm">No sections yet.</div>
              )}
            </div>
          </div>

          {/* preview side */}
          <div className="p-4">
            <h4 className="font-semibold mb-2">Live Preview</h4>
            <Preview assessment={draft} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Live preview form (fillable) ---------- */
function isVisible(q, values) {
  if (!q?.visibleIf || !q.visibleIf.questionId) return true;
  const dep = values[q.visibleIf.questionId];
  return Array.isArray(dep) ? dep.includes(q.visibleIf.equals) : dep === q.visibleIf.equals;
}

function Preview({ assessment }) {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const setValue = (qid, v) => setValues((x) => ({ ...x, [qid]: v }));

  const validate = () => {
    const errs = {};
    for (const s of assessment.sections || []) {
      for (const q of s.questions || []) {
        if (!isVisible(q, values)) continue;
        const v = values[q.id];
        if (q.required) {
          const empty =
            v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);
          if (empty) {
            errs[q.id] = "This field is required.";
            continue;
          }
        }
        if ((q.type === "short" || q.type === "long") && q.maxLength != null) {
          if ((v || "").length > q.maxLength) errs[q.id] = `Max length is ${q.maxLength}`;
        }
        if (q.type === "number" && v !== "" && v != null) {
          const num = Number(v);
          if (Number.isNaN(num)) errs[q.id] = "Must be a number.";
          else {
            if (q.min != null && num < q.min) errs[q.id] = `Min is ${q.min}`;
            if (q.max != null && num > q.max) errs[q.id] = `Max is ${q.max}`;
          }
        }
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    // Preview only; do nothing on submit
  };

  const inputBase = "px-3 py-2 border rounded w-full";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {(assessment.sections || []).map((s) => (
        <div key={s.id} className="border rounded p-3">
          <div className="font-semibold mb-2">{s.title || "Section"}</div>
          <div className="space-y-3">
            {(s.questions || []).map((q) => {
              if (!isVisible(q, values)) return null;
              const err = errors[q.id];

              if (q.type === "single") {
                return (
                  <div key={q.id}>
                    <label className="font-medium">{q.label}</label>
                    <div className="mt-1 space-y-1">
                      {(q.options || []).map((opt) => (
                        <label key={opt} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`${s.id}-${q.id}`}
                            checked={values[q.id] === opt}
                            onChange={() => setValue(q.id, opt)}
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                    {err && <div className="text-xs text-red-600 mt-1">{err}</div>}
                  </div>
                );
              }

              if (q.type === "multi") {
                const curr = Array.isArray(values[q.id]) ? values[q.id] : [];
                const toggle = (opt) => {
                  setValue(q.id, curr.includes(opt) ? curr.filter((x) => x !== opt) : [...curr, opt]);
                };
                return (
                  <div key={q.id}>
                    <label className="font-medium">{q.label}</label>
                    <div className="mt-1 space-y-1">
                      {(q.options || []).map((opt) => (
                        <label key={opt} className="flex items-center gap-2">
                          <input type="checkbox" checked={curr.includes(opt)} onChange={() => toggle(opt)} />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                    {err && <div className="text-xs text-red-600 mt-1">{err}</div>}
                  </div>
                );
              }

              if (q.type === "short") {
                return (
                  <div key={q.id}>
                    <label className="font-medium">{q.label}</label>
                    <input
                      className={inputBase}
                      value={values[q.id] || ""}
                      onChange={(e) => setValue(q.id, e.target.value)}
                      maxLength={q.maxLength || undefined}
                    />
                    {q.maxLength && (
                      <div className="text-[10px] text-gray-500">
                        {String(values[q.id] || "").length}/{q.maxLength}
                      </div>
                    )}
                    {err && <div className="text-xs text-red-600 mt-1">{err}</div>}
                  </div>
                );
              }

              if (q.type === "long") {
                return (
                  <div key={q.id}>
                    <label className="font-medium">{q.label}</label>
                    <textarea
                      className={inputBase}
                      rows={4}
                      value={values[q.id] || ""}
                      onChange={(e) => setValue(q.id, e.target.value)}
                      maxLength={q.maxLength || undefined}
                    />
                    {q.maxLength && (
                      <div className="text-[10px] text-gray-500">
                        {String(values[q.id] || "").length}/{q.maxLength}
                      </div>
                    )}
                    {err && <div className="text-xs text-red-600 mt-1">{err}</div>}
                  </div>
                );
              }

              if (q.type === "number") {
                return (
                  <div key={q.id}>
                    <label className="font-medium">{q.label}</label>
                    <input
                      className={inputBase}
                      type="number"
                      value={values[q.id] ?? ""}
                      onChange={(e) => setValue(q.id, e.target.value)}
                      min={q.min ?? undefined}
                      max={q.max ?? undefined}
                    />
                    {err && <div className="text-xs text-red-600 mt-1">{err}</div>}
                  </div>
                );
              }

              if (q.type === "file") {
                return (
                  <div key={q.id}>
                    <label className="font-medium">{q.label}</label>
                    <input
                      type="file"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        setValue(q.id, f ? { name: f.name, size: f.size } : null);
                      }}
                      className="block mt-1"
                    />
                    {values[q.id]?.name && (
                      <div className="text-xs text-gray-600 mt-1">
                        Selected: {values[q.id].name} ({values[q.id].size} bytes)
                      </div>
                    )}
                    {err && <div className="text-xs text-red-600 mt-1">{err}</div>}
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>
      ))}
      <div className="pt-1">
        <button className="px-4 py-2 rounded bg-gray-200" type="submit">Validate</button>
      </div>
    </form>
  );
}
