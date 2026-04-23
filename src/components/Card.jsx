import { CSS } from "@dnd-kit/utilities"
import { useSortable } from "@dnd-kit/sortable"
import { useEffect, useRef, useState } from "react"
import { Pencil, Trash2 } from "lucide-react"

const PRIORITY_STYLE = {
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-rose-100 text-rose-700",
}

function Card({ card, onDelete, onUpdate, isOverlay = false }) {
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
    disabled: isOverlay,
  })

  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState({
    title: card.title,
    description: card.description,
    priority: card.priority,
  })
  const titleRef = useRef(null)

  useEffect(() => {
    if (isEditing) titleRef.current?.focus()
  }, [isEditing])

  const style = { transform: CSS.Transform.toString(transform), transition }

  const openEdit = (event) => {
    event.preventDefault()
    event.stopPropagation()
    setDraft({ title: card.title, description: card.description, priority: card.priority })
    setIsEditing(true)
  }

  const saveEdit = () => {
    const title = draft.title.trim()
    if (!title) {
      setDraft({ title: card.title, description: card.description, priority: card.priority })
      setIsEditing(false)
      return
    }

    onUpdate(card.id, draft)
    setIsEditing(false)
  }

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      saveEdit()
    }
    if (event.key === "Escape") {
      event.preventDefault()
      setIsEditing(false)
      setDraft({ title: card.title, description: card.description, priority: card.priority })
    }
  }

  if (isOverlay) {
    return (
      <article className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
        <h4 className="text-sm font-semibold text-slate-800">{card.title}</h4>
        <p className="mt-1 text-xs text-slate-600">{card.description || "No description"}</p>
      </article>
    )
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={[
        "group rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm transition",
        "focus-within:ring-2 focus-within:ring-indigo-300",
        isDragging ? "opacity-35 shadow-none" : "opacity-100 hover:shadow-md",
      ].join(" ")}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${PRIORITY_STYLE[card.priority] || PRIORITY_STYLE.medium}`}
        >
          {card.priority}
        </span>
        <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
            onClick={openEdit}
            aria-label="Kart duzenle"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-600"
            onClick={() => onDelete(card.id)}
            aria-label="Kart sil"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-2" onKeyDown={handleKeyDown}>
          <input
            ref={titleRef}
            value={draft.title}
            onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
            onBlur={saveEdit}
            className="w-full rounded border border-indigo-300 px-2 py-1 text-sm outline-none"
            placeholder="Card title"
          />
          <textarea
            value={draft.description}
            onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
            rows={3}
            className="w-full resize-none rounded border border-slate-300 px-2 py-1 text-xs outline-none"
            placeholder="Card description"
          />
          <select
            value={draft.priority}
            onChange={(event) => setDraft((prev) => ({ ...prev, priority: event.target.value }))}
            className="w-full rounded border border-slate-300 px-2 py-1 text-xs outline-none"
          >
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
        </div>
      ) : (
        <div
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          role="button"
          tabIndex={0}
          aria-label={`${card.title} kartini tasi`}
          className="cursor-grab select-none"
        >
          <h4 className="text-sm font-semibold text-slate-800">{card.title}</h4>
          <p className="mt-1 text-xs text-slate-600">{card.description || "No description"}</p>
        </div>
      )}
    </article>
  )
}

export default Card
