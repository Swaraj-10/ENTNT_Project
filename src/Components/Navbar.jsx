import { Link, useLocation } from "react-router-dom";
import { useDarkMode } from "../hooks/useDarkMode";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";

export default function Navbar() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Jobs", path: "/jobs" },
    { name: "Candidates", path: "/candidates" },
    { name: "Assessments", path: "/assessments" },
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <h1 className="text-2xl font-bold">TalentFlow</h1>
      <div className="flex items-center gap-6">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`hover:underline ${
              location.pathname === item.path ? "font-semibold underline" : ""
            }`}
          >
            {item.name}
          </Link>
        ))}

        <button
          onClick={toggleDarkMode}
          className="ml-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
        >
          {darkMode ? (
            <SunIcon className="h-5 w-5 text-yellow-300" />
          ) : (
            <MoonIcon className="h-5 w-5 text-gray-200" />
          )}
        </button>
      </div>
    </nav>
  );
}
