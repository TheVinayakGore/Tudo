"use client";
import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem,
} from "chart.js";
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
  Title,
  Tooltip,
  Legend
);

export default function ProgressGraph() {
  const { theme } = useTheme();
  const [completionData, setCompletionData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const { todos } = useTodoStore();

  // 📈 Line Graph: Yearly Completion %
  useEffect(() => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const currentYear = new Date().getFullYear();

    const completionRates = months.map((_, monthIndex) => {
      const startOfMonth = new Date(currentYear, monthIndex, 1);
      const endOfMonth = new Date(
        currentYear,
        monthIndex + 1,
        0,
        23,
        59,
        59,
        999
      );

      const todosInMonth = todos.filter((todo) => {
        const todoDate = new Date(todo.createdAt);
        return todoDate >= startOfMonth && todoDate <= endOfMonth;
      });

      if (todosInMonth.length === 0) return 0;

      const completedInMonth = todosInMonth.filter(
        (todo) =>
          todo.completed &&
          todo.completedAt &&
          new Date(todo.completedAt) <= endOfMonth
      );

      return Math.round((completedInMonth.length / todosInMonth.length) * 100);
    });

    setLabels(months.map((month) => `${month} ${currentYear}`));
    setCompletionData(completionRates);
  }, [todos]);

  const isDark = theme === "dark";

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
      datalabels: {
        display: true,
        color: isDark ? "#fff" : "#000",
        font: {
          weight: "bold",
        },
        formatter: (value: number) => `${value}%`,
      },
    },
    scales: {
      x: {
        grid: {
          color: isDark ? "#262626" : "#e5e7eb",
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
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
              <Link href="/#todos">
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
          <span className="text-primary">{new Date().getFullYear()}</span> Progress 
        </h2>

        <div className="bg-orange-50 dark:bg-orange-900/10 p-3 sm:p-10 rounded-lg border border-orange-300 dark:border-orange-950 w-full">
          <section className="w-full">
            <p className="text-xs lg:text-sm text-orange-500 mb-4">
              Monthly Completion Rate for {new Date().getFullYear()}
            </p>
            <div className="w-full h-56 sm:h-full">
              <Line options={lineOptions} data={lineChartData} />
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
