"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { IoAdd } from "react-icons/io5";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { FiEdit2 } from "react-icons/fi";
import { FiTrash2 } from "react-icons/fi";
import { useTodoStore } from "@/store/todo-store";
import type { Todo } from "@/store/todo-store";
import { cn } from "@/lib/utils";

const Page = () => {
  const { todos, toggleTodo, addTodo, deleteTodo, updateTodo } = useTodoStore();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [newTodoText, setNewTodoText] = useState("");
  const [newTodoDesc, setNewTodoDesc] = useState("");
  const [newTodoDate, setNewTodoDate] = useState<Date | undefined>(new Date());
  const [newTodoTime, setNewTodoTime] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [newNoteDate, setNewNoteDate] = useState<Date | undefined>(new Date());
  const [monthViewType, setMonthViewType] = useState<"todos" | "notes">(
    "todos"
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  type Note = {
    id: string;
    text: string;
    createdAt: string;
  };

  // Sort todos by date (newest first)
  const sortedTodos = [...todos].sort((a, b) => {
    const dateA = new Date(a.dueDate || a.createdAt).getTime();
    const dateB = new Date(b.dueDate || b.createdAt).getTime();
    return dateB - dateA;
  });

  const filteredTodos = selectedMonth
    ? sortedTodos.filter(
        (todo) =>
          new Date(todo.dueDate || todo.createdAt).toLocaleString("default", {
            month: "long",
          }) === selectedMonth
      )
    : sortedTodos;

  // Add new todo with date
  const handleAddTodo = () => {
    if (!newTodoText.trim()) return;

    addTodo({
      title: newTodoText,
      description: newTodoDesc,
      completed: false,
      createdAt: new Date(),
      dueDate: newTodoDate,
      dueTime: newTodoTime,
    });

    setNewTodoText("");
    setNewTodoDesc("");
    setNewTodoDate(new Date());
    setNewTodoTime("");
  };

  const handleEditStart = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.title || "");
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  return (
    <>
      <main className="flex flex-col items-start justify-start m-auto gap-5 container py-24 w-full min-h-screen">
        <div className="w-full">
          <h1 className="text-lg sm:text-2xl md:text-4xl mb-5">
            {selectedMonth
              ? `Todos for ${selectedMonth} (${
                  filteredTodos.length
                }) - Pending: ${
                  filteredTodos.filter((t) => !t.completed).length
                }`
              : `All Todos (${todos.length}) - Pending: ${
                  todos.filter((t) => !t.completed).length
                }`}
          </h1>
          {selectedMonth && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => setSelectedMonth(null)}
              className="font-medium w-full"
            >
              ← Back to all months
            </Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full items-center mt-4">
          <Input
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            placeholder="Add a note for this month..."
            className="flex-1"
          />

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-start text-left font-normal w-full sm:w-auto"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {newNoteDate ? format(newNoteDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-30">
              <Calendar
                mode="single"
                selected={newNoteDate}
                onSelect={(date: Date | undefined) => setNewNoteDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button
            onClick={() => {
              if (!newNoteText.trim()) return;
              const newNote: Note = {
                id: crypto.randomUUID(),
                text: newNoteText,
                createdAt: (newNoteDate ?? new Date()).toISOString(),
              };
              setNotes([...notes, newNote]);
              setNewNoteText("");
              setNewNoteDate(new Date());
            }}
            className="gap-1"
          >
            <IoAdd className="h-4 w-4" /> Add Note
          </Button>
        </div>

        {/* Add Todo Form */}
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <Input
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            placeholder="Add new todo..."
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
          />

          <Input
            value={newTodoDesc}
            onChange={(e) => setNewTodoDesc(e.target.value)}
            placeholder="Add description (optional)"
            className="flex-1"
          />

          <div className="flex-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {newTodoDate ? (
                    format(newTodoDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-30">
                <Calendar
                  mode="single"
                  selected={newTodoDate}
                  onSelect={(date: Date | undefined) => setNewTodoDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Input
            type="time"
            value={newTodoTime}
            onChange={(e) => setNewTodoTime(e.target.value)}
            className="flex-1"
          />

          <Button onClick={handleAddTodo} className="flex-1 gap-1">
            <IoAdd className="h-4 w-4" /> Add
          </Button>
        </div>

        {selectedMonth && (
          <div className="flex gap-3 mt-3">
            <Button
              variant={monthViewType === "todos" ? "default" : "outline"}
              onClick={() => setMonthViewType("todos")}
            >
              Show Todos
            </Button>
            <Button
              variant={monthViewType === "notes" ? "default" : "outline"}
              onClick={() => setMonthViewType("notes")}
            >
              Show Notes
            </Button>
          </div>
        )}

        <ScrollArea className="rounded-md border border-orange-300 dark:border-orange-950 w-full h-auto">
          {!selectedMonth ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-3 sm:p-6 h-full">
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((month, index) => {
                const monthTodos = sortedTodos.filter(
                  (todo) =>
                    new Date(todo.dueDate || todo.createdAt).toLocaleString(
                      "default",
                      {
                        month: "long",
                      }
                    ) === month
                );

                const monthNotes = notes.filter(
                  (note) =>
                    new Date(note.createdAt).toLocaleString("default", {
                      month: "long",
                    }) === month
                );
                const noteCount = monthNotes.length;

                const completedCount = monthTodos.filter(
                  (t) => t.completed
                ).length;
                const totalCount = monthTodos.length;
                const pendingCount = totalCount - completedCount;
                const completionPercentage =
                  totalCount > 0
                    ? Math.round((completedCount / totalCount) * 100)
                    : 0;

                const currentMonthIndex = new Date().getMonth();
                const isPastMonth = index < currentMonthIndex;

                return (
                  <div
                    key={month}
                    onClick={() => setSelectedMonth(month)}
                    className={`group flex flex-col items-center justify-center gap-2 p-6 sm:p-8 rounded-2xl border hover:shadow-lg transition-all cursor-pointer ${
                      isPastMonth
                        ? "bg-orange-200/10 border-orange-500 dark:bg-orange-950/10 dark:border-orange-900"
                        : "bg-white/60 hover:bg-orange-200 hover:border-orange-500 dark:bg-zinc-900/50 dark:hover:bg-orange-950/50 dark:hover:border-orange-800"
                    }`}
                  >
                    <h3
                      className={`text-xl font-semibold group-hover:scale-105 transition-transform duration-300 ${
                        isPastMonth
                          ? "text-gray-500 dark:text-gray-400"
                          : "text-orange-600 dark:text-orange-400"
                      }`}
                    >
                      {month}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
                      {totalCount} todos{" "}
                      <span className="text-red-500 dark:text-red-400">
                        {pendingCount} pending
                      </span>
                      <br />{" "}
                      <span className="text-green-600 dark:text-green-400">
                        {completedCount} completed
                      </span>{" "}
                      <span className="text-purple-500">
                        {noteCount} note{noteCount !== 1 ? "s" : ""}
                      </span>
                    </p>

                    {totalCount > 0 && (
                      <>
                        <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 mt-1">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${completionPercentage}%`,
                            }}
                          />
                        </div>
                        <p
                          className={cn(
                            "text-xl font-bold mt-1",
                            completionPercentage < 50
                              ? "text-red-500"
                              : completionPercentage < 90
                                ? "text-yellow-500"
                                  : "text-green-500"
                          )}
                        >
                          {completionPercentage}% completed
                        </p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-3 sm:p-4 h-full">
              {(() => {
                switch (monthViewType) {
                  case "todos":
                    if (filteredTodos.length === 0) {
                      return (
                        <p className="text-center text-muted-foreground py-4 text-sm sm:text-base">
                          No todos for {selectedMonth}! Add a todo to get
                          started.
                        </p>
                      );
                    }

                    // Group todos by week
                    const todosByWeek: Todo[][] = [[], [], [], []];
                    filteredTodos.forEach((todo) => {
                      const dueDate = new Date(todo.dueDate || todo.createdAt);
                      const firstDayOfMonth = new Date(
                        dueDate.getFullYear(),
                        dueDate.getMonth(),
                        1
                      );
                      const dayOfMonth = dueDate.getDate();
                      const weekNumber = Math.floor(
                        (firstDayOfMonth.getDay() + dayOfMonth - 1) / 7
                      );
                      const weekIndex = Math.min(weekNumber, 3);
                      todosByWeek[weekIndex].push(todo);
                    });

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                        {todosByWeek.map((weekTodos, weekIndex) => (
                          <div
                            key={weekIndex}
                            className="flex flex-col border rounded-lg bg-white dark:bg-black h-full min-h-[25rem]" // uniform height
                          >
                            <div className="p-3 border-b">
                              <h3 className="font-medium">
                                Week {weekIndex + 1}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                {weekTodos.filter((t) => !t.completed).length}{" "}
                                pending,{" "}
                                {weekTodos.filter((t) => t.completed).length}{" "}
                                completed
                              </p>
                            </div>

                            {/* Scrollable todos list with grow behavior */}
                            <div className="flex-1 overflow-auto p-2 space-y-2">
                              {weekTodos.length > 0 ? (
                                weekTodos.map((todo) => (
                                  <div
                                    key={todo.id}
                                    className={`flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-md border ${
                                      todo.completed
                                        ? "bg-green-50 dark:bg-green-900/20"
                                        : "bg-white dark:bg-black"
                                    }`}
                                  >
                                    <Checkbox
                                      checked={todo.completed}
                                      onCheckedChange={() =>
                                        toggleTodo(todo.id)
                                      }
                                      className="mt-1 flex-shrink-0"
                                    />
                                    {editingId === todo.id ? (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                                        <Input
                                          value={editText}
                                          onChange={(e) =>
                                            setEditText(e.target.value)
                                          }
                                          className="text-sm sm:text-base w-full"
                                        />
                                        <div className="flex gap-2">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              updateTodo(todo.id, {
                                                title: editText,
                                              });
                                              setEditingId(null);
                                            }}
                                          >
                                            Save
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setEditingId(null)}
                                          >
                                            Cancel
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
                                        <div>
                                          <p
                                            className={`text-sm sm:text-base break-words truncate ${
                                              todo.completed
                                                ? "line-through opacity-75"
                                                : ""
                                            }`}
                                            style={{ wordBreak: "break-word" }}
                                          >
                                            {todo.title}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            Due:{" "}
                                            {new Date(
                                              todo.dueDate || todo.createdAt
                                            ).toLocaleDateString()}
                                          </p>
                                        </div>
                                        <div className="flex gap-2">
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            className="flex-shrink-0 text-xs sm:text-sm"
                                            onClick={() =>
                                              handleEditStart(todo)
                                            }
                                          >
                                            <FiEdit2 className="w-4 h-4" />
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            className="flex-shrink-0 text-xs sm:text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400"
                                            onClick={() => {
                                              if (
                                                confirm(
                                                  "Are you sure you want to delete this todo?"
                                                )
                                              ) {
                                                deleteTodo(todo.id);
                                              }
                                            }}
                                          >
                                            <FiTrash2 className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <p className="text-center text-muted-foreground py-4 text-sm sm:text-base">
                                  No todos for this week
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    );

                  case "notes":
                    const monthNotes = notes.filter(
                      (note) =>
                        new Date(note.createdAt).toLocaleString("default", {
                          month: "long",
                        }) === selectedMonth
                    );

                    return monthNotes.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {monthNotes.map((note) => (
                          <div
                            key={note.id}
                            className="border border-orange-300 dark:border-orange-800 rounded-md bg-white/80 dark:bg-zinc-900/40 p-3 flex justify-between items-start"
                          >
                            <div>
                              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                                {note.text}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(note.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                              onClick={() => {
                                if (
                                  confirm(
                                    "Are you sure you want to delete this note?"
                                  )
                                ) {
                                  deleteNote(note.id); // 🟠 make sure this function exists
                                }
                              }}
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-4 text-sm sm:text-base">
                        No notes for {selectedMonth}. Add one above!
                      </p>
                    );

                  default:
                    return null;
                }
              })()}
            </div>
          )}
        </ScrollArea>
      </main>
    </>
  );
};

export default Page;
