import { arrayMove } from "@dnd-kit/sortable"
import { createBoard, createUser } from "../data/initialState"

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function sortByOrderIndex(items) {
  return [...items].sort((a, b) => a.order_index - b.order_index)
}

export function getUserBoards(state, userId) {
  const user = state.users[userId]
  if (!user) return []
  return user.boardIds.map((boardId) => state.boards[boardId]).filter(Boolean)
}

export function getColumns(board) {
  return sortByOrderIndex(Object.values(board.columns))
}

export function getCardsByColumn(board, columnId) {
  return sortByOrderIndex(Object.values(board.cards).filter((card) => card.column_id === columnId))
}

export function loginOrCreateUser(state, name) {
  const trimmed = name.trim()
  if (!trimmed) return state

  const existingUser = Object.values(state.users).find(
    (user) => user.name.toLowerCase() === trimmed.toLowerCase(),
  )

  if (existingUser) {
    return {
      ...state,
      session: {
        currentUserId: existingUser.id,
        activeBoardId: existingUser.boardIds[0] ?? null,
      },
    }
  }

  const user = createUser(trimmed)
  const board = createBoard(user.id, `${trimmed} Board`)

  return {
    ...state,
    session: {
      currentUserId: user.id,
      activeBoardId: board.id,
    },
    users: {
      ...state.users,
      [user.id]: {
        ...user,
        boardIds: [board.id],
      },
    },
    boards: {
      ...state.boards,
      [board.id]: board,
    },
  }
}

export function createBoardForUser(state, userId, title) {
  const trimmed = title.trim()
  if (!trimmed) return state
  const user = state.users[userId]
  if (!user) return state

  const board = createBoard(userId, trimmed)

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

export function addCard(board, columnId, payload) {
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
      },
    },
  }
}

export function updateCard(board, cardId, patch) {
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
      },
    },
  }
}

export function deleteCard(board, cardId) {
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
  if (board.columns[itemId]) return itemId
  if (board.cards[itemId]) return board.cards[itemId].column_id
  return null
}

export function moveCard(board, activeId, overId) {
  if (!overId || activeId === overId) return board
  if (!board.cards[activeId]) return board

  const fromColumnId = getContainerId(board, activeId)
  const toColumnId = getContainerId(board, overId)
  if (!fromColumnId || !toColumnId) return board

  const fromCards = getCardsByColumn(board, fromColumnId)
  const toCards = getCardsByColumn(board, toColumnId)
  const fromIndex = fromCards.findIndex((card) => card.id === activeId)
  if (fromIndex === -1) return board

  const isOverColumn = !!board.columns[overId]
  const toIndex = isOverColumn ? toCards.length : toCards.findIndex((card) => card.id === overId)
  if (toIndex < 0) return board

  let nextBoard = { ...board, cards: { ...board.cards } }

  if (fromColumnId === toColumnId) {
    const moved = arrayMove(fromCards, fromIndex, toIndex).map((card, idx) => ({
      ...card,
      order_index: idx,
    }))
    moved.forEach((card) => {
      nextBoard.cards[card.id] = card
    })
    return nextBoard
  }

  const movingCard = { ...fromCards[fromIndex], column_id: toColumnId }
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
