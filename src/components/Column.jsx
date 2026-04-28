import { useState } from "react"
import { CSS } from "@dnd-kit/utilities"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { GripHorizontal, Pencil, Trash2 } from "lucide-react"
import Card from "./Card"

function Column({
  column,
  cards,
  onOpenAddCard,
  onDeleteCard,
  onUpdateCard,
  onDeleteColumn,
  onRenameColumn,
  isDropTarget,
  isDragging,
  canEdit,
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [draftTitle, setDraftTitle] = useState(column.title)
  const { attributes, listeners, setNodeRef: setSortableRef, setActivatorNodeRef, transform, transition } =
    useSortable({
      id: column.id,
      data: { type: "column" },
      disabled: !canEdit,
    })
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: { type: "column" },
  })
  const { setNodeRef: setDropZoneRef, isOver: isDropZoneOver } = useDroppable({
    id: `dropzone-${column.id}`,
    data: { type: "dropzone", columnId: column.id },
  })

  const showDropZone = isDragging && (isDropTarget || isDropZoneOver)
  const style = { transform: CSS.Transform.toString(transform), transition }

  const handleRename = () => {
    onRenameColumn(column.id, draftTitle)
    setIsEditingTitle(false)
  }

  return (
    <section ref={setSortableRef} style={style} className="w-[320px] rounded-2xl bg-slate-100 p-4 shadow-sm lg:w-auto">
      <header className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {canEdit ? (
            <button
              ref={setActivatorNodeRef}
              type="button"
              {...attributes}
              {...listeners}
              style={{ touchAction: "none" }}
              className="rounded border border-slate-300 p-1 text-slate-500 hover:border-[#999999]"
              aria-label="Drag column"
            >
              <GripHorizontal size={12} />
            </button>
          ) : null}
          {isEditingTitle && canEdit ? (
            <input
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              onBlur={handleRename}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleRename()
              }}
              className="w-32 rounded border border-slate-300 px-2 py-1 text-sm outline-none focus:border-[#F9423A]"
              autoFocus
            />
          ) : (
            <h2 className="text-sm font-semibold text-slate-700">{column.title}</h2>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">{cards.length}</span>
          {canEdit ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setDraftTitle(column.title)
                  setIsEditingTitle(true)
                }}
                className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-[#F9423A]"
                aria-label="Edit column"
              >
                <Pencil size={14} />
              </button>
              <button
                type="button"
                onClick={() => onDeleteColumn(column.id)}
                className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-rose-600"
                aria-label="Delete column"
              >
                <Trash2 size={14} />
              </button>
            </>
          ) : null}
        </div>
      </header>

      <div
        ref={setNodeRef}
        className={[
          "min-h-32 space-y-2 rounded-xl border border-dashed p-2 transition",
          isDropTarget ? "border-[#F9423A] bg-red-50" : "border-transparent",
        ].join(" ")}
      >
        <SortableContext items={cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              onDelete={onDeleteCard}
              onUpdate={onUpdateCard}
              canEdit={canEdit}
            />
          ))}
        </SortableContext>

        {showDropZone ? (
          <div
            ref={setDropZoneRef}
            className="rounded-lg border-2 border-dashed border-[#F9423A] bg-red-100/60 py-5 text-center text-xs font-medium text-[#F9423A]"
          >
            Drop here
          </div>
        ) : null}
      </div>

      {canEdit ? (
        <button
          type="button"
          onClick={() => onOpenAddCard(column.id)}
          className="mt-3 w-full rounded-lg bg-[#F9423A] px-3 py-2 text-sm font-medium text-white transition hover:brightness-95"
        >
          Add Card
        </button>
      ) : null}
    </section>
  )
}

export default Column
