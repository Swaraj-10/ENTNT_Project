import { useState, useEffect } from "react";

export default function AssessmentForm({ onSubmit, editingAssessment, clearEdit }) {
  const [title, setTitle] = useState("");
  const [job, setJob] = useState("");
  const [type, setType] = useState("MCQ");
  const [description, setDescription] = useState("");

  // Fill form if editing
  useEffect(() => {
    if (editingAssessment) {
      setTitle(editingAssessment.title);
      setJob(editingAssessment.job);
      setType(editingAssessment.type);
      setDescription(editingAssessment.description || "");
    } else {
      setTitle("");
      setJob("");
      setType("MCQ");
      setDescription("");
    }
  }, [editingAssessment]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !job.trim()) return;

    const assessment = {
      title: title.trim(),
      job: job.trim(),
      type,
      description: description.trim(),
      status: editingAssessment ? editingAssessment.status : "active",
      id: editingAssessment ? editingAssessment.id : Date.now(),
    };

    onSubmit(assessment);
    clearEdit();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
        <h3 className="text-xl font-semibold mb-4">
          {editingAssessment ? "Edit Assessment" : "Create Assessment"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Assessment Title"
            className="w-full px-3 py-2 border rounded text-black"
          />

          <input
            type="text"
            value={job}
            onChange={(e) => setJob(e.target.value)}
            placeholder="Linked Job (e.g. Frontend Developer)"
            className="w-full px-3 py-2 border rounded text-black"
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 border rounded text-black"
          >
            <option value="MCQ">MCQ</option>
            <option value="Coding">Coding</option>
            <option value="Case Study">Case Study</option>
          </select>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full px-3 py-2 border rounded text-black"
          />

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={clearEdit}
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
