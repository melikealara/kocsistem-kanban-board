function nowId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

const defaultUserId = "user-melike"
const defaultBoardId = "board-demo"
const defaultAudit = {
  name: "Melike Alara",
  at: new Date().toISOString(),
}

export const initialAppState = {
  session: {
    currentUserId: null,
    activeBoardId: null,
  },
  users: {
    [defaultUserId]: {
      id: defaultUserId,
      name: "Melike Alara",
      email: "melikealara@gmail.com",
      boardIds: [defaultBoardId],
    },
  },
  boards: {
    [defaultBoardId]: {
      id: defaultBoardId,
      userId: defaultUserId,
      title: "KocSistem Internship Board",
      isPublic: true,
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
          createdBy: defaultAudit,
          updatedBy: defaultAudit,
          history: [],
        },
        "card-2": {
          id: "card-2",
          boardId: defaultBoardId,
          column_id: "col-todo",
          order_index: 1,
          title: "dnd-kit integration",
          description: "Surukle birak akisini kur",
          priority: "medium",
          createdBy: defaultAudit,
          updatedBy: defaultAudit,
          history: [],
        },
        "card-3": {
          id: "card-3",
          boardId: defaultBoardId,
          column_id: "col-doing",
          order_index: 0,
          title: "Persistence",
          description: "localStorage kaliciligini test et",
          priority: "high",
          createdBy: defaultAudit,
          updatedBy: defaultAudit,
          history: [],
        },
      },
    },
  },
}

export function createUser({ name, email }) {
  const id = nowId("user")
  return {
    id,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    boardIds: [],
  }
}

export function createBoard(userId, title, isPublic = false) {
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
    isPublic,
    columns,
    cards: {},
  }
}
