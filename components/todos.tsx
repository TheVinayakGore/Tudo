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
import MonthCard from "@/components/MonthCard";
import TodoEntryForm from "@/components/TodoEntryForm";
import NoteEntryForm from "@/components/NoteEntryForm";
import TodoDetailDialog from "@/components/TodoDetailDialog";
import WorkHoursDialog from "@/components/WorkHoursDialog";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "react-hot-toast";

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
      },
      deleteNote: (id: string) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        }));
      },
      editNote: (id: string, note: Omit<Note, "id">) => {
        set((state) => ({
          notes: state.notes.map((n) => (n.id === id ? { ...n, ...note } : n)),
        }));
      },
    }),
    {
      name: "note-storage",
    }
  )
);

const Todos = () => {
  const {
    todos,
    toggleTodo,
    addTodo,
    deleteTodo,
    deleteSubTodo,
    updateTodo,
    updateSubTodo,
    updateWorkHours,
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
  const [showWorkHoursDialog, setShowWorkHoursDialog] = useState(false);
  const [selectedTodoForWorkHours, setSelectedTodoForWorkHours] =
    useState<Todo | null>(null);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonthIndex = currentDate.getMonth();
  const currentDayOfMonth = currentDate.getDate();

  // Add useEffect to save Todos state
  useEffect(() => {
    const TodosState = {
      selectedMonth,
      monthViewType,
      showSubTodoForm,
      showNoteForm,
    };
    localStorage.setItem("todoTodosState", JSON.stringify(TodosState));
  }, [selectedMonth, monthViewType, showSubTodoForm, showNoteForm]);

  // Add useEffect to restore Todos state
  useEffect(() => {
    const savedState = localStorage.getItem("todoTodosState");
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
      localStorage.removeItem("todoTodosState");
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

  // Add useEffect to set default date when month changes
  useEffect(() => {
    if (selectedMonth) {
      const monthIndex = months.indexOf(selectedMonth);
      const currentYear = new Date().getFullYear();
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();

      // If selected month is current month, use current date
      // Otherwise use first day of the selected month
      const defaultDate =
        monthIndex === currentMonth
          ? currentDate
          : new Date(currentYear, monthIndex, 1);

      setNewNoteDate(defaultDate);
      setNewTodoDate(defaultDate);
      setEditNoteDate(defaultDate);
    }
  }, [selectedMonth, months]);

  // Add function to get default month for calendar
  const getDefaultMonth = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();

    if (selectedMonth) {
      const monthIndex = months.indexOf(selectedMonth);
      // If selected month is current month, use current date
      // Otherwise use first day of the selected month
      return monthIndex === currentMonth
        ? currentDate
        : new Date(currentDate.getFullYear(), monthIndex, 1);
    }
    return currentDate;
  };

  // Modify the clearAllForms function to reset date
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

  // Modify the handleAddTodo function
  const handleAddTodo = () => {
    if (!newTodoText.trim()) {
      toast.error("Please enter a title for your todo!", {
        duration: 3000,
      });
      return;
    }

    if (!newTodoDate) {
      toast.error("Please select a date for your todo!", {
        duration: 3000,
      });
      return;
    }

    // Check if there's already a todo on the selected date, but only for new todos
    if (!editingTodo && newTodoDate && hasTodoOnDate(newTodoDate)) {
      toast.error(
        "This date already has 1 todo so you can't add the another one for the same date. Or you can add the sub-todos for that same date, it's allowed !",
        {
          duration: 3000,
          style: {
            maxWidth: "500px",
            whiteSpace: "pre-wrap",
          },
        }
      );
      return;
    }

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
      toast.success("Todo updated successfully!");
    } else {
      // Add new todo
      addTodo(newTodo);
      toast.success("Todo added successfully!");
    }

    clearAllForms();
  };

  // Update the handleEditTodo function
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

  // Add effect to reset date when showSubTodoForm changes
  useEffect(() => {
    if (!showSubTodoForm) {
      setNewTodoDate(new Date());
    }
  }, [showSubTodoForm]);

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

  // Add this function to check for duplicate todos on the same date
  const hasTodoOnDate = (date: Date) => {
    return todos.some((todo) => {
      const todoDate = new Date(todo.dueDate || todo.createdAt);
      return (
        todoDate.getFullYear() === date.getFullYear() &&
        todoDate.getMonth() === date.getMonth() &&
        todoDate.getDate() === date.getDate()
      );
    });
  };

  // Update the note handling functions
  const handleAddNote = () => {
    if (!newNoteText.trim()) {
      toast.error("Please enter some text for your note!", {
        duration: 3000,
      });
      return;
    }

    if (!newNoteDate) {
      toast.error("Please select a date for your note!", {
        duration: 3000,
      });
      return;
    }

    addNote({
      text: newNoteText,
      createdAt: (newNoteDate ?? new Date()).toISOString(),
    });
    setNewNoteText("");
    setNewNoteDate(new Date());
    setShowNoteForm(false);
    toast.success("Note added successfully!");
  };

  // Update the handleEditNote function
  const handleEditNote = (note: Note) => {
    if (!editNoteText.trim()) {
      toast.error("Please enter some text for your note!", {
        duration: 3000,
      });
      return;
    }

    if (!editNoteDate) {
      toast.error("Please select a date for your note!", {
        duration: 3000,
      });
      return;
    }

    editNote(note.id, {
      text: editNoteText,
      createdAt: editNoteDate.toISOString(),
    });
    setEditingNote(null);
    setEditNoteText("");
    setEditNoteDate(new Date());
    toast.success("Note updated successfully!");
  };

  // Add function to handle note form close
  const handleNoteFormClose = () => {
    if (newNoteText.trim()) {
      toast.error("Please save or clear your note before closing!", {
        duration: 3000,
      });
      return;
    }
    setShowNoteForm(false);
  };

  function formatDateTime(date: string | Date) {
    const d = new Date(date);
    const options = {
      year: "numeric" as const,
      month: "short" as const,
      day: "numeric" as const,
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

  const handleWorkHoursSave = (todoId: string, hours: number) => {
    updateWorkHours(todoId, hours);
    toggleTodo(todoId, hours);
  };

  return (
    <>
      <main id="todos" className="flex flex-col items-start gap-5 py-20 w-full">
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

                // Calculate ideal completion percentage
                const daysInMonth = new Date(
                  currentYear,
                  index + 1,
                  0
                ).getDate();

                let totalBaselineHours = 0;
                let completedWorkHours = 0;

                if (index < currentMonthIndex) {
                  // Past months: calculate ideal hours for the entire month
                  totalBaselineHours = daysInMonth * 12; // Assuming 12 hours BASELINE_HOURS
                } else if (index === currentMonthIndex) {
                  // Current month: calculate ideal hours up to the current day
                  totalBaselineHours = currentDayOfMonth * 12; // Accessing the top-level currentDayOfMonth
                } else {
                  // Future months: 0 ideal hours for now, or total for month if needed
                  totalBaselineHours = 0; // Or daysInMonth * 12 if you want to show full potential
                }

                completedWorkHours = monthTodos.reduce((sum, todo) => {
                  return (
                    sum +
                    (todo.completed && typeof todo.workHours === "number"
                      ? todo.workHours
                      : 0)
                  );
                }, 0);

                const idealCompletionPercentage =
                  totalBaselineHours > 0
                    ? Math.round(
                        (completedWorkHours / totalBaselineHours) * 100
                      )
                    : 0;

                // Calculate average daily work hours for the month
                const daysConsideredForAverage =
                  index === currentMonthIndex ? currentDayOfMonth : daysInMonth;
                const averageDailyWorkHours =
                  daysConsideredForAverage > 0
                    ? completedWorkHours / daysConsideredForAverage
                    : 0;

                const isPastMonth = index < currentMonthIndex;

                return (
                  <MonthCard
                    key={month}
                    month={month}
                    index={index}
                    totalCount={totalCount}
                    pendingCount={pendingCount}
                    completedCount={completedCount}
                    noteCount={noteCount}
                    completionPercentage={completionPercentage}
                    idealCompletionPercentage={idealCompletionPercentage}
                    averageDailyWorkHours={averageDailyWorkHours}
                    isPastMonth={isPastMonth}
                    setSelectedMonth={setSelectedMonth}
                  />
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
                    <NoteEntryForm
                      newNoteText={newNoteText}
                      setNewNoteText={setNewNoteText}
                      newNoteDate={newNoteDate}
                      setNewNoteDate={setNewNoteDate}
                      handleAddNote={handleAddNote}
                      handleNoteFormClose={handleNoteFormClose}
                      getDefaultMonth={getDefaultMonth}
                      showNoteForm={showNoteForm}
                    />
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-3 my-5 w-full">
                {/* Add Todo Form */}
                {selectedMonth && !isMonthExpired(selectedMonth) ? (
                  <TodoEntryForm
                    newTodoText={newTodoText}
                    setNewTodoText={setNewTodoText}
                    newTodoDesc={newTodoDesc}
                    setNewTodoDesc={setNewTodoDesc}
                    newTodoDate={newTodoDate}
                    setNewTodoDate={setNewTodoDate}
                    showSubTodoForm={showSubTodoForm}
                    setShowSubTodoForm={setShowSubTodoForm}
                    subTodoInputs={subTodoInputs}
                    setSubTodoInputs={setSubTodoInputs}
                    handleAddTodo={handleAddTodo}
                    editingTodo={!!editingTodo}
                    getDefaultMonth={getDefaultMonth}
                    isMonthExpired={isMonthExpired}
                    selectedMonth={selectedMonth}
                  />
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
                    const todosByWeek: Todo[][] = [[], [], [], [], []];
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
                      const weekIndex = Math.min(weekNumber, 4);
                      todosByWeek[weekIndex].push(todo);
                    });

                    // Sort todos within each week by date
                    todosByWeek.forEach((weekTodos) => {
                      weekTodos.sort((a, b) => {
                        const dateA = new Date(a.dueDate || a.createdAt);
                        const dateB = new Date(b.dueDate || b.createdAt);
                        return dateA.getTime() - dateB.getTime();
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
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {todosByWeek.map((weekTodos, weekIndex) => {
                          // Only show week cards that have todos or are not the last empty week
                          if (weekTodos.length === 0 && weekIndex === 4)
                            return null;

                          const expired = isWeekExpired(weekIndex, weekTodos);
                          const totalWorkHours = weekTodos.reduce(
                            (sum, todo) => {
                              return (
                                sum +
                                (todo.completed && todo.workHours
                                  ? todo.workHours
                                  : 0)
                              );
                            },
                            0
                          );

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
                                        {((
                                          completedWorkHoursInWeek,
                                          expired
                                        ) => {
                                          const IDEAL_WEEK_HOURS = 84; // 12 hours/day * 7 days
                                          const percentageWorkDone =
                                            IDEAL_WEEK_HOURS > 0
                                              ? (completedWorkHoursInWeek /
                                                  IDEAL_WEEK_HOURS) *
                                                100
                                              : 0;

                                          if (completedWorkHoursInWeek > 0) {
                                            return (
                                              <span className="ml-2 text-xs font-semibold text-blue-500">
                                                {"(" +
                                                  completedWorkHoursInWeek +
                                                  " hrs & " +
                                                  percentageWorkDone.toFixed(
                                                    1
                                                  ) +
                                                  "%)".replace(/'/g, "&apos;")}
                                              </span>
                                            );
                                          } else if (expired) {
                                            return "";
                                          }
                                          return null;
                                        })(totalWorkHours, expired)}
                                      </p>
                                    </div>

                                    {/* Scrollable todos list with grow behavior */}
                                    <div className="flex-1 overflow-auto p-2 space-y-2">
                                      {weekTodos.length > 0 ? (
                                        (() => {
                                          const todosByDay: {
                                            [key: string]: Todo[];
                                          } = {};
                                          weekTodos.forEach((todo) => {
                                            const dateKey = format(
                                              new Date(
                                                todo.dueDate || todo.createdAt
                                              ),
                                              "yyyy-MM-dd"
                                            );
                                            if (!todosByDay[dateKey]) {
                                              todosByDay[dateKey] = [];
                                            }
                                            todosByDay[dateKey].push(todo);
                                          });

                                          const sortedDailyKeys = Object.keys(
                                            todosByDay
                                          ).sort(
                                            (a, b) =>
                                              new Date(a).getTime() -
                                              new Date(b).getTime()
                                          );

                                          return sortedDailyKeys.map(
                                            (dateKey) => {
                                              const dailyTodos =
                                                todosByDay[dateKey];

                                              return (
                                                <React.Fragment key={dateKey}>
                                                  {dailyTodos.map((todo) => (
                                                    <div
                                                      key={todo.id}
                                                      className={`flex flex-col gap-2 rounded-lg border ${
                                                        getDayInitial(
                                                          new Date(
                                                            todo.dueDate ||
                                                              todo.createdAt
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
                                                          className={`flex flex-col items-center justify-center text-white text-xs font-bold rounded-l-md w-12 ${getDayColor(getDayInitial(new Date(todo.dueDate || todo.createdAt)))}`}
                                                        >
                                                          <span className="text-base">
                                                            {format(
                                                              new Date(
                                                                todo.dueDate ||
                                                                  todo.createdAt
                                                              ),
                                                              "d"
                                                            )}
                                                          </span>
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
                                                                checked={
                                                                  todo.completed
                                                                }
                                                                onCheckedChange={(
                                                                  checked
                                                                ) => {
                                                                  if (checked) {
                                                                    setSelectedTodoForWorkHours(
                                                                      todo
                                                                    );
                                                                    setShowWorkHoursDialog(
                                                                      true
                                                                    );
                                                                  } else {
                                                                    toggleTodo(
                                                                      todo.id
                                                                    );
                                                                  }
                                                                }}
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
                                                                {todo.title
                                                                  .length > 20
                                                                  ? `${todo.title.slice(0, 20)}...`
                                                                  : todo.title}
                                                              </span>
                                                              {todo.description && (
                                                                <span className="text-sm text-muted-foreground">
                                                                  {
                                                                    todo.description
                                                                  }
                                                                </span>
                                                              )}
                                                              <span className="text-xs text-muted-foreground">
                                                                Due :{" "}
                                                                {formatDateTime(
                                                                  todo.dueDate ||
                                                                    todo.createdAt
                                                                )}
                                                                {todo.completed &&
                                                                  typeof todo.workHours ===
                                                                    "number" && (
                                                                    <span className="text-blue-500 font-semibold">
                                                                      {" "}
                                                                      [
                                                                      {todo.workHours.toFixed(
                                                                        1
                                                                      )}{" "}
                                                                      hrs]
                                                                    </span>
                                                                  )}
                                                                {todo.completed &&
                                                                  (typeof todo.workHours ===
                                                                    "undefined" ||
                                                                    todo.workHours ===
                                                                      0) && (
                                                                    <span className="text-muted-foreground">
                                                                      {" "}
                                                                      [0% Work]
                                                                    </span>
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
                                                                setTodoToDelete(
                                                                  todo
                                                                );
                                                              }}
                                                            >
                                                              <IoTrash className="h-4 w-4" />
                                                            </Button>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  ))}
                                                </React.Fragment>
                                              );
                                            }
                                          );
                                        })()
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
                                        defaultMonth={getDefaultMonth()}
                                      />
                                    </PopoverContent>
                                  </Popover>
                                  <Button
                                    onClick={() => {
                                      if (editNoteText.trim() && editNoteDate) {
                                        handleEditNote(note);
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

        <TodoDetailDialog
          selectedTodo={selectedTodo}
          setSelectedTodo={setSelectedTodo}
          handleEditTodo={handleEditTodo}
          setTodoToDelete={setTodoToDelete}
          editingSubTodo={editingSubTodo}
          setEditingSubTodo={setEditingSubTodo}
          editSubTodoText={editSubTodoText}
          setEditSubTodoText={setEditSubTodoText}
          updateSubTodo={updateSubTodo}
          deleteSubTodo={deleteSubTodo}
          deleteTodo={deleteTodo}
          formatDateTime={formatDateTime}
        />

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

        <WorkHoursDialog
          open={showWorkHoursDialog}
          onClose={() => {
            setShowWorkHoursDialog(false);
            setSelectedTodoForWorkHours(null);
          }}
          onSave={handleWorkHoursSave}
          todo={selectedTodoForWorkHours}
        />
      </main>
    </>
  );
};

export default Todos;
