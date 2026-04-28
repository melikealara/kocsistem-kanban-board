import { CSS } from "@dnd-kit/utilities"
import { useSortable } from "@dnd-kit/sortable"
import { useEffect, useRef, useState } from "react"
import { GripVertical, Pencil, Trash2, X } from "lucide-react"
import ReactMarkdown from "react-markdown"

const PRIORITY_STYLE = {
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-rose-100 text-rose-700",
}

function Card({ card, onDelete, onUpdate, canEdit = true, isOverlay = false }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: "card", columnId: card.column_id },
    disabled: isOverlay || !canEdit,
  })

  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [draft, setDraft] = useState({
    title: card.title,
    description: card.description,
    priority: card.priority,
  })
  const titleRef = useRef(null)

  useEffect(() => {
    if (isEditModalOpen) titleRef.current?.focus()
  }, [isEditModalOpen])

  const style = { transform: CSS.Transform.toString(transform), transition }

  const openEdit = (event) => {
    event.preventDefault()
    event.stopPropagation()
    setDraft({ title: card.title, description: card.description, priority: card.priority })
    setIsEditModalOpen(true)
  }

  const openModal = () => {
    setIsViewModalOpen(true)
  }

  const saveEdit = () => {
    const title = draft.title.trim()
    if (!title) {
      setDraft({ title: card.title, description: card.description, priority: card.priority })
      return
    }

    onUpdate(card.id, draft)
    setIsEditModalOpen(false)
  }

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      saveEdit()
    }
    if (event.key === "Escape") {
      event.preventDefault()
      setIsEditModalOpen(false)
    }
  }

  if (isOverlay) {
    return (
      <article className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
        <h4 className="text-sm font-semibold text-slate-800">{card.title}</h4>
        <p className="mt-1 text-xs text-slate-600">{card.priority}</p>
      </article>
    )
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={[
        "group rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm transition",
        "focus-within:ring-2 focus-within:ring-[#999999]",
        isDragging ? "opacity-35 shadow-none" : "opacity-100 hover:shadow-md",
      ].join(" ")}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${PRIORITY_STYLE[card.priority] || PRIORITY_STYLE.medium}`}
        >
          {card.priority}
        </span>
        {canEdit ? (
          <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
            <button
              type="button"
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-[#F9423A]"
              onClick={openEdit}
              aria-label="Edit card"
            >
              <Pencil size={14} />
            </button>
            <button
              type="button"
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-600"
              onClick={() => onDelete(card.id)}
              aria-label="Delete card"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={openModal}
          className="w-full rounded text-left transition hover:bg-slate-50"
        >
          <h4 className="text-sm font-semibold text-slate-800">{card.title}</h4>
          <p className="mt-1 text-xs text-slate-600">
            Created by {card.createdBy?.name || "-"} | Updated by {card.updatedBy?.name || "-"}
          </p>
        </button>
        {canEdit ? (
          <div
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            role="button"
            tabIndex={0}
            aria-label={`Drag ${card.title}`}
            style={{ touchAction: "none" }}
            className="inline-flex cursor-grab items-center gap-1 rounded border border-slate-200 px-2 py-1 text-[11px] text-[#999999] hover:border-[#999999]"
          >
            <GripVertical size={12} />
            Drag
          </div>
        ) : null}
      </div>

      {isViewModalOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">Card Details</h3>
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="rounded p-1 text-slate-500 hover:bg-slate-100"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold text-slate-500">Title</p>
              <h4 className="mt-1 text-base font-semibold text-slate-800">{card.title}</h4>
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold text-slate-700">Description</p>
              <div className="prose prose-sm mt-2 max-w-none text-slate-700">
                <ReactMarkdown>{card.description || "No description."}</ReactMarkdown>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600">
              <p>
                Created by: <span className="font-medium">{card.createdBy?.name || "-"}</span> -{" "}
                {card.createdBy?.at ? new Date(card.createdBy.at).toLocaleString("en-US") : "-"}
              </p>
              <p className="mt-1">
                Last updated by: <span className="font-medium">{card.updatedBy?.name || "-"}</span> -{" "}
                {card.updatedBy?.at ? new Date(card.updatedBy.at).toLocaleString("en-US") : "-"}
              </p>
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-700">Status Change History</p>
              <div className="mt-2 max-h-32 overflow-y-auto pr-2">
                {card.history?.length ? (
                  <ul className="list-disc space-y-1 pl-5">
                    {card.history.map((entry, index) => (
                      <li key={`${card.id}-history-${index}`}>{entry}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No movement history yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isEditModalOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl" onKeyDown={handleKeyDown}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">Edit Card</h3>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false)
                }}
                className="rounded p-1 text-slate-500 hover:bg-slate-100"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2">
              <input
                ref={titleRef}
                value={draft.title}
                onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F9423A]"
                placeholder="Title"
              />
              <textarea
                value={draft.description}
                onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
                rows={7}
                className="w-full resize-none rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F9423A]"
                placeholder="Description (Markdown supported)"
              />
              <select
                value={draft.priority}
                onChange={(event) => setDraft((prev) => ({ ...prev, priority: event.target.value }))}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F9423A]"
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold text-slate-700">Markdown Preview</p>
              <div className="prose prose-sm mt-2 max-w-none text-slate-700">
                <ReactMarkdown>{draft.description || "No description."}</ReactMarkdown>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600">
              <p>
                Created by: <span className="font-medium">{card.createdBy?.name || "-"}</span> -{" "}
                {card.createdBy?.at ? new Date(card.createdBy.at).toLocaleString("en-US") : "-"}
              </p>
              <p className="mt-1">
                Last updated by: <span className="font-medium">{card.updatedBy?.name || "-"}</span> -{" "}
                {card.updatedBy?.at ? new Date(card.updatedBy.at).toLocaleString("en-US") : "-"}
              </p>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-lg border border-[#999999] px-3 py-2 text-sm font-medium text-[#999999]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                className="rounded-lg bg-[#F9423A] px-3 py-2 text-sm font-medium text-white hover:brightness-95"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  )
}

export default Card
