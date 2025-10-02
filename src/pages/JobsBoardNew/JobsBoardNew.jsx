import { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import JobItem from "../../components/JobItem";
import Pagination from "../../components/Pagination";
import Toast from "../../Components/Toast";
import {
  fetchJobs,
  createJob,
  updateJob,
  toggleArchive,
  reorderJobs,
} from "../../api/jobsApi";
import { cls } from "../../Components/ui";

/* ---------- helpers ---------- */
const tokenizeTags = (tags) => {
  if (!tags) return [];
  const raw = Array.isArray(tags) ? tags.join(" ") : String(tags);
  return raw
    .toLowerCase()
    .replace(/[#@]/g, "")
    .replace(/[,\s/._-]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
};

function SortableRow({ job, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: job.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    willChange: "transform",
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

export default function JobsBoardNew() {
  const queryClient = useQueryClient();

  // pagination + toast
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);

  // filters (server-driven now)
  const [titleQuery, setTitleQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tagQuery, setTagQuery] = useState("");

  // create dialog state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newStatus, setNewStatus] = useState("active");
  const [newTags, setNewTags] = useState("");
  const [formErr, setFormErr] = useState("");

  // combine title + tags into a single search term for backend,
  // because the API supports a single "search" param (matches title/tags).
  const search = useMemo(() => {
    const t = titleQuery.trim();
    const tags = tagQuery.trim();
    return [t, tags].filter(Boolean).join(" ").trim();
  }, [titleQuery, tagQuery]);

  // Reset to page 1 whenever filters change (prevents empty pages)
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  // Load jobs (now includes filters in the key and the request)
  const {
    data: jobsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["jobs", page, search, statusFilter],
    queryFn: () =>
      fetchJobs(
        page,
        5,
        {
          search,
          status: statusFilter === "all" ? "" : statusFilter,
          sort: "order",
        }
      ),
    keepPreviousData: true,
  });

  // If we navigated past the last page (e.g., filters reduced results), clamp
  useEffect(() => {
    const total = jobsData?.totalPages || 1;
    if (page > total) setPage(total);
  }, [jobsData?.totalPages, page]);

  /* ---------- mutations ---------- */
  const mutationCreate = useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setToast({ message: "✅ Job created", type: "success" });
    },
    onError: () => setToast({ message: "❌ Failed to create job", type: "error" }),
  });

  const mutationUpdate = useMutation({
    mutationFn: updateJob,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["jobs"] }),
    onError: () => setToast({ message: "❌ Failed to update job", type: "error" }),
  });

  const mutationArchive = useMutation({
    mutationFn: toggleArchive,
    onMutate: async (job) => {
      const key = ["jobs", page, search, statusFilter];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      if (!previous?.jobs) return { previous };
      const next = {
        ...previous,
        jobs: previous.jobs.map((j) =>
          j.id === job.id
            ? { ...j, status: j.status === "active" ? "archived" : "active" }
            : j
        ),
      };
      queryClient.setQueryData(key, next);
      return { previous };
    },
    onError: (_err, _job, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["jobs", page, search, statusFilter], ctx.previous);
      setToast({ message: "❌ Archive toggle failed. Rolled back.", type: "error" });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["jobs"] }),
  });

  const mutationReorder = useMutation({
    mutationFn: reorderJobs, // expects { id, fromOrder, toOrder }
    onMutate: async ({ fromIndex, toIndex }) => {
      const key = ["jobs", page, search, statusFilter];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      if (!previous?.jobs) return { previous };
      if (fromIndex < 0 || toIndex < 0) return { previous };

      const reordered = arrayMove(previous.jobs.slice(), fromIndex, toIndex)
        .map((j, i) => ({ ...j, order: i + 1 })); // keep order in sync optimistically

      queryClient.setQueryData(key, { ...previous, jobs: reordered });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(["jobs", page, search, statusFilter], ctx.previous);
      }
      setToast({ message: "❌ Reorder failed. Rolled back.", type: "error" });
    },
    onSuccess: () => setToast({ message: "✅ Order saved", type: "success" }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["jobs"] }),
  });

  /* ---------- DnD ---------- */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event) => {
    const list = jobsData?.jobs || [];
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const fromIndex = list.findIndex((j) => j.id === active.id);
    const toIndex = list.findIndex((j) => j.id === over.id);
    if (fromIndex === -1 || toIndex === -1) return;

    const fromOrder = list[fromIndex]?.order ?? fromIndex + 1;
    const toOrder = list[toIndex]?.order ?? toIndex + 1;

    // send both indices (for optimistic UI) and orders (for API)
    mutationReorder.mutate({ id: active.id, fromIndex, toIndex, fromOrder, toOrder });
  };

  /* ---------- create dialog helpers ---------- */
  useEffect(() => {
    setNewSlug(
      newTitle.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    );
  }, [newTitle]);

  const openCreate = () => {
    setIsCreateOpen(true);
    setNewTitle("");
    setNewSlug("");
    setNewStatus("active");
    setNewTags("");
    setFormErr("");
  };
  const closeCreate = () => {
    setIsCreateOpen(false);
    setFormErr("");
  };
  const slugExistsOnPage = (slug) =>
    (jobsData?.jobs || []).some((j) => (j.slug || "").toLowerCase() === slug.toLowerCase());

  const onCreateSubmit = (e) => {
    e.preventDefault();
    const title = newTitle.trim();
    const slug = newSlug.trim();
    if (!title) return setFormErr("Title is required.");
    if (!slug) return setFormErr("Slug is required.");
    if (slugExistsOnPage(slug)) return setFormErr("Slug must be unique.");

    const tags = tokenizeTags(newTags);
    mutationCreate.mutate(
      { title, slug, status: newStatus, tags },
      { onSuccess: () => closeCreate() }
    );
  };

  const list = jobsData?.jobs || [];
  const itemsIds = list.map((j) => j.id);

  return (
    <div className={cls.container}>
      {/* Header */}
      <div className={cls.sectionHeader}>
        <h2 className={`${cls.h1} bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent`}>
          Jobs Board
        </h2>

        {/* Controls (now server-backed) */}
        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          <input
            type="text"
            placeholder="Search by title…"
            value={titleQuery}
            onChange={(e) => setTitleQuery(e.target.value)}
            className={cls.input}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={cls.select}
            title="Filter by status"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
          <input
            type="text"
            placeholder="Search by tags (comma/space/slash)…"
            value={tagQuery}
            onChange={(e) => setTagQuery(e.target.value)}
            className={cls.input}
          />
          <button
            onClick={openCreate}
            className="px-4 w-46 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
             Create Job
          </button>
        </div>
      </div>

      {/* Jobs List */}
      <div className="mt-6">
        {isLoading && <p className="text-gray-500">Loading jobs...</p>}
        {error && <p className="text-red-500">Error loading jobs</p>}
        {!isLoading && list.length === 0 && (
          <div className={`${cls.card} ${cls.cardPad}`}>
            <p className="text-gray-500">No jobs found.</p>
          </div>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={itemsIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {list.map((job) => (
                <SortableRow key={job.id} job={job}>
                  <JobItem job={job} onEdit={() => {}} onArchive={(j) => mutationArchive.mutate(j)} />
                </SortableRow>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Pagination */}
      <div className="mt-8">
        <Pagination
          currentPage={page}
          totalPages={jobsData?.totalPages || 1}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* Create Job Dialog */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className={`${cls.card} ${cls.cardPad} w-full max-w-md`}>
            <h3 className="text-xl font-semibold mb-4">Create New Job</h3>

            <form onSubmit={onCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  className={cls.input}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Frontend Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Unique Slug</label>
                <input
                  className={cls.input}
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  placeholder="frontend-engineer"
                />
                {newSlug && slugExistsOnPage(newSlug) && (
                  <p className="text-xs text-red-500 mt-1">Slug already exists on this page.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  className={cls.select}
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags</label>
                <input
                  className={cls.input}
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="react, ui-ux, remote"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate with commas, spaces, slashes, dashes, or underscores.
                </p>
              </div>

              {formErr && <p className="text-red-500 text-sm">{formErr}</p>}

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeCreate}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50">
          <Toast message={toast.message} type={toast.type} />
        </div>
      )}
    </div>
  );
}
