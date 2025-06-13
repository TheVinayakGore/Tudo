"use client";
import React, { useState, useEffect, useMemo } from "react";
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
import { IoAdd, IoTrash } from "react-icons/io5";
import { FiEdit3 } from "react-icons/fi";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { useTodoStore } from "@/store/todo-store";
import type { Todo } from "@/store/todo-store";
import { cn } from "@/lib/utils";
import { TfiControlBackward } from "react-icons/tfi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "react-hot-toast";
import { Textarea } from "@/components/ui/textarea";
import { VscEyeClosed } from "react-icons/vsc";

// Add Note type and store
type Note = {
  id: string;
  text: string;
  createdAt: string;
};

type NoteStore = {
  notes: Note[];
  addNote: (note: Omit<Note, "id">) => void;
  deleteNote: (id: string) => void;
  editNote: (id: string, note: Omit<Note, "id">) => void;
};

const useNoteStore = create<NoteStore>()(
  persist(
    (set) => ({
      notes: [],
      addNote: (note: Omit<Note, "id">) => {
        const newNote = {
          id: crypto.randomUUID(),
          ...note,
        };
        set((state) => ({
          notes: [...state.notes, newNote],
        }));
        toast.success("Note added!");
      },
      deleteNote: (id: string) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        }));
        toast.success("Note deleted!");
      },
      editNote: (id: string, note: Omit<Note, "id">) => {
        set((state) => ({
          notes: state.notes.map((n) => (n.id === id ? { ...n, ...note } : n)),
        }));
        toast.success("Note updated!");
      },
    }),
    {
      name: "note-storage",
    }
  )
);

const Page = () => {
  const {
    todos,
    toggleTodo,
    addTodo,
    deleteTodo,
    deleteSubTodo,
    updateTodo,
    updateSubTodo,
  } = useTodoStore();
  const { notes, addNote, deleteNote, editNote } = useNoteStore();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [newTodoText, setNewTodoText] = useState("");
  const [newTodoDesc, setNewTodoDesc] = useState("");
  const [newTodoDate, setNewTodoDate] = useState<Date | undefined>(new Date());
  const [newNoteText, setNewNoteText] = useState("");
  const [newNoteDate, setNewNoteDate] = useState<Date | undefined>(new Date());
  const [monthViewType, setMonthViewType] = useState<"todos" | "notes">(
    "todos"
  );
  const [todoToDelete, setTodoToDelete] = useState<Todo | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [showSubTodoForm, setShowSubTodoForm] = useState(false);
  const [subTodoInputs, setSubTodoInputs] = useState<string[]>([""]);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editingSubTodo, setEditingSubTodo] = useState<{
    todoId: string;
    subTodoId: string;
  } | null>(null);
  const [editSubTodoText, setEditSubTodoText] = useState("");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editNoteText, setEditNoteText] = useState("");
  const [editNoteDate, setEditNoteDate] = useState<Date | undefined>(
    new Date()
  );
  const [showNoteForm, setShowNoteForm] = useState(false);

  // Add useEffect to save page state
  useEffect(() => {
    const pageState = {
      selectedMonth,
      monthViewType,
      showSubTodoForm,
      showNoteForm,
    };
    localStorage.setItem("todoPageState", JSON.stringify(pageState));
  }, [selectedMonth, monthViewType, showSubTodoForm, showNoteForm]);

  // Add useEffect to restore page state
  useEffect(() => {
    const savedState = localStorage.getItem("todoPageState");
    if (savedState) {
      const {
        selectedMonth: savedMonth,
        monthViewType: savedViewType,
        showSubTodoForm: savedSubTodoForm,
        showNoteForm: savedNoteForm,
      } = JSON.parse(savedState);

      if (savedMonth) setSelectedMonth(savedMonth);
      if (savedViewType) setMonthViewType(savedViewType);
      if (savedSubTodoForm) setShowSubTodoForm(savedSubTodoForm);
      if (savedNoteForm) setShowNoteForm(savedNoteForm);
    }
  }, []);

  // Add useEffect to save form states
  useEffect(() => {
    const formStates = {
      newTodoText,
      newTodoDesc,
      newTodoDate:
        newTodoDate instanceof Date ? newTodoDate.toISOString() : undefined,
      newNoteText,
      newNoteDate:
        newNoteDate instanceof Date ? newNoteDate.toISOString() : undefined,
      subTodoInputs,
      editSubTodoText,
      editNoteText,
      editNoteDate:
        editNoteDate instanceof Date ? editNoteDate.toISOString() : undefined,
    };
    localStorage.setItem("todoFormStates", JSON.stringify(formStates));
  }, [
    newTodoText,
    newTodoDesc,
    newTodoDate,
    newNoteText,
    newNoteDate,
    subTodoInputs,
    editSubTodoText,
    editNoteText,
    editNoteDate,
  ]);

  // Add useEffect to restore form states
  useEffect(() => {
    const savedFormStates = localStorage.getItem("todoFormStates");
    if (savedFormStates) {
      const {
        newTodoText: savedTodoText,
        newTodoDesc: savedTodoDesc,
        newTodoDate: savedTodoDate,
        newNoteText: savedNoteText,
        newNoteDate: savedNoteDate,
        subTodoInputs: savedSubTodoInputs,
        editSubTodoText: savedEditSubTodoText,
        editNoteText: savedEditNoteText,
        editNoteDate: savedEditNoteDate,
      } = JSON.parse(savedFormStates);

      if (savedTodoText) setNewTodoText(savedTodoText);
      if (savedTodoDesc) setNewTodoDesc(savedTodoDesc);
      if (savedTodoDate) setNewTodoDate(new Date(savedTodoDate));
      if (savedNoteText) setNewNoteText(savedNoteText);
      if (savedNoteDate) setNewNoteDate(new Date(savedNoteDate));
      if (savedSubTodoInputs) setSubTodoInputs(savedSubTodoInputs);
      if (savedEditSubTodoText) setEditSubTodoText(savedEditSubTodoText);
      if (savedEditNoteText) setEditNoteText(savedEditNoteText);
      if (savedEditNoteDate) setEditNoteDate(new Date(savedEditNoteDate));
    }
  }, []);

  // Add useEffect to save editing states
  useEffect(() => {
    const editingStates = {
      editingTodo: editingTodo
        ? {
            ...editingTodo,
            dueDate:
              editingTodo.dueDate instanceof Date
                ? editingTodo.dueDate.toISOString()
                : editingTodo.dueDate,
            createdAt:
              editingTodo.createdAt instanceof Date
                ? editingTodo.createdAt.toISOString()
                : editingTodo.createdAt,
          }
        : null,
      editingSubTodo,
      editingNote: editingNote
        ? {
            ...editingNote,
            createdAt: editingNote.createdAt,
          }
        : null,
    };
    localStorage.setItem("todoEditingStates", JSON.stringify(editingStates));
  }, [editingTodo, editingSubTodo, editingNote]);

  // Add useEffect to restore editing states
  useEffect(() => {
    const savedEditingStates = localStorage.getItem("todoEditingStates");
    if (savedEditingStates) {
      const {
        editingTodo: savedEditingTodo,
        editingSubTodo: savedEditingSubTodo,
        editingNote: savedEditingNote,
      } = JSON.parse(savedEditingStates);

      if (savedEditingTodo) {
        setEditingTodo({
          ...savedEditingTodo,
          dueDate: savedEditingTodo.dueDate
            ? new Date(savedEditingTodo.dueDate)
            : undefined,
          createdAt: new Date(savedEditingTodo.createdAt),
        });
      }
      if (savedEditingSubTodo) setEditingSubTodo(savedEditingSubTodo);
      if (savedEditingNote) {
        setEditingNote({
          ...savedEditingNote,
          createdAt: savedEditingNote.createdAt,
        });
      }
    }
  }, []);

  // Add useEffect to save selected states
  useEffect(() => {
    const selectedStates = {
      selectedTodo: selectedTodo
        ? {
            ...selectedTodo,
            dueDate:
              selectedTodo.dueDate instanceof Date
                ? selectedTodo.dueDate.toISOString()
                : selectedTodo.dueDate,
            createdAt:
              selectedTodo.createdAt instanceof Date
                ? selectedTodo.createdAt.toISOString()
                : selectedTodo.createdAt,
          }
        : null,
      todoToDelete: todoToDelete
        ? {
            ...todoToDelete,
            dueDate:
              todoToDelete.dueDate instanceof Date
                ? todoToDelete.dueDate.toISOString()
                : todoToDelete.dueDate,
            createdAt:
              todoToDelete.createdAt instanceof Date
                ? todoToDelete.createdAt.toISOString()
                : todoToDelete.createdAt,
          }
        : null,
      noteToDelete: noteToDelete
        ? {
            ...noteToDelete,
            createdAt: noteToDelete.createdAt,
          }
        : null,
    };
    localStorage.setItem("todoSelectedStates", JSON.stringify(selectedStates));
  }, [selectedTodo, todoToDelete, noteToDelete]);

  // Add useEffect to restore selected states
  useEffect(() => {
    const savedSelectedStates = localStorage.getItem("todoSelectedStates");
    if (savedSelectedStates) {
      const {
        selectedTodo: savedSelectedTodo,
        todoToDelete: savedTodoToDelete,
        noteToDelete: savedNoteToDelete,
      } = JSON.parse(savedSelectedStates);

      if (savedSelectedTodo) {
        setSelectedTodo({
          ...savedSelectedTodo,
          dueDate: savedSelectedTodo.dueDate
            ? new Date(savedSelectedTodo.dueDate)
            : undefined,
          createdAt: new Date(savedSelectedTodo.createdAt),
        });
      }
      if (savedTodoToDelete) {
        setTodoToDelete({
          ...savedTodoToDelete,
          dueDate: savedTodoToDelete.dueDate
            ? new Date(savedTodoToDelete.dueDate)
            : undefined,
          createdAt: new Date(savedTodoToDelete.createdAt),
        });
      }
      if (savedNoteToDelete) {
        setNoteToDelete({
          ...savedNoteToDelete,
          createdAt: savedNoteToDelete.createdAt,
        });
      }
    }
  }, []);

  // Clear localStorage when component unmounts
  useEffect(() => {
    return () => {
      localStorage.removeItem("todoPageState");
      localStorage.removeItem("todoFormStates");
      localStorage.removeItem("todoEditingStates");
      localStorage.removeItem("todoSelectedStates");
    };
  }, []);

  const months = useMemo(
    () => [
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
    ],
    []
  );

  // Function to check if a month is expired
  const isMonthExpired = (month: string) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const monthIndex = months.indexOf(month);

    // If the month is in the past, it's expired
    if (
      monthIndex < currentMonth ||
      (monthIndex === currentMonth && currentYear > new Date().getFullYear())
    ) {
      return true;
    }

    return false;
  };

  // Add this effect to set default date when month changes
  useEffect(() => {
    if (selectedMonth) {
      const monthIndex = months.indexOf(selectedMonth);
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      // If selected month is current month, use current date
      if (monthIndex === currentMonth) {
        setNewNoteDate(currentDate);
        setNewTodoDate(currentDate);
      } else {
        // For other months, use first day of the month
        const firstDayOfMonth = new Date(currentYear, monthIndex, 1);
        setNewNoteDate(firstDayOfMonth);
        setNewTodoDate(firstDayOfMonth);
      }
    }
  }, [selectedMonth, months]);

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

  // Add this function to clear all forms
  const clearAllForms = () => {
    setNewTodoText("");
    setNewTodoDesc("");
    setNewTodoDate(new Date());
    setShowSubTodoForm(false);
    setSubTodoInputs([""]);
    setEditingTodo(null);
    setEditingSubTodo(null);
    setEditSubTodoText("");
  };

  // Add this function to handle todo editing
  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setNewTodoText(todo.title);
    setNewTodoDesc(todo.description || "");
    setNewTodoDate(todo.dueDate ? new Date(todo.dueDate) : new Date());
    if (todo.subTodos && todo.subTodos.length > 0) {
      setSubTodoInputs(todo.subTodos.map((st) => st.title));
      setShowSubTodoForm(true);
    }
  };

  // Add this function to handle subtodo editing
  const handleEditSubTodo = (
    todoId: string,
    subTodoId: string,
    currentTitle: string
  ) => {
    setEditingSubTodo({ todoId, subTodoId });
    setEditSubTodoText(currentTitle);
  };

  // Modify the handleAddTodo function
  const handleAddTodo = () => {
    if (!newTodoText.trim()) return;

    const newTodo = {
      title: newTodoText,
      description: newTodoDesc,
      completed: false,
      createdAt: new Date(),
      dueDate: newTodoDate,
      subTodos: subTodoInputs
        .filter((subTodo) => subTodo.trim())
        .map((subTodo) => ({
          id: Date.now().toString() + Math.random(),
          title: subTodo,
          completed: false,
          createdAt: new Date(),
        })),
    };

    if (editingTodo) {
      // Update existing todo with subtodos
      updateTodo(editingTodo.id, {
        title: newTodoText,
        description: newTodoDesc,
        dueDate: newTodoDate?.toISOString(),
        subTodos: newTodo.subTodos,
      });
    } else {
      // Add new todo
      addTodo(newTodo);
    }

    clearAllForms();
  };

  // Update the note handling functions
  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    addNote({
      text: newNoteText,
      createdAt: (newNoteDate ?? new Date()).toISOString(),
    });
    setNewNoteText("");
    setNewNoteDate(new Date());
  };

  function formatDateTime(date: string | Date) {
    const d = new Date(date);
    const options = {
      year: "numeric" as const,
      month: "short" as const,
      day: "numeric" as const,
      hour: "numeric" as const,
      minute: "2-digit" as const,
      hour12: true,
    };

    return d.toLocaleString(undefined, options);
  }

  const getDayColor = (day: string) => {
    const colors = {
      MON: "bg-red-500",
      TUE: "bg-orange-500",
      WED: "bg-yellow-500",
      THU: "bg-green-500",
      FRI: "bg-blue-500",
      SAT: "bg-indigo-500",
      SUN: "bg-violet-500",
    };
    return colors[day as keyof typeof colors] || "bg-zinc-500";
  };

  const getDayInitial = (date: Date) => {
    const day = date.getDay();
    // Convert Sunday (0) to 7, then subtract 1 to get Monday as 0
    const adjustedDay = (day === 0 ? 7 : day) - 1;
    const initials = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
    return initials[adjustedDay];
  };

  return (
    <>
      <main className="flex flex-col items-start justify-start m-auto gap-5 px-5 md:px-10 py-24 w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5 w-full">
          <div className="text-lg sm:text-2xl md:text-4xl font-medium">
            {selectedMonth ? (
              <>
                {`Todos for ${selectedMonth} (${filteredTodos.length}) - Pending (${
                  filteredTodos.filter((t) => !t.completed).length
                }) - `}
                <span className="text-primary font-semibold">
                  {Math.round(
                    (filteredTodos.filter((t) => t.completed).length /
                      filteredTodos.length || 0) * 100
                  )}
                  % completed
                </span>
              </>
            ) : (
              <>
                {`Total Todos (${todos.length}) / Pending (${todos.filter((t) => !t.completed).length}) - `}
                <span className="text-primary font-semibold">
                  {Math.round(
                    (todos.filter((t) => t.completed).length / todos.length ||
                      0) * 100
                  )}
                  % completed
                </span>
              </>
            )}
          </div>
        </div>

        {selectedMonth && (
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            {selectedMonth && (
              <button
                onClick={() => setSelectedMonth(null)}
                className="flex items-center justify-center gap-3 px-5 font-medium border rounded-md border-primary/30 text-primary/70 hover:text-white hover:bg-primary cursor-pointer w-full sm:w-auto"
              >
                <TfiControlBackward />
                <span>Go Back</span>
              </button>
            )}
            {!isMonthExpired(selectedMonth) && (
              <Button
                variant={monthViewType === "todos" ? "default" : "outline"}
                onClick={() => setMonthViewType("todos")}
                size="lg"
                className="w-full sm:w-40"
              >
                Show Todos
              </Button>
            )}
            <Button
              variant={monthViewType === "notes" ? "default" : "outline"}
              onClick={() => setMonthViewType("notes")}
              size="lg"
              className="w-full sm:w-40"
            >
              Show Notes
            </Button>
          </div>
        )}

        <ScrollArea className="rounded-md border border-primary/30 w-full h-auto">
          {!selectedMonth ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-3 sm:p-6 h-full">
              {months.map((month, index) => {
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
                    className={`group flex flex-col items-center justify-center gap-2 p-6 sm:p-8 rounded-2xl border hover:shadow-lg transition-all cursor-pointer h-[200px] ${
                      isPastMonth
                        ? "bg-orange-200/10 border-orange-500 dark:bg-orange-950/10 dark:border-orange-900"
                        : "bg-white/60 hover:bg-orange-200 hover:border-orange-500 dark:bg-zinc-900/50 dark:hover:bg-orange-950/50 dark:hover:border-orange-800"
                    }`}
                  >
                    <h3
                      className={`text-xl font-semibold group-hover:scale-105 transition-transform duration-300 ${
                        isPastMonth
                          ? "text-zinc-500 dark:text-zinc-400"
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

                    {totalCount > 0 ? (
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
                    ) : isPastMonth ? (
                      <p className="opacity-50 uppercase text-2xl font-normal">
                        No work Done !
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-3 sm:p-4 relative z-50 h-full">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-20 w-full">
                <h1 className="inline-flex text-3xl uppercase font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-500 w-1/4">
                  {selectedMonth}
                </h1>
                <div className="flex items-end justify-end gap-3 w-full">
                  <Button
                    onClick={() => setShowNoteForm(!showNoteForm)}
                    className={
                      showNoteForm ? "hidden" : "flex  gap-2 w-full sm:w-auto"
                    }
                  >
                    <IoAdd className="h-4 w-4" /> Add Note
                  </Button>
                  {showNoteForm && (
                    <div className="flex flex-col lg:flex-row items-start justify-between gap-3 w-full">
                      <div className="flex flex-col items-end relative w-full">
                        <Textarea
                          value={newNoteText}
                          onChange={(e) => setNewNoteText(e.target.value)}
                          placeholder="Add a note for this month..."
                          rows={1}
                          className="border-primary/30 w-full"
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            handleAddNote();
                            setShowNoteForm(false);
                          }}
                          className="absolute bottom-0 right-0 m-2 text-xs w-auto"
                        >
                          {" "}
                          Save Note
                        </Button>
                      </div>

                      <div className="flex flex-col gap-3 w-full lg:w-1/3">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="justify-start text-left font-normal w-full"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newNoteDate
                                ? format(newNoteDate, "PPP")
                                : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="border border-primary/30 overflow-hidden rounded-md w-auto mt-2 z-50">
                            <Calendar
                              mode="single"
                              selected={newNoteDate}
                              onSelect={(date: Date | undefined) =>
                                setNewNoteDate(date)
                              }
                              initialFocus
                              defaultMonth={newNoteDate}
                            />
                          </PopoverContent>
                        </Popover>

                        {showNoteForm && (
                          <Button onClick={() => setShowNoteForm(false)}>
                            Hide Form
                            <VscEyeClosed className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-3 my-5 w-full">
                {/* Add Todo Form */}
                {selectedMonth && !isMonthExpired(selectedMonth) ? (
                  <div className="flex flex-col gap-4 w-full">
                    <div className="flex flex-col md:flex-row gap-2 w-full">
                      <div className="flex gap-2 w-full md:w-1/3">
                        <Input
                          value={newTodoText}
                          onChange={(e) => setNewTodoText(e.target.value)}
                          placeholder="Add new todo..."
                          className="w-full"
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleAddTodo()
                          }
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="flex-shrink-0 text-xs sm:text-sm"
                          onClick={() => setShowSubTodoForm(!showSubTodoForm)}
                        >
                          {showSubTodoForm ? "▼" : "▶"}
                        </Button>
                      </div>

                      <Input
                        value={newTodoDesc}
                        onChange={(e) => setNewTodoDesc(e.target.value)}
                        placeholder="Add description (optional)"
                        className="flex-1"
                      />

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="flex-1 justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {newTodoDate ? (
                              format(newTodoDate, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="border border-primary/30 overflow-hidden rounded-md w-auto mt-2 z-50">
                          <Calendar
                            mode="single"
                            selected={newTodoDate}
                            onSelect={(date: Date | undefined) =>
                              setNewTodoDate(date)
                            }
                            initialFocus
                            defaultMonth={newTodoDate}
                            disabled={(date) => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              return date < today;
                            }}
                          />
                        </PopoverContent>
                      </Popover>

                      <Button
                        onClick={() => {
                          if (!newTodoText.trim()) return;

                          const newTodo = {
                            title: newTodoText,
                            description: newTodoDesc,
                            completed: false,
                            createdAt: new Date(),
                            dueDate: newTodoDate,
                            subTodos: subTodoInputs
                              .filter((subTodo) => subTodo.trim())
                              .map((subTodo) => ({
                                id: Date.now().toString() + Math.random(),
                                title: subTodo,
                                completed: false,
                                createdAt: new Date(),
                              })),
                          };

                          if (editingTodo) {
                            // Update existing todo with subtodos
                            updateTodo(editingTodo.id, {
                              title: newTodoText,
                              description: newTodoDesc,
                              dueDate: newTodoDate?.toISOString(),
                              subTodos: newTodo.subTodos,
                            });
                          } else {
                            // Add new todo
                            addTodo(newTodo);
                          }

                          // Clear all forms
                          clearAllForms();
                        }}
                        className="flex-1 gap-1"
                      >
                        <IoAdd className="h-4 w-4" />{" "}
                        {editingTodo ? "Update" : "Add"}
                      </Button>
                    </div>

                    {/* Sub-todos form section */}
                    {showSubTodoForm && (
                      <div className="flex flex-col gap-2 p-3 rounded-md border bg-white dark:bg-black">
                        {subTodoInputs.map((input, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={input}
                              onChange={(e) => {
                                const newInputs = [...subTodoInputs];
                                newInputs[index] = e.target.value;
                                setSubTodoInputs(newInputs);
                              }}
                              placeholder="Add sub-todo..."
                              className="flex-1"
                              onKeyDown={(e) => {
                                if (
                                  e.key === "Enter" &&
                                  input.trim() &&
                                  newTodoText.trim()
                                ) {
                                  const newTodo = {
                                    title: newTodoText,
                                    description: newTodoDesc,
                                    completed: false,
                                    createdAt: new Date(),
                                    dueDate: newTodoDate,
                                    subTodos: subTodoInputs
                                      .filter((subTodo) => subTodo.trim())
                                      .map((subTodo) => ({
                                        id:
                                          Date.now().toString() + Math.random(),
                                        title: subTodo,
                                        completed: false,
                                        createdAt: new Date(),
                                      })),
                                  };
                                  addTodo(newTodo);
                                  setSubTodoInputs([""]);
                                  setNewTodoText("");
                                  setNewTodoDesc("");
                                  setNewTodoDate(new Date());
                                  setShowSubTodoForm(false);
                                }
                              }}
                            />
                            {index === subTodoInputs.length - 1 ? (
                              <Button
                                size="icon"
                                className="flex-shrink-0 text-xs sm:text-sm"
                                onClick={() =>
                                  setSubTodoInputs([...subTodoInputs, ""])
                                }
                              >
                                <IoAdd className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                size="icon"
                                variant="outline"
                                className="flex-shrink-0 text-xs sm:text-sm"
                                onClick={() => {
                                  const newInputs = subTodoInputs.filter(
                                    (_, i) => i !== index
                                  );
                                  setSubTodoInputs(newInputs);
                                }}
                              >
                                <IoTrash className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : selectedMonth && isMonthExpired(selectedMonth) ? (
                  <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-md text-center">
                    <p className="text-zinc-600 dark:text-zinc-400">
                      Cannot add todos for expired months. You can still add
                      notes above.
                    </p>
                  </div>
                ) : null}
              </div>
              {(() => {
                switch (monthViewType) {
                  case "todos":
                    if (filteredTodos.length === 0) {
                      return (
                        <p className="text-center text-muted-foreground py-4 text-sm sm:text-base">
                          {isMonthExpired(selectedMonth)
                            ? "This month has expired. You can only add notes."
                            : `No todos for ${selectedMonth} ! Add a todo to get started.`}
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

                    // Function to get day of week (0 = Monday, 6 = Sunday)
                    const getDayOfWeek = (date: Date) => {
                      const day = date.getDay();
                      return day === 0 ? 6 : day - 1; // Convert Sunday (0) to 6, others shift by -1
                    };

                    // Sort todos within each week by day of week
                    todosByWeek.forEach((weekTodos) => {
                      weekTodos.sort((a, b) => {
                        const dateA = new Date(a.dueDate || a.createdAt);
                        const dateB = new Date(b.dueDate || b.createdAt);
                        return getDayOfWeek(dateA) - getDayOfWeek(dateB);
                      });
                    });

                    // Function to check if a week is expired
                    const isWeekExpired = (
                      weekIndex: number,
                      weekTodos: Todo[]
                    ) => {
                      const currentDate = new Date();
                      const currentMonth = currentDate.getMonth();
                      const currentYear = currentDate.getFullYear();
                      const currentDay = currentDate.getDate();

                      // Get the month index from selectedMonth
                      const monthIndex = months.indexOf(selectedMonth);

                      // If the month is in the past, all weeks are expired
                      if (
                        monthIndex < currentMonth ||
                        (monthIndex === currentMonth &&
                          currentYear > new Date().getFullYear())
                      ) {
                        return true;
                      }

                      // If it's the current month, check if the week has passed
                      if (monthIndex === currentMonth) {
                        const firstDayOfMonth = new Date(
                          currentYear,
                          currentMonth,
                          1
                        );
                        const weekNumber = Math.floor(
                          (firstDayOfMonth.getDay() + currentDay - 1) / 7
                        );

                        // If the week has no todos and is in the past, mark it as expired
                        if (weekTodos.length === 0 && weekIndex < weekNumber) {
                          return true;
                        }

                        return weekIndex < weekNumber;
                      }

                      return false;
                    };

                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {todosByWeek.map((weekTodos, weekIndex) => {
                          const expired = isWeekExpired(weekIndex, weekTodos);
                          return (
                            <TooltipProvider key={weekIndex}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className={`flex flex-col border rounded-lg overflow-auto ${
                                      expired
                                        ? "bg-zinc-100 dark:bg-zinc-800 opacity-60 cursor-not-allowed"
                                        : "bg-white dark:bg-black"
                                    }`}
                                  >
                                    <div className="p-3 border-b">
                                      <h3
                                        className={`font-medium ${expired ? "text-zinc-500" : ""}`}
                                      >
                                        Week {weekIndex + 1}
                                        {expired && " (Expired)"}
                                      </h3>
                                      <p className="text-xs text-muted-foreground">
                                        {
                                          weekTodos.filter((t) => !t.completed)
                                            .length
                                        }{" "}
                                        pending,{" "}
                                        {
                                          weekTodos.filter((t) => t.completed)
                                            .length
                                        }{" "}
                                        completed
                                      </p>
                                    </div>

                                    {/* Scrollable todos list with grow behavior */}
                                    <div className="flex-1 overflow-auto p-2 space-y-2">
                                      {weekTodos.length > 0 ? (
                                        weekTodos.map((todo) => (
                                          <div
                                            key={todo.id}
                                            className={`flex flex-col gap-2 rounded-lg border ${
                                              getDayInitial(
                                                new Date(
                                                  todo.dueDate || todo.createdAt
                                                )
                                              ) === "SUN"
                                                ? "border-emerald-300 dark:border-emerald-950 bg-emerald-100/30 hover:bg-emerald-100/70 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/70"
                                                : "bg-white dark:bg-black hover:bg-zinc-50 dark:hover:bg-zinc-900"
                                            } cursor-pointer`}
                                            onClick={() =>
                                              setSelectedTodo(todo)
                                            }
                                          >
                                            <div className="flex items-ceneter w-full">
                                              <div
                                                className={`flex items-center justify-center text-white text-xs font-bold rounded-l-md w-10 ${getDayColor(getDayInitial(new Date(todo.dueDate || todo.createdAt)))}`}
                                              >
                                                {getDayInitial(
                                                  new Date(
                                                    todo.dueDate ||
                                                      todo.createdAt
                                                  )
                                                )}
                                              </div>
                                              <div className="flex items-center justify-between p-2 sm:p-3 w-full">
                                                <div className="flex items-center gap-2">
                                                  <div
                                                    onClick={(e) =>
                                                      e.stopPropagation()
                                                    }
                                                  >
                                                    <Checkbox
                                                      checked={todo.completed}
                                                      onCheckedChange={() =>
                                                        toggleTodo(todo.id)
                                                      }
                                                      className={`border ${
                                                        getDayInitial(
                                                          new Date(
                                                            todo.dueDate ||
                                                              todo.createdAt
                                                          )
                                                        ) === "SUN"
                                                          ? "border-emerald-300 dark:border-emerald-950"
                                                          : ""
                                                      } cursor-pointer`}
                                                    />
                                                  </div>
                                                  <div className="flex flex-col">
                                                    <span
                                                      className={`${
                                                        todo.completed
                                                          ? "line-through text-muted-foreground"
                                                          : ""
                                                      } overflow-auto`}
                                                    >
                                                      {todo.title.slice(0, 30)}
                                                      ...
                                                    </span>
                                                    {todo.description && (
                                                      <span className="text-sm text-muted-foreground">
                                                        {todo.description}
                                                      </span>
                                                    )}
                                                    <span className="text-xs text-muted-foreground">
                                                      Due:{" "}
                                                      {formatDateTime(
                                                        todo.dueDate ||
                                                          todo.createdAt
                                                      )}
                                                    </span>
                                                  </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                  <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className={`flex-shrink-0 text-xs sm:text-sm border ${
                                                      getDayInitial(
                                                        new Date(
                                                          todo.dueDate ||
                                                            todo.createdAt
                                                        )
                                                      ) === "SUN"
                                                        ? "border-emerald-300 dark:border-emerald-950"
                                                        : ""
                                                    } cursor-pointer`}
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setTodoToDelete(todo);
                                                    }}
                                                  >
                                                    <IoTrash className="h-4 w-4" />
                                                  </Button>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        ))
                                      ) : (
                                        <p className="text-center text-muted-foreground py-4 text-sm sm:text-base">
                                          No todos for this week
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </TooltipTrigger>
                                {expired && (
                                  <TooltipContent>
                                    <p>
                                      Can&apos;t add the Todos for this Expired
                                      Week !
                                    </p>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })}
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
                            {editingNote?.id === note.id ? (
                              <div className="flex flex-col gap-2 w-full">
                                <Input
                                  value={editNoteText}
                                  onChange={(e) =>
                                    setEditNoteText(e.target.value)
                                  }
                                  placeholder="Edit your note..."
                                  className="w-full"
                                />
                                <div className="flex flex-wrap gap-2">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className="justify-start text-left font-normal w-full sm:w-64"
                                      >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {editNoteDate
                                          ? format(editNoteDate, "PPP")
                                          : "Pick a date"}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="border border-primary/30 overflow-hidden rounded-md w-auto mt-2 z-50">
                                      <Calendar
                                        mode="single"
                                        selected={editNoteDate}
                                        onSelect={(date: Date | undefined) =>
                                          setEditNoteDate(date)
                                        }
                                        initialFocus
                                        defaultMonth={editNoteDate}
                                      />
                                    </PopoverContent>
                                  </Popover>
                                  <Button
                                    onClick={() => {
                                      if (editNoteText.trim() && editNoteDate) {
                                        editNote(note.id, {
                                          text: editNoteText,
                                          createdAt: editNoteDate.toISOString(),
                                        });
                                        setEditingNote(null);
                                        setEditNoteText("");
                                        setEditNoteDate(new Date());
                                      }
                                    }}
                                    className="w-full sm:w-40"
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setEditingNote(null);
                                      setEditNoteText("");
                                      setEditNoteDate(new Date());
                                    }}
                                    className="w-full sm:w-40"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div>
                                  <p className="text-base text-zinc-700 dark:text-zinc-300">
                                    {note.text}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-5">
                                    {new Date(
                                      note.createdAt
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                      setEditingNote(note);
                                      setEditNoteText(note.text);
                                      setEditNoteDate(new Date(note.createdAt));
                                    }}
                                  >
                                    <FiEdit3 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setNoteToDelete(note)}
                                  >
                                    <IoTrash className="w-4 h-4" />
                                  </Button>
                                </div>
                              </>
                            )}
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

        <AlertDialog
          open={!!todoToDelete}
          onOpenChange={() => setTodoToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Todo</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this todo? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (todoToDelete) {
                    deleteTodo(todoToDelete.id);
                    setTodoToDelete(null);
                    toast.success("Todo deleted successfully!");
                  }
                }}
                className="bg-red-500 hover:bg-red-600"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog
          open={!!noteToDelete}
          onOpenChange={() => setNoteToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Note</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this note? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (noteToDelete) {
                    deleteNote(noteToDelete.id);
                    setNoteToDelete(null);
                    toast.success("Note deleted successfully!");
                  }
                }}
                className="bg-red-500 hover:bg-red-600"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog
          open={!!selectedTodo}
          onOpenChange={() => setSelectedTodo(null)}
        >
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
                    {selectedTodo.subTodos &&
                    selectedTodo.subTodos.length > 0 ? (
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
                                    setSelectedTodo((prev) => {
                                      if (!prev) return null;
                                      return {
                                        ...prev,
                                        subTodos:
                                          prev.subTodos?.map((st) =>
                                            st.id === subTodo.id
                                              ? { ...st, title: newText }
                                              : st
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
                                    onClick={() =>
                                      handleEditSubTodo(
                                        selectedTodo.id,
                                        subTodo.id,
                                        subTodo.title
                                      )
                                    }
                                  >
                                    <FiEdit3 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="flex-shrink-0 text-xs sm:text-sm"
                                    onClick={() => {
                                      if (selectedTodo) {
                                        deleteSubTodo(
                                          selectedTodo.id,
                                          subTodo.id
                                        );
                                        // Update the selectedTodo to reflect the deletion immediately
                                        setSelectedTodo((prev) => {
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
      </main>
    </>
  );
};

export default Page;
