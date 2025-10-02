// src/components/ui.js
export const cls = {
  // Layout
  container: "max-w-5xl mx-auto p-6",
  sectionHeader: "flex flex-col md:flex-row justify-between items-center gap-4",
  // Card
  card: "bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200/60 dark:border-gray-700/60",
  cardPad: "p-6",
  // Headings
  h1: "text-3xl font-bold tracking-tight",
  h2: "text-2xl font-semibold",
  // Inputs
  input: "w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500",
  select: "w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500",
  // Buttons
  btnBase: "inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 transition",
  btn: {
    primary: "text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-600",
    secondary: "text-gray-900 bg-gray-200 hover:bg-gray-300 dark:text-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 focus:ring-gray-400",
    success: "text-white bg-green-600 hover:bg-green-700 focus:ring-green-600",
    danger: "text-white bg-red-600 hover:bg-red-700 focus:ring-red-600",
  },
  // Badges
  badge: "inline-block px-2 py-1 rounded text-xs font-semibold",
  badgeTone: {
    success: "bg-green-500 text-white",
    danger: "bg-red-500 text-white",
    info: "bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-100",
  },
  // Modal (dialog)
  modalBackdrop: "fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4",
  modalPanel: "w-full max-w-md mx-auto " + "bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200/60 dark:border-gray-700/60 p-6",
  modalActions: "mt-6 flex justify-end gap-2",
};
export const btn = (variant = "primary") => `${cls.btnBase} ${cls.btn[variant]}`;
