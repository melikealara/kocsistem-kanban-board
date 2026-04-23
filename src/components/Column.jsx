import { useState } from "react"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import Card from "./Card"

function Column({ column, cards, onAddCard, onDeleteCard, onUpdateCard, isDropTarget }) {
  const [draft, setDraft] = useState({
    title: "",
    description: "",
    priority: "medium",
  })

  const { setNodeRef } = useDroppable({
    id: column.id,
    data: { type: "column" },
  })

  const handleSubmit = (event) => {
    event.preventDefault()
    onAddCard(column.id, draft)
    setDraft({ title: "", description: "", priority: "medium" })
  }

  return (
    <section className="rounded-2xl bg-slate-100 p-4 shadow-sm">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">{column.title}</h2>
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">{cards.length}</span>
      </header>

      <div
        ref={setNodeRef}
        className={[
          "min-h-32 space-y-2 rounded-xl border border-dashed p-2 transition",
          isDropTarget ? "border-indigo-400 bg-indigo-50" : "border-transparent",
        ].join(" ")}
      >
        <SortableContext items={cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <Card key={card.id} card={card} onDelete={onDeleteCard} onUpdate={onUpdateCard} />
          ))}
        </SortableContext>

        {/* Placeholder gives the user a clear drop zone when dragging into this column. */}
        {isDropTarget ? (
          <div className="rounded-lg border-2 border-dashed border-indigo-300 bg-indigo-100/60 py-5 text-center text-xs font-medium text-indigo-700">
            Buraya birak
          </div>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="mt-3 space-y-2">
        <input
          value={draft.title}
          onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
          placeholder="Card title"
          maxLength={70}
          required
        />
        <textarea
          value={draft.description}
          onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
          rows={2}
          className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-indigo-400"
          placeholder="Card description"
          maxLength={200}
        />
        <select
          value={draft.priority}
          onChange={(event) => setDraft((prev) => ({ ...prev, priority: event.target.value }))}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-indigo-400"
        >
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
        </select>
        <button
          type="submit"
          className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          Kart Ekle
        </button>
      </form>
    </section>
  )
}

export default Column
