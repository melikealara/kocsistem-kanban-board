import { useMemo, useState } from "react"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import KanbanColumn from "./KanbanColumn"
import KanbanCard from "./KanbanCard"
import { createCard, deleteCard, moveCard, updateCardContent } from "../utils/board"

function KanbanBoard({ board, setBoard }) {
  const [activeCardId, setActiveCardId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const activeCard = activeCardId ? board.cards[activeCardId] : null

  const columns = useMemo(
    () =>
      board.columnOrder.map((columnId) => {
        const column = board.columns[columnId]
        const cards = column.cardIds.map((cardId) => board.cards[cardId])
        return { column, cards }
      }),
    [board],
  )

  const handleDragStart = (event) => {
    setActiveCardId(event.active.id)
  }

  const handleDragOver = (event) => {
    const { active, over } = event
    if (!over) return
    setBoard((current) => moveCard(current, active.id, over.id))
  }

  const handleDragEnd = () => {
    setActiveCardId(null)
  }

  const handleAddCard = (columnId, content) => {
    setBoard((current) => createCard(current, columnId, content))
  }

  const handleDeleteCard = (cardId) => {
    setBoard((current) => deleteCard(current, cardId))
  }

  const handleUpdateCard = (cardId, content) => {
    setBoard((current) => updateCardContent(current, cardId, content))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-3">
        {columns.map(({ column, cards }) => (
          <KanbanColumn
            key={column.id}
            column={column}
            cards={cards}
            onAddCard={handleAddCard}
            onDeleteCard={handleDeleteCard}
            onUpdateCard={handleUpdateCard}
          />
        ))}
      </div>

      <DragOverlay>{activeCard ? <KanbanCard card={activeCard} isOverlay /> : null}</DragOverlay>
    </DndContext>
  )
}

export default KanbanBoard
