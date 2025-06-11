import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "react-hot-toast";

// In your todo-store.ts (or wherever your store is defined)
export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date | string;
  completedAt?: Date | string;
  dueDate?: Date | string;
  dueTime?: string; // ✅ new field
}

type TodoStore = {
  todos: Todo[];
  addTodo: (todo: Omit<Todo, "id">) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  updateTodo: (
    id: string,
    updates: { title: string; description?: string }
  ) => void;
  clearAllTodos: () => void;
};

export const useTodoStore = create<TodoStore>()(
  persist(
    (set) => ({
      todos: [],
      addTodo: (todo: Omit<Todo, "id">) => {
        set((state) => ({
          todos: [
            ...state.todos,
            {
              id: Date.now().toString(),
              ...todo,
            },
          ],
        }));
        toast.success("Todo added!");
      },
      toggleTodo: (id: string) => {
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id
              ? {
                  ...todo,
                  completed: !todo.completed,
                  completedAt: todo.completed ? undefined : new Date(),
                }
              : todo
          ),
        }));
        toast.success("Todo updated!");
      },
      deleteTodo: (id: string) => {
        set((state) => ({
          todos: state.todos.filter((todo) => todo.id !== id),
        }));
        toast.success("Todo deleted!");
      },
      updateTodo: (
        id: string,
        updates: {
          title: string;
          description?: string;
          dueDate?: string;
          dueTime?: string;
        }
      ) => {
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, ...updates } : todo
          ),
        }));
        toast.success("Todo updated!");
      },
      clearAllTodos: () => {
        set({ todos: [] });
        toast.success("All todos cleared!");
      },
    }),
    {
      name: "todo-storage", // LocalStorage key
    }
  )
);
