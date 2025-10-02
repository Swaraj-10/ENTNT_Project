import { useState, useEffect } from "react";
import { cls, btn } from "../../Components/ui";

export default function JobForm({ onSubmit, editingJob, clearEdit }) {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingJob) {
      setTitle(editingJob.title);
      setTags(editingJob.tags?.join(", ") || "");
      setSlug(editingJob.slug || "");
    } else {
      setTitle("");
      setTags("");
      setSlug("");
      setError("");
    }
  }, [editingJob]);

  useEffect(() => {
    if (!editingJob) {
      const newSlug = title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      setSlug(newSlug);
    }
  }, [title, editingJob]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return setError("⚠️ Title is required");
    if (!slug.trim()) return setError("⚠️ Slug could not be generated");

    onSubmit({
      title: title.trim(),
      slug,
      tags: tags ? tags.split(",").map((t) => t.trim()) : [],
      status: editingJob ? editingJob.status : "active",
      id: editingJob ? editingJob.id : Date.now(),
    });
    clearEdit?.();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Job title"
        className={cls.input}
      />
      <input
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Tags (comma-separated)"
        className={cls.input}
      />
      {/* <input
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder="Slug"
        className={cls.input}
      /> */}

      {/* <div className="flex gap-2">
        <button type="submit" className={btn(editingJob ? "primary" : "success")}>
          {editingJob ? "Update" : "Create"}
        </button>
        {editingJob && (
          <button type="button" onClick={clearEdit} className={btn("secondary")}>
            Cancel
          </button>
        )}
      </div>

      {error && <p className="text-red-500 md:ml-2">{error}</p>} */}
    </form>
  );
}
