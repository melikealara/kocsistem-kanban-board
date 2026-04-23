function nowId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

const defaultUserId = "user-demo"
const defaultBoardId = "board-demo"

export const initialAppState = {
  session: {
    currentUserId: null,
    activeBoardId: null,
  },
  users: {
    [defaultUserId]: {
      id: defaultUserId,
      name: "Demo User",
      boardIds: [defaultBoardId],
    },
  },
  boards: {
    [defaultBoardId]: {
      id: defaultBoardId,
      userId: defaultUserId,
      title: "KocSistem Internship Board",
      columns: {
        "col-todo": { id: "col-todo", boardId: defaultBoardId, title: "To Do", order_index: 0 },
        "col-doing": { id: "col-doing", boardId: defaultBoardId, title: "In Progress", order_index: 1 },
        "col-done": { id: "col-done", boardId: defaultBoardId, title: "Done", order_index: 2 },
      },
      cards: {
        "card-1": {
          id: "card-1",
          boardId: defaultBoardId,
          column_id: "col-todo",
          order_index: 0,
          title: "React setup",
          description: "Temel proje yapisini tamamla",
          priority: "high",
        },
        "card-2": {
          id: "card-2",
          boardId: defaultBoardId,
          column_id: "col-todo",
          order_index: 1,
          title: "dnd-kit integration",
          description: "Surukle birak akisini kur",
          priority: "medium",
        },
        "card-3": {
          id: "card-3",
          boardId: defaultBoardId,
          column_id: "col-doing",
          order_index: 0,
          title: "Persistence",
          description: "localStorage kaliciligini test et",
          priority: "high",
        },
      },
    },
  },
}

export function createUser(name) {
  const id = nowId("user")
  return {
    id,
    name: name.trim(),
    boardIds: [],
  }
}

export function createBoard(userId, title) {
  const id = nowId("board")
  const columns = {
    "todo-default": { id: "todo-default", boardId: id, title: "To Do", order_index: 0 },
    "doing-default": { id: "doing-default", boardId: id, title: "In Progress", order_index: 1 },
    "done-default": { id: "done-default", boardId: id, title: "Done", order_index: 2 },
  }

  return {
    id,
    userId,
    title: title.trim(),
    columns,
    cards: {},
  }
}
