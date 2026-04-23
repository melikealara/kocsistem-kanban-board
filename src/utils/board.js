import { arrayMove } from "@dnd-kit/sortable"

function getContainerId(board, itemId) {
  if (board.columns[itemId]) return itemId

  for (const columnId of board.columnOrder) {
    if (board.columns[columnId].cardIds.includes(itemId)) return columnId
  }

  return null
}

export function moveCard(board, activeId, overId) {
  if (!overId || activeId === overId) return board

  const sourceColumnId = getContainerId(board, activeId)
  const targetColumnId = getContainerId(board, overId)
  if (!sourceColumnId || !targetColumnId) return board

  const sourceColumn = board.columns[sourceColumnId]
  const targetColumn = board.columns[targetColumnId]

  const sourceIndex = sourceColumn.cardIds.indexOf(activeId)
  if (sourceIndex === -1) return board

  const overIsColumn = !!board.columns[overId]
  const targetIndex = overIsColumn
    ? targetColumn.cardIds.length
    : targetColumn.cardIds.indexOf(overId)

  if (targetIndex === -1 && !overIsColumn) return board

  if (sourceColumnId === targetColumnId) {
    const reordered = arrayMove(sourceColumn.cardIds, sourceIndex, targetIndex)
    return {
      ...board,
      columns: {
        ...board.columns,
        [sourceColumnId]: {
          ...sourceColumn,
          cardIds: reordered,
        },
      },
    }
  }

  const nextSourceCardIds = [...sourceColumn.cardIds]
  nextSourceCardIds.splice(sourceIndex, 1)

  const nextTargetCardIds = [...targetColumn.cardIds]
  nextTargetCardIds.splice(targetIndex, 0, activeId)

  return {
    ...board,
    columns: {
      ...board.columns,
      [sourceColumnId]: {
        ...sourceColumn,
        cardIds: nextSourceCardIds,
      },
      [targetColumnId]: {
        ...targetColumn,
        cardIds: nextTargetCardIds,
      },
    },
    cards: {
      ...board.cards,
      [activeId]: {
        ...board.cards[activeId],
        columnId: targetColumnId,
      },
    },
  }
}

export function createCard(board, columnId, content) {
  const trimmed = content.trim()
  if (!trimmed) return board

  const cardId = `card-${Date.now()}`

  return {
    ...board,
    columns: {
      ...board.columns,
      [columnId]: {
        ...board.columns[columnId],
        cardIds: [...board.columns[columnId].cardIds, cardId],
      },
    },
    cards: {
      ...board.cards,
      [cardId]: {
        id: cardId,
        content: trimmed,
        columnId,
      },
    },
  }
}

export function updateCardContent(board, cardId, content) {
  const card = board.cards[cardId]
  if (!card) return board

  const trimmed = content.trim()
  if (!trimmed || trimmed === card.content) return board

  return {
    ...board,
    cards: {
      ...board.cards,
      [cardId]: {
        ...card,
        content: trimmed,
      },
    },
  }
}

export function deleteCard(board, cardId) {
  const card = board.cards[cardId]
  if (!card) return board

  const columnId = card.columnId
  const column = board.columns[columnId]
  if (!column) return board

  const nextCards = { ...board.cards }
  delete nextCards[cardId]

  return {
    ...board,
    cards: nextCards,
    columns: {
      ...board.columns,
      [columnId]: {
        ...column,
        cardIds: column.cardIds.filter((id) => id !== cardId),
      },
    },
  }
}
