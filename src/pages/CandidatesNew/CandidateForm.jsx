import { useState, useEffect } from "react";

export default function CandidateForm({ onSubmit, editingCandidate, onClose }) {
  const [name, setName] = useState("");
  const [appliedFor, setAppliedFor] = useState("");
  const [stage, setStage] = useState("Applied");

  useEffect(() => {
    if (editingCandidate) {
      setName(editingCandidate.name || "");
      setAppliedFor(editingCandidate.appliedFor || "");
      setStage(editingCandidate.stage || "Applied");
    } else {
      setName("");
      setAppliedFor("");
      setStage("Applied");
    }
  }, [editingCandidate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !appliedFor.trim()) return;

    onSubmit({ name: name.trim(), appliedFor: appliedFor.trim(), stage });
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">
          {editingCandidate ? "Edit Candidate" : "Add Candidate"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Candidate Name"
            className="w-full px-3 py-2 border rounded text-black"
          />
          <input
            type="text"
            value={appliedFor}
            onChange={(e) => setAppliedFor(e.target.value)}
            placeholder="Applied For (Job Title)"
            className="w-full px-3 py-2 border rounded text-black"
          />
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="w-full px-3 py-2 border rounded text-black"
          >
            <option>Applied</option>
            <option>Interviewing</option>
            <option>Offered</option>
            <option>Rejected</option>
          </select>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
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
