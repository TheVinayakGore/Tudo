"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { FiEdit3 } from "react-icons/fi";
import { IoTrash } from "react-icons/io5";
import type { Todo } from "@/store/todo-store";

interface TodoDetailDialogProps {
  selectedTodo: Todo | null;
  setSelectedTodo: React.Dispatch<React.SetStateAction<Todo | null>>;
  handleEditTodo: (todo: Todo) => void;
  setTodoToDelete: (todo: Todo | null) => void;
  editingSubTodo: { todoId: string; subTodoId: string } | null;
  setEditingSubTodo: (
    value: { todoId: string; subTodoId: string } | null
  ) => void;
  editSubTodoText: string;
  setEditSubTodoText: (text: string) => void;
  updateSubTodo: (parentId: string, subTodoId: string, title: string) => void;
  deleteSubTodo: (todoId: string, subTodoId: string) => void;
  deleteTodo: (id: string) => void;
  formatDateTime: (date: string | Date) => string;
}

const TodoDetailDialog: React.FC<TodoDetailDialogProps> = ({
  selectedTodo,
  setSelectedTodo,
  handleEditTodo,
  setTodoToDelete,
  editingSubTodo,
  setEditingSubTodo,
  editSubTodoText,
  setEditSubTodoText,
  updateSubTodo,
  deleteSubTodo,
  deleteTodo,
  formatDateTime,
}) => {
  return (
    <Dialog open={!!selectedTodo} onOpenChange={() => setSelectedTodo(null)}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="pb-3 border-b">
          <DialogTitle className="flex items-center justify-between w-full">
            <div className="flex flex-col gap-2 text-start leading-none">
              <span className="text-xl font-semibold leading-none">
                Todo Details
              </span>
              <Badge
                variant="secondary"
                className={`${selectedTodo?.completed ? "bg-green-500" : "bg-blue-500"} text-xs text-white rounded uppercase`}
              >
                {selectedTodo?.completed ? "Completed" : "Pending"}
              </Badge>
              <span className="text-xs text-muted-foreground font-normal">
                {formatDateTime(selectedTodo?.createdAt || new Date())}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedTodo(null);
                  if (selectedTodo) {
                    handleEditTodo(selectedTodo);
                  }
                }}
                className="gap-2"
              >
                <FiEdit3 className="h-4 w-4" />
                Edit
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setSelectedTodo(null);
                  setTodoToDelete(selectedTodo);
                }}
                className="gap-2 bg-red-500 hover:bg-red-600"
              >
                <IoTrash className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        {selectedTodo && (
          <div className="grid gap-4 pb-4 overflow-auto max-h-[30rem]">
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">
                Title
              </h4>
              <p className="text-sm font-medium">{selectedTodo.title}</p>
            </div>

            <Separator />

            {selectedTodo.description &&
              selectedTodo.description.trim() !== "" && (
                <>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">
                      Description
                    </h4>
                    <p className="text-base whitespace-pre-wrap">
                      {selectedTodo.description}
                    </p>
                  </div>
                  <Separator />
                </>
              )}

            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">
                Due Date
              </h4>
              <b className="text-sm uppercase text-primary">
                {formatDateTime(
                  selectedTodo?.dueDate || selectedTodo?.createdAt
                )}
              </b>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm text-muted-foreground">
                  Sub-todos ({selectedTodo.subTodos?.length || 0})
                </h4>
              </div>
              <div className="space-y-2">
                {selectedTodo.subTodos && selectedTodo.subTodos.length > 0 ? (
                  selectedTodo.subTodos.map((subTodo) => (
                    <div
                      key={subTodo.id}
                      className="flex flex-col gap-2 p-3 border rounded-md bg-muted/30 relative"
                    >
                      <div className="flex items-center gap-2">
                        {editingSubTodo?.subTodoId === subTodo.id ? (
                          <div className="flex-1 flex gap-2">
                            <Input
                              value={editSubTodoText}
                              onChange={(e) => {
                                const newText = e.target.value;
                                setEditSubTodoText(newText);
                                // Update the selectedTodo to reflect the edit immediately
                                setSelectedTodo((prev: Todo | null) => {
                                  if (!prev) return null;
                                  return {
                                    ...prev,
                                    subTodos:
                                      prev.subTodos?.map((st) =>
                                        st.id === subTodo.id
                                          ? ({ ...st, title: newText } as Todo)
                                          : (st as Todo)
                                      ) || [],
                                  };
                                });
                              }}
                              className="flex-1"
                              onKeyDown={(e) => {
                                if (
                                  e.key === "Enter" &&
                                  editSubTodoText.trim()
                                ) {
                                  updateSubTodo(
                                    selectedTodo.id,
                                    subTodo.id,
                                    editSubTodoText
                                  );
                                  setEditingSubTodo(null);
                                  setEditSubTodoText("");
                                }
                              }}
                            />
                            <Button
                              size="sm"
                              onClick={() => {
                                if (editSubTodoText.trim()) {
                                  updateSubTodo(
                                    selectedTodo.id,
                                    subTodo.id,
                                    editSubTodoText
                                  );
                                  setEditingSubTodo(null);
                                  setEditSubTodoText("");
                                }
                              }}
                            >
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingSubTodo(null);
                                setEditSubTodoText("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className="flex-1 font-medium">
                              {subTodo.title}
                            </span>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="flex-shrink-0 text-xs sm:text-sm"
                                onClick={() => {
                                  setEditingSubTodo({
                                    todoId: selectedTodo.id,
                                    subTodoId: subTodo.id,
                                  });
                                  setEditSubTodoText(subTodo.title);
                                }}
                              >
                                <FiEdit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="flex-shrink-0 text-xs sm:text-sm"
                                onClick={() => {
                                  if (selectedTodo) {
                                    deleteSubTodo(selectedTodo.id, subTodo.id);
                                    // Update the selectedTodo to reflect the deletion immediately
                                    setSelectedTodo((prev: Todo | null) => {
                                      if (!prev) return null;
                                      const updatedSubTodos =
                                        prev.subTodos?.filter(
                                          (st) => st.id !== subTodo.id
                                        ) || [];

                                      // If this was the last subtodo, close the dialog and delete the main todo
                                      if (updatedSubTodos.length === 0) {
                                        setTimeout(() => {
                                          setSelectedTodo(null);
                                          deleteTodo(prev.id);
                                        }, 100);
                                      }

                                      return {
                                        ...prev,
                                        subTodos: updatedSubTodos,
                                      };
                                    });
                                  }
                                }}
                              >
                                <IoTrash className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No subtodos added yet
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TodoDetailDialog;
