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
import Column from "./Column"
import Card from "./Card"
import { addCard, deleteCard, getCardsByColumn, getColumns, moveCard, updateCard } from "../utils/boardState"

function Board({ board, onBoardChange }) {
  const [activeCardId, setActiveCardId] = useState(null)
  const [overColumnId, setOverColumnId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const columns = useMemo(() => getColumns(board), [board])
  const activeCard = activeCardId ? board.cards[activeCardId] : null

  const updateBoard = (updater) => {
    onBoardChange((current) => (current.id === board.id ? updater(current) : current))
  }

  const handleDragStart = (event) => setActiveCardId(event.active.id)

  const handleDragOver = (event) => {
    const { active, over } = event
    if (!over) return

    const overId = over.id
    const overColumn = board.columns[overId] ? overId : board.cards[overId]?.column_id ?? null
    setOverColumnId(overColumn)
    updateBoard((current) => moveCard(current, active.id, overId))
  }

  const handleDragEnd = () => {
    setActiveCardId(null)
    setOverColumnId(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            cards={getCardsByColumn(board, column.id)}
            isDropTarget={overColumnId === column.id}
            onAddCard={(columnId, payload) => updateBoard((current) => addCard(current, columnId, payload))}
            onDeleteCard={(cardId) => updateBoard((current) => deleteCard(current, cardId))}
            onUpdateCard={(cardId, patch) => updateBoard((current) => updateCard(current, cardId, patch))}
          />
        ))}
      </div>

      <DragOverlay>{activeCard ? <Card card={activeCard} isOverlay /> : null}</DragOverlay>
    </DndContext>
  )
}

export default Board
