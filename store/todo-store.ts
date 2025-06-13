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
  subTodos?: Todo[]; // Add support for sub-todos
  parentId?: string; // Reference to parent todo if this is a sub-todo
  isPlaceholder?: boolean;
}

type TodoStore = {
  todos: Todo[];
  addTodo: (todo: Omit<Todo, "id">, parentId?: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  updateTodo: (
    id: string,
    updates: {
      title: string;
      description?: string;
      dueDate?: string;
      dueTime?: string;
      subTodos?: Todo[]; // Add support for subTodos updates
    }
  ) => void;
  clearAllTodos: () => void;
  addSubTodo: (parentId: string, subTodo: Omit<Todo, "id">) => void;
  deleteSubTodo: (todoId: string, subTodoId: string) => void;
  toggleSubTodo: (parentId: string, subTodoId: string) => void;
  updateSubTodo: (parentId: string, subTodoId: string, title: string) => void;
};

export const useTodoStore = create<TodoStore>()(
  persist(
    (set) => ({
      todos: [],
      addTodo: (todo: Omit<Todo, "id">, parentId?: string) => {
        const newTodo = {
          id: Date.now().toString(),
          ...todo,
          subTodos: todo.subTodos || [],
        };

        if (parentId) {
          set((state) => ({
            todos: state.todos.map((t) =>
              t.id === parentId
                ? {
                    ...t,
                    subTodos: [...(t.subTodos || []), newTodo],
                  }
                : t
            ),
          }));
        } else {
          set((state) => ({
            todos: [...state.todos, newTodo],
          }));
        }
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
          subTodos?: Todo[]; // Add support for subTodos updates
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
      addSubTodo: (parentId: string, subTodo: Omit<Todo, "id">) => {
        const newSubTodo = {
          id: Date.now().toString(),
          ...subTodo,
          parentId,
        };
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === parentId
              ? {
                  ...todo,
                  subTodos: [...(todo.subTodos || []), newSubTodo],
                }
              : todo
          ),
        }));
        toast.success("Sub-todo added!");
      },
      deleteSubTodo: (todoId: string, subTodoId: string) => {
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === todoId
              ? {
                  ...todo,
                  subTodos:
                    todo.subTodos?.filter((st) => st.id !== subTodoId) || [],
                }
              : todo
          ),
        }));
        toast.success("Sub-todo deleted!");
      },
      toggleSubTodo: (parentId: string, subTodoId: string) => {
        set((state) => {
          const updatedTodos = state.todos.map((todo) =>
            todo.id === parentId
              ? {
                  ...todo,
                  subTodos: (todo.subTodos || []).map((st) =>
                    st.id === subTodoId
                      ? {
                          ...st,
                          completed: !st.completed,
                          completedAt: st.completed ? undefined : new Date(),
                        }
                      : st
                  ),
                }
              : todo
          );

          // Check if all subtodos are completed and update parent todo
          const parentTodo = updatedTodos.find((t) => t.id === parentId);
          if (parentTodo?.subTodos && parentTodo.subTodos.length > 0) {
            const allSubtodosCompleted = parentTodo.subTodos.every(
              (st) => st.completed
            );
            if (allSubtodosCompleted !== parentTodo.completed) {
              return {
                todos: updatedTodos.map((todo) =>
                  todo.id === parentId
                    ? {
                        ...todo,
                        completed: allSubtodosCompleted,
                        completedAt: allSubtodosCompleted
                          ? new Date()
                          : undefined,
                      }
                    : todo
                ),
              };
            }
          }

          return { todos: updatedTodos };
        });
        toast.success("Sub-todo updated!");
      },
      updateSubTodo: (parentId: string, subTodoId: string, title: string) => {
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === parentId
              ? {
                  ...todo,
                  subTodos: (todo.subTodos || []).map((st) =>
                    st.id === subTodoId
                      ? {
                          ...st,
                          title,
                        }
                      : st
                  ),
                }
              : todo
          ),
        }));
        toast.success("Sub-todo updated!");
      },
    }),
    {
      name: "todo-storage", // LocalStorage key
    }
  )
);
