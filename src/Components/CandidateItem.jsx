import { Link } from "react-router-dom";

export default function CandidateItem({ candidate, onEdit, onArchive }) {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 shadow rounded flex justify-between items-center">
      <div>
        <h3 className="font-semibold text-lg">{candidate.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Status:{" "}
          <span
            className={`px-2 py-1 rounded text-white ${
              candidate.status === "active" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {candidate.status}
          </span>
        </p>
      </div>
      <div className="flex gap-2">
        <Link
          to={`/candidates/${candidate.id}`}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          View
        </Link>
        <button
          onClick={() => onEdit(candidate)}
          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Edit
        </button>
        <button
          onClick={() => onArchive(candidate)}
          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          {candidate.status === "active" ? "Archive" : "Unarchive"}
        </button>
      </div>
    </div>
  );
}
