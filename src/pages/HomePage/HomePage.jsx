import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
        Welcome to TalentFlow 🚀
      </h1>

      <p className="text-lg mb-10 text-gray-700 dark:text-gray-300 max-w-2xl">
        Manage jobs, track candidates, and create assessments — all in one place.
      </p>

      <div className="flex space-x-6">
        <Link
          to="/jobs"
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
        >
          Jobs
        </Link>
        <Link
          to="/candidates"
          className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition"
        >
          Candidates
        </Link>
        <Link
          to="/assessments"
          className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition"
        >
          Assessments
        </Link>
      </div>
    </div>
  );
}
