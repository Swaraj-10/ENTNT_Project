// src/pages/assessments/AssessmentDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

/* ---------- Local Storage ---------- */
const LS_ASSESSMENTS = "assessments:v1";
const LS_RESP_PREFIX = "assessment_responses:"; // + <assessmentId>

const loadAssessments = () => {
  try {
    const raw = localStorage.getItem(LS_ASSESSMENTS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
};

const loadResponses = (id) => {
  try {
    const raw = localStorage.getItem(LS_RESP_PREFIX + id);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
};

const saveResponses = (id, values) => {
  localStorage.setItem(LS_RESP_PREFIX + id, JSON.stringify(values));
};

/* ---------- Visibility (Conditionals) ---------- */
const isVisible = (q, values) => {
  if (!q?.visibleIf || !q.visibleIf.questionId) return true;
  const depVal = values[q.visibleIf.questionId];
  if (Array.isArray(depVal)) return depVal.includes(q.visibleIf.equals);
  return depVal === q.visibleIf.equals;
};

/* =====================================================
   Assessment Detail (view/run with edit + review modes)
   ===================================================== */
export default function AssessmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [mode, setMode] = useState("review"); // 'edit' | 'review'
  const [savedSnapshot, setSavedSnapshot] = useState({}); // last persisted copy

  // Load assessment + saved responses
  useEffect(() => {
    const list = loadAssessments();
    const a = list.find((x) => String(x.id) === String(id));
    setAssessment(a || null);

    const saved = loadResponses(id);
    setSavedSnapshot(saved);
    setValues(saved);

    // If no saved answers, start in edit mode
    const hasSaved = saved && Object.keys(saved).length > 0;
    setMode(hasSaved ? "review" : "edit");
  }, [id]);

  /* ---------- Helpers ---------- */
  const setValue = (qid, v) => setValues((prev) => ({ ...prev, [qid]: v }));

  const validate = () => {
    const errs = {};
    for (const s of assessment?.sections || []) {
      for (const q of s?.questions || []) {
        if (!isVisible(q, values)) continue;

        const v = values[q.id];

        // required
        if (q.required) {
          const empty =
            v === undefined ||
            v === null ||
            v === "" ||
            (Array.isArray(v) && v.length === 0);
          if (empty) {
            errs[q.id] = "This field is required.";
            continue;
          }
        }

        // text max length
        if ((q.type === "short" || q.type === "long") && q.maxLength != null) {
          if ((v || "").length > q.maxLength) {
            errs[q.id] = `Max length is ${q.maxLength} characters.`;
          }
        }

        // numeric range
        if (q.type === "number" && v !== "" && v != null) {
          const num = Number(v);
          if (Number.isNaN(num)) {
            errs[q.id] = "Must be a number.";
          } else {
            if (q.min != null && num < q.min) errs[q.id] = `Min is ${q.min}.`;
            if (q.max != null && num > q.max) errs[q.id] = `Max is ${q.max}.`;
          }
        }
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = (e) => {
    e?.preventDefault?.();
    if (!assessment) return;
    if (!validate()) return;
    saveResponses(id, values);
    setSavedSnapshot(values);
    setMode("review");
  };

  const startEdit = () => {
    // Reset to the last saved snapshot before editing
    const saved = loadResponses(id);
    setValues(saved);
    setErrors({});
    setMode("edit");
  };

  const cancelEdit = () => {
    // Discard unsaved changes, restore snapshot
    setValues(savedSnapshot);
    setErrors({});
    setMode("review");
  };

  if (!assessment) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 p-6 rounded shadow text-center">
          <div className="text-lg font-semibold">Assessment not found</div>
          <button
            onClick={() => navigate("/assessments")}
            className="mt-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const readOnly = mode !== "edit";
  const inputBase = "px-3 py-2 border rounded w-full";
  const hasSaved = Object.keys(savedSnapshot || {}).length > 0;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{assessment.title || "Untitled Assessment"}</h2>
          <div className="text-sm text-gray-500">Mode: {readOnly ? "Review" : "Editing"}</div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/assessments")}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Back
          </button>
          {readOnly ? (
            <button
              onClick={startEdit}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Edit Responses
            </button>
          ) : (
            <>
              <button
                onClick={cancelEdit}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={onSubmit}
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                type="button"
              >
                Save
              </button>
            </>
          )}
        </div>
      </div>

      {/* Runtime Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        {(assessment.sections || []).map((s) => (
          <div key={s.id} className="border rounded p-3">
            <div className="font-semibold mb-2">{s.title || "Section"}</div>

            <div className="space-y-3">
              {(s.questions || []).map((q) => {
                if (!isVisible(q, values)) return null;
                const err = errors[q.id];

                // Single choice
                if (q.type === "single") {
                  return (
                    <div key={q.id}>
                      <label className="font-medium">
                        {q.label} {q.required && <span className="text-red-500">*</span>}
                      </label>
                      <div className="mt-1 space-y-1">
                        {(q.options || []).map((opt) => (
                          <label key={opt} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`${s.id}-${q.id}`}
                              checked={values[q.id] === opt}
                              onChange={() => setValue(q.id, opt)}
                              disabled={readOnly}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                      {err && <div className="text-xs text-red-600 mt-1">{err}</div>}
                    </div>
                  );
                }

                // Multi choice
                if (q.type === "multi") {
                  const curr = Array.isArray(values[q.id]) ? values[q.id] : [];
                  const toggle = (opt) => {
                    if (readOnly) return;
                    setValue(
                      q.id,
                      curr.includes(opt) ? curr.filter((x) => x !== opt) : [...curr, opt]
                    );
                  };
                  return (
                    <div key={q.id}>
                      <label className="font-medium">
                        {q.label} {q.required && <span className="text-red-500">*</span>}
                      </label>
                      <div className="mt-1 space-y-1">
                        {(q.options || []).map((opt) => (
                          <label key={opt} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={curr.includes(opt)}
                              onChange={() => toggle(opt)}
                              disabled={readOnly}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                      {err && <div className="text-xs text-red-600 mt-1">{err}</div>}
                    </div>
                  );
                }

                // Short text
                if (q.type === "short") {
                  return (
                    <div key={q.id}>
                      <label className="font-medium">
                        {q.label} {q.required && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        className={inputBase}
                        value={values[q.id] || ""}
                        onChange={(e) => setValue(q.id, e.target.value)}
                        maxLength={q.maxLength || undefined}
                        disabled={readOnly}
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

                // Long text
                if (q.type === "long") {
                  return (
                    <div key={q.id}>
                      <label className="font-medium">
                        {q.label} {q.required && <span className="text-red-500">*</span>}
                      </label>
                      <textarea
                        className={inputBase}
                        rows={4}
                        value={values[q.id] || ""}
                        onChange={(e) => setValue(q.id, e.target.value)}
                        maxLength={q.maxLength || undefined}
                        disabled={readOnly}
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

                // Numeric
                if (q.type === "number") {
                  return (
                    <div key={q.id}>
                      <label className="font-medium">
                        {q.label} {q.required && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        className={inputBase}
                        type="number"
                        value={values[q.id] ?? ""}
                        onChange={(e) => setValue(q.id, e.target.value)}
                        min={q.min ?? undefined}
                        max={q.max ?? undefined}
                        disabled={readOnly}
                      />
                      {err && <div className="text-xs text-red-600 mt-1">{err}</div>}
                    </div>
                  );
                }

                // File upload (store name+size only)
                if (q.type === "file") {
                  return (
                    <div key={q.id}>
                      <label className="font-medium">
                        {q.label} {q.required && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="file"
                        disabled={readOnly}
                        onChange={(e) => {
                          if (readOnly) return;
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

        {/* Bottom actions duplicate for convenience */}
        <div className="flex gap-2">
          {readOnly ? (
            hasSaved && (
              <button
                type="button"
                onClick={startEdit}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Edit Responses
              </button>
            )
          ) : (
            <>
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              >
                Save
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
