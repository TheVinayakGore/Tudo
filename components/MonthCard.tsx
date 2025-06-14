"use client";
import React from "react";
import { cn } from "@/lib/utils";

interface MonthCardProps {
  month: string;
  index: number;
  totalCount: number;
  pendingCount: number;
  completedCount: number;
  noteCount: number;
  completionPercentage: number;
  idealCompletionPercentage: number;
  averageDailyWorkHours: number;
  isPastMonth: boolean;
  setSelectedMonth: (month: string | null) => void;
}

const MonthCard: React.FC<MonthCardProps> = ({
  month,
  totalCount,
  pendingCount,
  completedCount,
  noteCount,
  completionPercentage,
  idealCompletionPercentage,
  averageDailyWorkHours,
  isPastMonth,
  setSelectedMonth,
}) => {
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
          {idealCompletionPercentage > 0 && (
            <p className="text-sm text-muted-foreground">
              (Ideal Completion: {idealCompletionPercentage}%)
            </p>
          )}
          {averageDailyWorkHours > 0 && (
            <p className="text-sm text-muted-foreground">
              Average Daily: {averageDailyWorkHours.toFixed(1)} hrs
            </p>
          )}
        </>
      ) : isPastMonth ? (
        <p className="opacity-50 uppercase text-2xl font-normal">
          No work Done !
        </p>
      ) : null}
    </div>
  );
};

export default MonthCard;
