import { useMemo, useState } from "react"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  TouchSensor, 
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { SortableContext, horizontalListSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import Column from "./Column"
import Card from "./Card"
import {
  addCard,
  addColumn,
  deleteCard,
  deleteColumn,
  getCardsByColumn,
  getColumns,
  moveCard,
  moveColumn,
  updateCard,
  updateColumnTitle,
} from "../utils/boardState"

function Board({ board, onBoardChange, currentUserName, canEdit }) {
  const [activeCardId, setActiveCardId] = useState(null)
  const [activeColumnId, setActiveColumnId] = useState(null)
  const [activeType, setActiveType] = useState(null)
  const [overColumnId, setOverColumnId] = useState(null)
  const [newCardModal, setNewCardModal] = useState({ open: false, columnId: null })
  const [newCardDraft, setNewCardDraft] = useState({ title: "", description: "", priority: "medium" })
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false)
  const [newColumnTitle, setNewColumnTitle] = useState("")

  const sensors = useSensors(
    useSensor(PointerSensor, { 
      activationConstraint: { distance: 8 } 
    }),
    useSensor(TouchSensor, {
      // Tablet kalemi ve parmak için hayat kurtaran ayar:
      activationConstraint: {
        delay: 250,    // 250ms basılı tutunca sürükleme başlar (sayfa kaydırmayı bozmaz)
        tolerance: 5,  // Beklerken parmağın 5px kaymasını tolere eder
      },
    }),
    useSensor(KeyboardSensor, { 
      coordinateGetter: sortableKeyboardCoordinates 
    }),
  );

  const columns = useMemo(() => getColumns(board), [board])
  const activeCard = activeCardId ? board.cards[activeCardId] : null
  const activeColumn = activeColumnId ? board.columns[activeColumnId] : null

  const updateBoard = (updater) => {
    onBoardChange((current) => (current.id === board.id ? updater(current) : current))
  }

  const handleDragStart = (event) => {
    const type = event.active.data.current?.type
    setActiveType(type)
    if (type === "card") setActiveCardId(String(event.active.id))
    if (type === "column") setActiveColumnId(String(event.active.id))
  }

  const handleDragOver = (event) => {
    if (!canEdit) return
    const { active, over } = event
    if (!over) return
    if (active.data.current?.type !== "card") return

    const overId = String(over.id)
    const dropZoneColumnId = overId.startsWith("dropzone-") ? overId.replace("dropzone-", "") : null
    const overColumn = dropZoneColumnId || (board.columns[overId] ? overId : board.cards[overId]?.column_id ?? null)
    setOverColumnId(overColumn)
    updateBoard((current) => moveCard(current, active.id, overId, currentUserName))
  }

  const handleDragEnd = (event) => {
    if (!canEdit) {
      setActiveCardId(null)
      setActiveColumnId(null)
      setActiveType(null)
      setOverColumnId(null)
      return
    }

    if (activeType === "column" && activeColumnId) {
      const overId = String(event?.over?.id ?? "")
      if (overId && board.columns[overId]) {
        updateBoard((current) => moveColumn(current, activeColumnId, overId))
      }
    }

    setActiveCardId(null)
    setActiveColumnId(null)
    setActiveType(null)
    setOverColumnId(null)
  }

  const handleOpenAddCard = (columnId) => {
    setNewCardDraft({ title: "", description: "", priority: "medium" })
    setNewCardModal({ open: true, columnId })
  }

  const handleCreateCard = () => {
    if (!newCardModal.columnId) return
    updateBoard((current) => addCard(current, newCardModal.columnId, newCardDraft, currentUserName))
    setNewCardModal({ open: false, columnId: null })
  }

  const handleAddColumn = () => {
    updateBoard((current) => addColumn(current, newColumnTitle))
    setNewColumnTitle("")
    setIsAddColumnOpen(false)
  }

  const deleteCardAction = (cardId) => {
    updateBoard((current) => deleteCard(current, cardId))
  }

  const deleteColumnAction = (columnId) => {
    if (!window.confirm("Are you sure? This action is permanent.")) return
    updateBoard((current) => deleteColumn(current, columnId))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="overflow-x-auto pb-2">
        <SortableContext items={columns.map((column) => column.id)} strategy={horizontalListSortingStrategy}>
          <div className="flex min-w-max items-start gap-4">
            {columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                cards={getCardsByColumn(board, column.id)}
                isDropTarget={overColumnId === column.id}
                isDragging={Boolean(activeCardId)}
                canEdit={canEdit}
                onOpenAddCard={handleOpenAddCard}
                onDeleteCard={deleteCardAction}
                onUpdateCard={(cardId, patch) =>
                  updateBoard((current) => updateCard(current, cardId, patch, currentUserName))
                }
                onRenameColumn={(columnId, title) =>
                  updateBoard((current) => updateColumnTitle(current, columnId, title))
                }
                onDeleteColumn={deleteColumnAction}
              />
            ))}
            {canEdit ? (
              <button
                type="button"
                onClick={() => setIsAddColumnOpen(true)}
                className="mt-1 h-12 min-w-[200px] rounded-xl border-2 border-dashed border-[#F9423A] bg-white px-4 text-sm font-semibold text-[#F9423A] hover:bg-red-50"
              >
                Add Column
              </button>
            ) : null}
          </div>
        </SortableContext>
        </div>

      <DragOverlay>
        {activeCard ? <Card card={activeCard} isOverlay canEdit={canEdit} /> : null}
        {activeColumn ? (
          <div className="w-[320px] rounded-2xl border border-slate-300 bg-slate-100 p-4 shadow-xl">
            <p className="text-sm font-semibold text-slate-700">{activeColumn.title}</p>
          </div>
        ) : null}
      </DragOverlay>

      {newCardModal.open ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-800">Create Card</h3>
            <p className="mt-1 text-xs text-slate-500">Fill in card details and save.</p>
            <div className="mt-4 space-y-2">
              <input
                value={newCardDraft.title}
                onChange={(event) => setNewCardDraft((prev) => ({ ...prev, title: event.target.value }))}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F9423A]"
                placeholder="Title"
              />
              <textarea
                value={newCardDraft.description}
                onChange={(event) =>
                  setNewCardDraft((prev) => ({ ...prev, description: event.target.value }))
                }
                rows={6}
                className="w-full resize-none rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F9423A]"
                placeholder="Description (Markdown supported)"
              />
              <select
                value={newCardDraft.priority}
                onChange={(event) => setNewCardDraft((prev) => ({ ...prev, priority: event.target.value }))}
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F9423A]"
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setNewCardModal({ open: false, columnId: null })}
                className="rounded-lg border border-[#999999] px-3 py-2 text-sm font-medium text-[#999999]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateCard}
                className="rounded-lg bg-[#F9423A] px-3 py-2 text-sm font-medium text-white hover:brightness-95"
              >
                Add Card
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isAddColumnOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-800">Create Column</h3>
            <input
              value={newColumnTitle}
              onChange={(event) => setNewColumnTitle(event.target.value)}
              className="mt-4 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#F9423A]"
              placeholder="Column title"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddColumnOpen(false)}
                className="rounded-lg border border-[#999999] px-3 py-2 text-sm font-medium text-[#999999]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddColumn}
                className="rounded-lg bg-[#F9423A] px-3 py-2 text-sm font-medium text-white hover:brightness-95"
              >
                Add Column
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </DndContext>
  )
}

export default Board
