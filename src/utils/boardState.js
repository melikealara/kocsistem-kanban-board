import { arrayMove } from "@dnd-kit/sortable"
import { createBoard, createUser } from "../data/initialState"

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function sortByOrderIndex(items) {
  return [...items].sort((a, b) => a.order_index - b.order_index)
}

function getDropZoneColumnId(itemId) {
  if (typeof itemId !== "string") return null
  if (!itemId.startsWith("dropzone-")) return null
  return itemId.replace("dropzone-", "")
}

export function getUserBoards(state, userId) {
  const user = state.users[userId]
  if (!user) return []
  return user.boardIds.map((boardId) => state.boards[boardId]).filter(Boolean)
}

export function getVisibleBoards(state, userId) {
  return Object.values(state.boards)
    .filter((board) => board.userId === userId || board.isPublic)
    .sort((a, b) => a.title.localeCompare(b.title))
}

export function ensureUserInState(state, authUser) {
  if (state.users[authUser.id]) return state

  const user = createUser({
    name: authUser.name,
    email: authUser.email,
  })
  user.id = authUser.id
  const board = createBoard(authUser.id, `${authUser.name} Board`, false)

  return {
    ...state,
    users: {
      ...state.users,
      [authUser.id]: {
        ...user,
        id: authUser.id,
        boardIds: [board.id],
      },
    },
    boards: {
      ...state.boards,
      [board.id]: board,
    },
  }
}

export function getColumns(board) {
  return sortByOrderIndex(Object.values(board.columns))
}

export function getCardsByColumn(board, columnId) {
  return sortByOrderIndex(Object.values(board.cards).filter((card) => card.column_id === columnId))
}

export function loginUser(state, authUser) {
  const preparedState = ensureUserInState(state, authUser)
  const user = preparedState.users[authUser.id]
  return {
    ...preparedState,
    session: {
      currentUserId: authUser.id,
      activeBoardId: user?.boardIds[0] ?? null,
    },
  }
}

export function logoutUser(state) {
  return {
    ...state,
    session: {
      currentUserId: null,
      activeBoardId: null,
    },
  }
}

export function createBoardForUser(state, userId, title, isPublic) {
  const trimmed = title.trim()
  if (!trimmed) return state
  const user = state.users[userId]
  if (!user) return state

  const board = createBoard(userId, trimmed, Boolean(isPublic))

  return {
    ...state,
    session: {
      ...state.session,
      activeBoardId: board.id,
    },
    users: {
      ...state.users,
      [userId]: {
        ...user,
        boardIds: [...user.boardIds, board.id],
      },
    },
    boards: {
      ...state.boards,
      [board.id]: board,
    },
  }
}

export function renameBoardForUser(state, userId, boardId, title) {
  const trimmed = title.trim()
  if (!trimmed) return state

  const board = state.boards[boardId]
  if (!board || board.userId !== userId) return state

  return {
    ...state,
    boards: {
      ...state.boards,
      [boardId]: {
        ...board,
        title: trimmed,
      },
    },
  }
}

export function deleteBoardForUser(state, userId, boardId) {
  if (typeof window !== "undefined") {
    if (!window.confirm("Are you sure? This action is permanent.")) return state
  }

  const user = state.users[userId]
  const board = state.boards[boardId]
  if (!user || !board || board.userId !== userId) return state

  const nextBoards = { ...state.boards }
  delete nextBoards[boardId]

  const nextBoardIds = user.boardIds.filter((id) => id !== boardId)
  let finalBoards = nextBoards
  let finalBoardIds = nextBoardIds

  // Keep the user productive by always guaranteeing one board.
  if (finalBoardIds.length === 0) {
    const fallbackBoard = createBoard(userId, `${user.name} Board`, false)
    finalBoards = { ...nextBoards, [fallbackBoard.id]: fallbackBoard }
    finalBoardIds = [fallbackBoard.id]
  }

  const nextActive =
    state.session.activeBoardId === boardId ? finalBoardIds[0] ?? null : state.session.activeBoardId

  return {
    ...state,
    session: {
      ...state.session,
      activeBoardId: nextActive,
    },
    users: {
      ...state.users,
      [userId]: {
        ...user,
        boardIds: finalBoardIds,
      },
    },
    boards: finalBoards,
  }
}

export function setActiveBoard(state, boardId) {
  if (!state.boards[boardId]) return state
  return {
    ...state,
    session: {
      ...state.session,
      activeBoardId: boardId,
    },
  }
}

export function canManageBoard(board, userId) {
  return Boolean(board && userId && board.userId === userId)
}

export function addCard(board, columnId, payload, actorName) {
  const title = payload.title.trim()
  if (!title) return board

  const cardsInColumn = getCardsByColumn(board, columnId)
  const nextOrder = cardsInColumn.length
  const id = uid("card")

  return {
    ...board,
    cards: {
      ...board.cards,
      [id]: {
        id,
        boardId: board.id,
        column_id: columnId,
        order_index: nextOrder,
        title,
        description: payload.description.trim(),
        priority: payload.priority || "medium",
        createdBy: {
          name: actorName,
          at: new Date().toISOString(),
        },
        updatedBy: {
          name: actorName,
          at: new Date().toISOString(),
        },
        history: [],
      },
    },
  }
}

export function addColumn(board, title) {
  const trimmed = title.trim()
  if (!trimmed) return board

  const id = uid("col")
  const nextOrder = getColumns(board).length
  return {
    ...board,
    columns: {
      ...board.columns,
      [id]: {
        id,
        boardId: board.id,
        title: trimmed,
        order_index: nextOrder,
      },
    },
  }
}

export function updateColumnTitle(board, columnId, title) {
  const column = board.columns[columnId]
  const trimmed = title.trim()
  if (!column || !trimmed) return board

  return {
    ...board,
    columns: {
      ...board.columns,
      [columnId]: {
        ...column,
        title: trimmed,
      },
    },
  }
}

export function deleteColumn(board, columnId) {
  const column = board.columns[columnId]
  if (!column) return board

  const nextColumns = { ...board.columns }
  delete nextColumns[columnId]

  const nextCards = Object.fromEntries(
    Object.entries(board.cards).filter(([, card]) => card.column_id !== columnId),
  )

  const reorderedColumns = sortByOrderIndex(Object.values(nextColumns)).map((item, index) => ({
    ...item,
    order_index: index,
  }))

  const normalizedColumns = {}
  reorderedColumns.forEach((item) => {
    normalizedColumns[item.id] = item
  })

  return {
    ...board,
    columns: normalizedColumns,
    cards: nextCards,
  }
}

export function updateCard(board, cardId, patch, actorName) {
  const card = board.cards[cardId]
  if (!card) return board

  return {
    ...board,
    cards: {
      ...board.cards,
      [cardId]: {
        ...card,
        title: patch.title?.trim() || card.title,
        description: patch.description?.trim() ?? card.description,
        priority: patch.priority || card.priority,
        updatedBy: {
          name: actorName,
          at: new Date().toISOString(),
        },
      },
    },
  }
}

export function deleteCard(board, cardId) {
  if (typeof window !== "undefined") {
    if (!window.confirm("Are you sure? This action is permanent.")) return board
  }

  const target = board.cards[cardId]
  if (!target) return board

  const nextCards = { ...board.cards }
  delete nextCards[cardId]

  // Keep order_index contiguous after delete, like SQL reindex step.
  const reordered = sortByOrderIndex(
    Object.values(nextCards).filter((card) => card.column_id === target.column_id),
  ).map((card, idx) => ({ ...card, order_index: idx }))

  const patchedCards = { ...nextCards }
  reordered.forEach((card) => {
    patchedCards[card.id] = card
  })

  return {
    ...board,
    cards: patchedCards,
  }
}

function getContainerId(board, itemId) {
  const dropColumnId = getDropZoneColumnId(itemId)
  if (dropColumnId && board.columns[dropColumnId]) return dropColumnId
  if (board.columns[itemId]) return itemId
  if (board.cards[itemId]) return board.cards[itemId].column_id
  return null
}

export function moveCard(board, activeId, overId, actorName) {
  if (!overId || activeId === overId) return board
  if (!board.cards[activeId]) return board

  const fromColumnId = getContainerId(board, activeId)
  const toColumnId = getContainerId(board, overId)
  if (!fromColumnId || !toColumnId) return board

  const fromCards = getCardsByColumn(board, fromColumnId)
  const toCards = getCardsByColumn(board, toColumnId)
  const fromIndex = fromCards.findIndex((card) => card.id === activeId)
  if (fromIndex === -1) return board

  const dropZoneColumnId = getDropZoneColumnId(overId)
  const isOverColumn = !!board.columns[overId]
  const isOverDropZone = !!dropZoneColumnId
  const toIndex =
    isOverColumn || isOverDropZone ? toCards.length : toCards.findIndex((card) => card.id === overId)
  if (toIndex < 0) return board

  let nextBoard = { ...board, cards: { ...board.cards } }

  if (fromColumnId === toColumnId) {
    // Same column move: only reorder and normalize order_index.
    const moved = arrayMove(fromCards, fromIndex, toIndex).map((card, idx) => ({
      ...card,
      order_index: idx,
    }))
    moved.forEach((card) => {
      nextBoard.cards[card.id] = card
    })
    return nextBoard
  }

  const sourceColumnTitle = board.columns[fromColumnId]?.title || "Unknown"
  const targetColumnTitle = board.columns[toColumnId]?.title || "Unknown"
  const nowIso = new Date().toISOString()
  const historyEntry = `Moved from ${sourceColumnTitle} to ${targetColumnTitle} by ${actorName} at ${new Date(nowIso).toLocaleString("en-US")}`

  const movingCard = {
    ...fromCards[fromIndex],
    column_id: toColumnId,
    updatedBy: {
      name: actorName,
      at: nowIso,
    },
    history: [...(fromCards[fromIndex].history || []), historyEntry],
  }
  // Cross-column move: rebuild both columns so persisted order_index remains deterministic.
  const nextFrom = fromCards.filter((card) => card.id !== activeId).map((card, idx) => ({
    ...card,
    order_index: idx,
  }))

  const baseTo = toCards.map((card) => ({ ...card }))
  baseTo.splice(toIndex, 0, movingCard)
  const nextTo = baseTo.map((card, idx) => ({ ...card, order_index: idx }))

  ;[...nextFrom, ...nextTo].forEach((card) => {
    nextBoard.cards[card.id] = card
  })

  return nextBoard
}

export function moveColumn(board, activeColumnId, overColumnId) {
  if (!activeColumnId || !overColumnId || activeColumnId === overColumnId) return board
  if (!board.columns[activeColumnId] || !board.columns[overColumnId]) return board

  const ordered = getColumns(board)
  const oldIndex = ordered.findIndex((column) => column.id === activeColumnId)
  const newIndex = ordered.findIndex((column) => column.id === overColumnId)
  if (oldIndex < 0 || newIndex < 0) return board

  const moved = arrayMove(ordered, oldIndex, newIndex).map((column, index) => ({
    ...column,
    order_index: index,
  }))

  const nextColumns = {}
  moved.forEach((column) => {
    nextColumns[column.id] = column
  })

  return {
    ...board,
    columns: nextColumns,
  }
}
