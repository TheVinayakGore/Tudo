import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "react-hot-toast";

// Helper to format date for toast messages
const formatToastDate = (date: Date | string | undefined) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

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
  workHours?: number; // ✅ new field
  workCompletionPercentage?: number; // New field for work completion percentage
  subTodos?: Todo[]; // Add support for sub-todos
  parentId?: string; // Reference to parent todo if this is a sub-todo
  isPlaceholder?: boolean;
}

// Add helper function to calculate work completion percentage
const calculateWorkCompletionPercentage = (workHours: number): number => {
  const baselineHours = 12; // 12 hours baseline per day
  const percentage = (workHours / baselineHours) * 100;
  return Math.min(percentage, 100); // Cap at 100%
};

type TodoStore = {
  todos: Todo[];
  addTodo: (todo: Omit<Todo, "id">, parentId?: string) => void;
  toggleTodo: (id: string, workHours?: number) => void;
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
  updateWorkHours: (id: string, workHours: number) => void; // New function
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
      },
      toggleTodo: (id: string, workHours?: number) => {
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id
              ? {
                  ...todo,
                  completed: !todo.completed,
                  completedAt: todo.completed ? undefined : new Date(),
                  workHours: todo.completed ? undefined : workHours,
                  workCompletionPercentage: todo.completed
                    ? undefined
                    : workHours
                      ? calculateWorkCompletionPercentage(workHours)
                      : undefined,
                }
              : todo
          ),
        }));
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
      },
      clearAllTodos: () => {
        set({ todos: [] });
        toast.success("All todos cleared !");
      },
      addSubTodo: (parentId: string, subTodo: Omit<Todo, "id">) => {
        const newSubTodo = {
          id: Date.now().toString(),
          ...subTodo,
          parentId,
        };
        set((state) => {
          const updatedTodos = state.todos.map((todo) =>
            todo.id === parentId
              ? {
                  ...todo,
                  subTodos: [...(todo.subTodos || []), newSubTodo],
                }
              : todo
          );
          const parentTodo = updatedTodos.find((t) => t.id === parentId);
          if (parentTodo) {
            toast.success(
              `Sub-todo added to todo on ${formatToastDate(parentTodo.dueDate || parentTodo.createdAt)}!`
            );
          }
          return { todos: updatedTodos };
        });
      },
      deleteSubTodo: (todoId: string, subTodoId: string) => {
        set((state) => {
          const updatedTodos = state.todos.map((todo) =>
            todo.id === todoId
              ? {
                  ...todo,
                  subTodos:
                    todo.subTodos?.filter((st) => st.id !== subTodoId) || [],
                }
              : todo
          );
          const parentTodo = updatedTodos.find((t) => t.id === todoId);
          if (parentTodo) {
            toast.success(
              `Sub-todo deleted from todo on ${formatToastDate(parentTodo.dueDate || parentTodo.createdAt)}!`
            );
          }
          return { todos: updatedTodos };
        });
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

          const updatedParentTodo = updatedTodos.find((t) => t.id === parentId);
          if (updatedParentTodo) {
            toast.success(
              `Sub-todo updated for todo on ${formatToastDate(updatedParentTodo.dueDate || updatedParentTodo.createdAt)}!`
            );
          }

          return { todos: updatedTodos };
        });
      },
      updateSubTodo: (parentId: string, subTodoId: string, title: string) => {
        set((state) => {
          const updatedTodos = state.todos.map((todo) =>
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
          );
          const parentTodo = updatedTodos.find((t) => t.id === parentId);
          if (parentTodo) {
            toast.success(
              `Sub-todo updated for todo on ${formatToastDate(parentTodo.dueDate || parentTodo.createdAt)}!`
            );
          }
          return { todos: updatedTodos };
        });
      },
      updateWorkHours: (id: string, workHours: number) => {
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id
              ? {
                  ...todo,
                  workHours,
                  workCompletionPercentage:
                    calculateWorkCompletionPercentage(workHours),
                }
              : todo
          ),
        }));
        toast.success(`Work hours updated! (${workHours} hours)`);
      },
    }),
    {
      name: "todo-storage", // LocalStorage key
    }
  )
);
