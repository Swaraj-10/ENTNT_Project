import { useState, useEffect } from "react";

export default function Toast({ message, type = "info", duration = 3000 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  const colors =
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-blue-500";

  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-2 rounded-md text-white shadow-md ${colors}`}
    >
      {message}
    </div>
  );
}
