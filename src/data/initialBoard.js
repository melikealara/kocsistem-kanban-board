export const initialBoard = {
  id: "board-1",
  title: "KocSistem Internship Board",
  columnOrder: ["col-todo", "col-doing", "col-done"],
  columns: {
    "col-todo": {
      id: "col-todo",
      title: "To Do",
      cardIds: ["card-1", "card-2"],
    },
    "col-doing": {
      id: "col-doing",
      title: "In Progress",
      cardIds: ["card-3"],
    },
    "col-done": {
      id: "col-done",
      title: "Done",
      cardIds: ["card-4"],
    },
  },
  cards: {
    "card-1": {
      id: "card-1",
      content: "React proje yapisini olustur",
      columnId: "col-todo",
    },
    "card-2": {
      id: "card-2",
      content: "dnd-kit surukle birak entegrasyonu yap",
      columnId: "col-todo",
    },
    "card-3": {
      id: "card-3",
      content: "localStorage kalicilik kontrolu",
      columnId: "col-doing",
    },
    "card-4": {
      id: "card-4",
      content: "README mulakat notlarini hazirla",
      columnId: "col-done",
    },
  },
}
