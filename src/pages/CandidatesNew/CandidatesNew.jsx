import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  useDroppable,
  useDraggable,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import CandidateForm from "./CandidateForm";
import Toast from "../../Components/Toast";

import {
  fetchCandidates,
  createCandidate,
  updateCandidate,
  toggleCandidateArchive,
} from "../../api/candidatesApi";

const STAGES = ["Applied", "Interviewing", "Offered", "Rejected"];

/* ---------- Draggable Card ---------- */
function KanbanCard({ candidate, stage }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: candidate.id,
    data: { candidate, fromStage: stage },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm hover:shadow transition text-sm"
    >
      <Link to={`/candidates/${candidate.id}`} className="font-semibold hover:underline">
        {candidate.name}
      </Link>
      <div className="text-xs text-gray-500">{candidate.appliedFor || "—"}</div>
      {candidate.tags?.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {candidate.tags.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-700 dark:text-indigo-100 text-[10px]"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Droppable Column ---------- */
function KanbanColumn({ stage, items, children }) {
  const { isOver, setNodeRef } = useDroppable({ id: stage });

  return (
    <div className="flex-1 min-w-[260px]">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{stage}</h3>
        <span className="text-xs text-gray-500">{items.length}</span>
      </div>

      <div
        ref={setNodeRef}
        className={[
          "space-y-2 rounded-lg p-2 min-h-[220px] border border-dashed",
          "bg-gray-50 dark:bg-gray-900/40",
          isOver ? "ring-2 ring-blue-500 border-blue-400" : "border-gray-300 dark:border-gray-700",
        ].join(" ")}
      >
        {children}
        {/* Empty column hint */}
        {items.length === 0 && !isOver && (
          <div className="text-xs text-gray-400 text-center py-6">Drop here</div>
        )}
      </div>
    </div>
  );
}

export default function CandidatesNew() {
  const qc = useQueryClient();
  const [toast, setToast] = useState(null);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeCard, setActiveCard] = useState(null); // for overlay preview

  /* ----------- Data ----------- */
  const {
    data: candidates = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["candidates"],
    queryFn: fetchCandidates,
  });

  const createMut = useMutation({
    mutationFn: createCandidate,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["candidates"] });
      setToast({ message: "Candidate created successfully!", type: "success" });
    },
    onError: () => setToast({ message: "Failed to create candidate", type: "error" }),
  });

  const updateMut = useMutation({
    mutationFn: updateCandidate,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["candidates"] });
      setToast({ message: "Candidate updated successfully!", type: "success" });
    },
    onError: () => setToast({ message: "Failed to update candidate", type: "error" }),
  });

  const archiveMut = useMutation({
    mutationFn: toggleCandidateArchive,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["candidates"] });
      setToast({ message: "Candidate status updated!", type: "success" });
    },
    onError: () => setToast({ message: "Failed to update candidate status", type: "error" }),
  });

  /* ----------- Derived: group by stage ----------- */
  const byStage = useMemo(() => {
    const map = Object.fromEntries(STAGES.map((s) => [s, []]));
    candidates.forEach((c) => {
      const s = STAGES.includes(c.stage) ? c.stage : "Applied";
      map[s].push(c);
    });
    return map;
  }, [candidates]);

  /* ----------- Modal handlers ----------- */
  const openForCreate = () => {
    setEditingCandidate(null);
    setIsFormOpen(true);
  };
  const openForEdit = (cand) => {
    setEditingCandidate(cand);
    setIsFormOpen(true);
  };
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCandidate(null);
  };
  const handleSubmit = (values) => {
    if (editingCandidate) {
      updateMut.mutate({ ...editingCandidate, ...values });
    } else {
      createMut.mutate(values);
    }
    closeForm();
  };

  /* ----------- DnD ----------- */
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event) => {
    setActiveCard(event.active?.data?.current?.candidate || null);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveCard(null);
    if (!over) return;

    const toStage = over.id; // column ids are stage names
    if (!STAGES.includes(toStage)) return; // ignore drops outside columns

    const moving = candidates.find((c) => c.id === active.id);
    if (!moving || moving.stage === toStage) return;

    // Optimistic update
    const next = candidates.map((c) =>
      c.id === moving.id
        ? {
            ...c,
            stage: toStage,
            timeline: [
              ...(c.timeline || []),
              { stage: toStage, at: new Date().toISOString(), by: "You" },
            ],
          }
        : c
    );
    qc.setQueryData(["candidates"], next);

    // Persist
    updateMut.mutate({
      ...moving,
      stage: toStage,
      timeline: [
        ...(moving.timeline || []),
        { stage: toStage, at: new Date().toISOString(), by: "You" },
      ],
    });
  };

  if (isLoading) return <p>Loading candidates...</p>;
  if (error) return <p className="text-red-500">Error loading candidates</p>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Candidates</h2>
        <button
          onClick={openForCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Candidate
        </button>
      </div>

      {/* Kanban board */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {STAGES.map((stage) => (
            <KanbanColumn key={stage} stage={stage} items={byStage[stage]}>
              {byStage[stage].map((c) => (
                <KanbanCard key={c.id} candidate={c} stage={stage} />
              ))}
            </KanbanColumn>
          ))}
        </div>

        {/* Drag preview */}
        <DragOverlay>
          {activeCard ? (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow text-sm opacity-90">
              <div className="font-semibold">{activeCard.name}</div>
              <div className="text-xs text-gray-500">{activeCard.appliedFor || "—"}</div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Modal form */}
      {isFormOpen && (
        <CandidateForm onSubmit={handleSubmit} editingCandidate={editingCandidate} onClose={closeForm} />
      )}

      {/* Optional: actions on cards (edit/archive) — if you have a list elsewhere */}
      {/* Example: <button onClick={() => openForEdit(c)}>Edit</button>
                 <button onClick={() => archiveMut.mutate(c)}>Archive</button> */}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
