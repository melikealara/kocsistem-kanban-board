import { useState } from "react"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import KanbanCard from "./KanbanCard"

function KanbanColumn({ column, cards, onAddCard, onDeleteCard, onUpdateCard }) {
  const [newCard, setNewCard] = useState("")
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column" },
  })

  const handleSubmit = (event) => {
    event.preventDefault()
    onAddCard(column.id, newCard)
    setNewCard("")
  }

  return (
    <section className="flex w-80 min-w-80 flex-col rounded-2xl bg-slate-100 p-4 shadow-sm">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">{column.title}</h2>
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
          {cards.length}
        </span>
      </header>

      <div
        ref={setNodeRef}
        className={[
          "min-h-24 space-y-2 rounded-xl border border-dashed p-2 transition",
          isOver ? "border-indigo-400 bg-indigo-50" : "border-transparent",
        ].join(" ")}
      >
        <SortableContext items={cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              onDelete={onDeleteCard}
              onUpdate={onUpdateCard}
            />
          ))}
        </SortableContext>
      </div>

      <form onSubmit={handleSubmit} className="mt-3 space-y-2">
        <input
          value={newCard}
          onChange={(event) => setNewCard(event.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
          placeholder="Yeni kart ekle..."
          maxLength={120}
        />
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

export default KanbanColumn
