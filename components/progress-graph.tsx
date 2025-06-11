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
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { IoFilter } from "react-icons/io5";
import Link from "next/link";

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
  const { todos } = useTodoStore();

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

  return (
    <>
      <main className="flex flex-col items-center gap-10 bg-orange-50/50 dark:bg-orange-900/10 p-5 md:p-10 rounded-lg border border-orange-300 dark:border-orange-950">
        <section className="w-full">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-5 mb-5 lg:mb-14 w-full">
            <h2 className="text-2xl md:text-4xl font-bold">Your Progress</h2>

            <Button
              size="lg"
              className="p-3 lg:p-5 text-sm lg:text-base font-medium"
              asChild
            >
              <Link href="/todos">
                <IoFilter className="mr-2" /> Manage Todos
              </Link>
            </Button>
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
