"use client";
import React, { useEffect, useState } from "react";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  TooltipItem,
} from "chart.js";
import { Context } from "chartjs-plugin-datalabels";
import { useTodoStore } from "@/store/todo-store";
import type { Todo } from "@/store/todo-store";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { IoFilter, IoAdd } from "react-icons/io5";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Checkbox } from "./ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function ProgressGraph() {
  const { theme } = useTheme();
  const [completionData, setCompletionData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const { todos, toggleTodo, updateTodo, addTodo } = useTodoStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
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

  // 📈 Line Graph: Weekly Completion %
  useEffect(() => {
    const days = 7;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dateLabels = Array.from({ length: days }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (days - 1 - i));
      return date.toLocaleDateString("en-US", { weekday: "short" });
    });

    const datePoints = dateLabels.map((_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (days - 1 - i));
      return date;
    });

    const completionRates = datePoints.map((date) => {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const todosOnDay = todos.filter(
        (todo) => new Date(todo.createdAt) <= endOfDay
      );

      if (todosOnDay.length === 0) return 0;

      const completedOnDay = todosOnDay.filter(
        (todo) =>
          todo.completed &&
          todo.completedAt &&
          new Date(todo.completedAt) <= endOfDay
      );

      return Math.round((completedOnDay.length / todosOnDay.length) * 100);
    });

    setLabels(dateLabels);
    setCompletionData(completionRates);
  }, [todos]);

  // 📊 Pie Chart Data
  const currentYear = new Date().getFullYear();
  const yearlyTodos = todos.filter(
    (todo) => new Date(todo.createdAt).getFullYear() === currentYear
  );
  const completedThisYear = yearlyTodos.filter((todo) => todo.completed);
  const pendingTodos = todos.filter((todo) => !todo.completed);

  const completedPieData = {
    labels: ["Completed", "Incomplete"],
    datasets: [
      {
        label: "Yearly Todos",
        data: [
          completedThisYear.length,
          yearlyTodos.length - completedThisYear.length,
        ],
        backgroundColor: ["#22c55e", "#f97316"],
        borderWidth: 1,
      },
    ],
  };

  const pendingPieData = {
    labels: ["Pending", "Completed"],
    datasets: [
      {
        label: "Current Todos",
        data: [pendingTodos.length, todos.length - pendingTodos.length],
        backgroundColor: ["#f43f5e", "#3b82f6"],
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      datalabels: {
        color: "#fff",
        font: {
          weight: "bold" as const,
        },
        formatter: (value: number, context: Context) => {
          const dataset = context.chart.data.datasets[0].data as number[];
          const total = dataset.reduce(
            (sum: number, val: number) => sum + (val || 0),
            0
          );
          const percentage = ((value / total) * 100).toFixed(0);
          return `${percentage}%`;
        },
      },
    },
  };

  const lineChartData = {
    labels,
    datasets: [
      {
        label: "Completion %",
        data: completionData,
        borderColor: "rgb(249, 115, 22)",
        backgroundColor: "rgba(249, 115, 22, 0.3)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const isDark = theme === "dark";

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<"line">) =>
            `${context.dataset.label}: ${context.raw}%`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: isDark ? "#262626" : "#e5e7eb", // slate-700 vs gray-200
        },
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
          callback: (value: number | string) => `${value}%`,
        },
        grid: {
          color: isDark ? "#262626" : "#e5e7eb",
        },
      },
    },
  };

  const handleEditStart = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.title || ""); // Ensure we never pass undefined
  };

  const handleEditSave = (id: string) => {
    updateTodo(id, {
      title: editText,
      description: "",
    });
    setEditingId(null);
  };

  const handleEditCancel = () => {
    setEditingId(null);
  };

  return (
    <>
      <main className="flex flex-col items-center gap-10 bg-orange-50/50 dark:bg-orange-900/10 p-5 md:p-10 rounded-lg border border-orange-300 dark:border-orange-950">
        <section className="w-full">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-5 mb-5 lg:mb-14 w-full">
            <h2 className="text-2xl md:text-4xl font-bold">Your Progress</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="p-3 lg:p-5 text-sm lg:text-base font-medium"
                >
                  <IoFilter className="mr-2" /> Manage Todos
                </Button>
              </DialogTrigger>
              <DialogContent className="flex flex-col items-start justify-start m-auto w-full h-[calc(100vh-10rem)] max-h-screen max-w-[95vw] sm:max-w-3xl md:max-w-5xl lg:max-w-7xl lg:h-[45rem]">
                <DialogHeader className="w-full">
                  <DialogTitle className="text-lg sm:text-xl md:text-2xl">
                    {selectedMonth
                      ? `Todos for ${selectedMonth} (${
                          filteredTodos.length
                        }) - Pending: ${
                          filteredTodos.filter((t) => !t.completed).length
                        }`
                      : `All Todos (${todos.length}) - Pending: ${
                          todos.filter((t) => !t.completed).length
                        }`}
                  </DialogTitle>
                  {selectedMonth && (
                    <Button
                      variant="outline"
                      onClick={() => setSelectedMonth(null)}
                      className="text-sm p-0 text-muted-foreground"
                    >
                      ← Back to all months
                    </Button>
                  )}
                </DialogHeader>

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
                        {newNoteDate
                          ? format(newNoteDate, "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newNoteDate}
                        onSelect={setNewNoteDate}
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
                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <Input
                      value={newTodoText}
                      onChange={(e) => setNewTodoText(e.target.value)}
                      placeholder="Add new todo..."
                      className="flex-1"
                      onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <Input
                      value={newTodoDesc}
                      onChange={(e) => setNewTodoDesc(e.target.value)}
                      placeholder="Add description (optional)"
                      className="flex-1"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className="w-full sm:w-[200px] justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newTodoDate ? (
                            format(newTodoDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newTodoDate}
                          onSelect={setNewTodoDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    <Input
                      type="time"
                      value={newTodoTime}
                      onChange={(e) => setNewTodoTime(e.target.value)}
                      className="w-full sm:w-[120px]"
                    />

                    <Button onClick={handleAddTodo} className="gap-1">
                      <IoAdd className="h-4 w-4" /> Add
                    </Button>
                  </div>
                </div>

                {selectedMonth && (
                  <div className="flex gap-3 mt-3">
                    <Button
                      variant={
                        monthViewType === "todos" ? "default" : "outline"
                      }
                      onClick={() => setMonthViewType("todos")}
                    >
                      Show Todos
                    </Button>
                    <Button
                      variant={
                        monthViewType === "notes" ? "default" : "outline"
                      }
                      onClick={() => setMonthViewType("notes")}
                    >
                      Show Notes
                    </Button>
                  </div>
                )}

                <ScrollArea className="rounded-md border border-orange-300 dark:border-orange-950 overflow-auto w-full h-full">
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
                            new Date(
                              todo.dueDate || todo.createdAt
                            ).toLocaleString("default", {
                              month: "long",
                            }) === month
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
                                <p className="text-xs text-muted-foreground mt-1">
                                  {completionPercentage}% completed
                                </p>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3 p-3 sm:p-6">
                      {(() => {
                        switch (monthViewType) {
                          case "todos":
                            return filteredTodos.length > 0 ? (
                              filteredTodos.map((todo) => (
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
                                    onCheckedChange={() => toggleTodo(todo.id)}
                                    className="mt-1 flex-shrink-0"
                                  />
                                  {editingId === todo.id ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                                      <Input
                                        value={editText || ""}
                                        onChange={(e) =>
                                          setEditText(e.target.value)
                                        }
                                        className="text-sm sm:text-base w-full"
                                      />
                                      <Input
                                        value={newTodoDesc}
                                        onChange={(e) =>
                                          setNewTodoDesc(e.target.value)
                                        }
                                        placeholder="Add description (optional)"
                                        className="flex-1 w-full"
                                      />
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <Button
                                            variant={"outline"}
                                            className="w-full justify-start text-left font-normal"
                                          >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {newTodoDate
                                              ? format(newTodoDate, "PPP")
                                              : "Pick a date"}
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                          <Calendar
                                            mode="single"
                                            selected={newTodoDate}
                                            onSelect={setNewTodoDate}
                                            initialFocus
                                          />
                                        </PopoverContent>
                                      </Popover>
                                      <Input
                                        type="time"
                                        value={newTodoTime}
                                        onChange={(e) =>
                                          setNewTodoTime(e.target.value)
                                        }
                                        className="w-full"
                                      />
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                                        <Button
                                          className="text-xs sm:text-sm w-full"
                                          onClick={() =>
                                            handleEditSave(todo.id)
                                          }
                                        >
                                          Save
                                        </Button>
                                        <Button
                                          variant="outline"
                                          className="text-xs sm:text-sm w-full"
                                          onClick={handleEditCancel}
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
                                          variant="ghost"
                                          size="sm"
                                          className="flex-shrink-0 text-xs sm:text-sm"
                                          onClick={() => handleEditStart(todo)}
                                        >
                                          Edit
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : (
                              <p className="text-center text-muted-foreground py-4 text-sm sm:text-base">
                                No todos for {selectedMonth}! Add a todo to get
                                started.
                              </p>
                            );

                          case "notes":
                            const monthNotes = notes.filter(
                              (note) =>
                                new Date(note.createdAt).toLocaleString(
                                  "default",
                                  {
                                    month: "long",
                                  }
                                ) === selectedMonth
                            );

                            return monthNotes.length > 0 ? (
                              monthNotes.map((note) => (
                                <div
                                  key={note.id}
                                  className="border border-orange-300 dark:border-orange-800 rounded-md bg-white/80 dark:bg-zinc-900/40 p-3"
                                >
                                  <p className="text-sm text-zinc-700 dark:text-zinc-300">
                                    {note.text}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(
                                      note.createdAt
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              ))
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
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-10">
            <div className="flex flex-col items-start justify-between gap-5 bg-white dark:bg-black border border-orange-300 dark:border-orange-950 rounded-lg p-6">
              <h3 className="text-xl font-semibold">Todo Stats</h3>
              <div className="flex flex-col md:flex-row items-start justify-between gap-2 text-base md:text-lg leading-none font-medium w-full">
                <div>
                  Total :{" "}
                  <span className="font-bold text-orange-500">
                    {todos.length}
                  </span>
                </div>
                <div>
                  Completed :{" "}
                  <span className="font-bold text-orange-500">
                    {" "}
                    {todos.filter((t) => t.completed).length}
                  </span>
                </div>
                <div>
                  Remaining :{" "}
                  <span className="font-bold text-orange-500">
                    {todos.filter((t) => !t.completed).length}
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-black border border-orange-300 dark:border-orange-950 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Completion Rate</h3>
              <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
                <div
                  className="bg-orange-500 h-4 rounded-full"
                  style={{
                    width: `${
                      todos.length > 0
                        ? (todos.filter((t) => t.completed).length /
                            todos.length) *
                          100
                        : 0
                    }%`,
                  }}
                ></div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {todos.length > 0
                  ? `${Math.round(
                      (todos.filter((t) => t.completed).length / todos.length) *
                        100
                    )}% completed`
                  : "No todos yet"}
              </p>
            </div>
          </div>
        </section>

        <h2 className="text-start mx-auto text-2xl md:text-4xl font-bold w-full">
          Weekly Graph
        </h2>

        <div className="flex flex-col xl:flex-row gap-10 bg-orange-50 dark:bg-orange-900/10 p-10 rounded-xl border border-orange-300 dark:border-orange-950 w-full">
          <section className="w-full xl:w-1/2">
            <p className="text-xs lg:text-sm text-orange-500">Graph</p>
            <Line options={lineOptions} data={lineChartData} />
          </section>

          {/* Pie Charts Section */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-0 py-10 xl:py-0 w-full xl:w-1/2">
            <div className="flex flex-col items-center text-center gap-5 w-full h-60 xl:h-80">
              <h4 className="text-lg font-semibold text-rose-500">
                Pending Todos
              </h4>
              <div className="w-full h-full">
                <Pie data={pendingPieData} options={pieOptions} />
              </div>
            </div>

            <div className="flex flex-col items-center text-center gap-5 w-full h-60 xl:h-80">
              <h4 className="text-lg font-semibold text-green-600">
                Completed Todos
              </h4>
              <div className="w-full h-full">
                <Pie data={completedPieData} options={pieOptions} />
              </div>
            </div>
          </section>
        </div>
      </main>
      <div className="flex w-full">hello</div>
    </>
  );
}
