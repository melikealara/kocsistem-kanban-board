import { CSS } from "@dnd-kit/utilities"
import { useSortable } from "@dnd-kit/sortable"
import { useEffect, useRef, useState } from "react"
import { Pencil, Trash2 } from "lucide-react"

function KanbanCard({ card, onDelete, onUpdate, isOverlay = false }) {
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
    data: { type: "card", columnId: card.columnId },
    disabled: isOverlay,
  })
  const [isEditing, setIsEditing] = useState(false)
  const [draftContent, setDraftContent] = useState(card.content)
  const inputRef = useRef(null)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  useEffect(() => {
    if (isEditing) inputRef.current?.focus()
  }, [isEditing])

  const saveEdit = () => {
    if (!onUpdate) return
    if (!draftContent.trim()) {
      cancelEdit()
      return
    }
    onUpdate(card.id, draftContent)
    setIsEditing(false)
  }

  const cancelEdit = () => {
    setDraftContent(card.content)
    setIsEditing(false)
  }

  const handleEditStart = (event) => {
    event.stopPropagation()
    event.preventDefault()
    setDraftContent(card.content)
    setIsEditing(true)
  }

  const handleDelete = (event) => {
    event.stopPropagation()
    event.preventDefault()
    if (onDelete) onDelete(card.id)
  }

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault()
      saveEdit()
    }
    if (event.key === "Escape") {
      event.preventDefault()
      cancelEdit()
    }
  }

  if (isOverlay) {
    return (
      <article
        className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-md"
        role="presentation"
      >
        {card.content}
      </article>
    )
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={[
        "group rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-sm",
        "focus-within:ring-2 focus-within:ring-indigo-300",
        isDragging ? "opacity-40" : "opacity-100",
      ].join(" ")}
    >
      <div className="mb-1 flex justify-end gap-1">
        <button
          type="button"
          onClick={handleEditStart}
          className="rounded p-1 text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-indigo-600 group-hover:opacity-100"
          aria-label="Karti duzenle"
        >
          <Pencil size={14} />
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="rounded p-1 text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-rose-600 group-hover:opacity-100"
          aria-label="Karti sil"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {isEditing ? (
        <input
          ref={inputRef}
          value={draftContent}
          onChange={(event) => setDraftContent(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={saveEdit}
          maxLength={120}
          className="w-full rounded-md border border-indigo-300 px-2 py-1 text-sm outline-none focus:border-indigo-500"
          aria-label="Kart metnini duzenle"
        />
      ) : (
        <div
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          className="cursor-grab select-none rounded"
          role="button"
          tabIndex={0}
          aria-label={`${card.content} kartini tasi`}
        >
          {card.content}
        </div>
      )}
    </article>
  )
}

export default KanbanCard
