"use client";
import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import type { Todo } from "@/store/todo-store";

interface WorkHoursPieChartProps {
  todos: Todo[];
}

const COLORS = {
  completed: "#22c55e", // green-500
  pastMissed: "#ef4444", // red-500 for missed in past
  futureRemaining: "#f59e0b", // amber-500 for future remaining
};

const BASELINE_HOURS = 12; // 12 hours per day baseline

const WorkHoursPieChart: React.FC<WorkHoursPieChartProps> = ({ todos }) => {
  const [monthlyData, setMonthlyData] = useState<
    { name: string; value: number; type: string }[]
  >([]);
  const [annualData, setAnnualData] = useState<
    { name: string; value: number; type: string }[]
  >([]);

  useEffect(() => {
    const completedTodos = todos.filter(
      (todo) => todo.completed && typeof todo.workHours === "number"
    );

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonthIndex = currentDate.getMonth();
    const currentDayOfMonth = currentDate.getDate();

    // --- Monthly Data Calculation (Current Month Only) ---
    const monthlySummary: {
      completed: number;
      pastBaseline: number;
      futureBaseline: number;
    } = {
      completed: 0,
      pastBaseline: 0,
      futureBaseline: 0,
    };

    const daysInCurrentMonth = new Date(
      currentYear,
      currentMonthIndex + 1,
      0
    ).getDate();

    // Calculate past baseline for the current month
    monthlySummary.pastBaseline = currentDayOfMonth * BASELINE_HOURS;

    // Calculate future baseline for the current month
    monthlySummary.futureBaseline =
      (daysInCurrentMonth - currentDayOfMonth) * BASELINE_HOURS;

    completedTodos.forEach((todo) => {
      const todoDate = new Date(todo.completedAt || todo.createdAt);
      if (
        todoDate.getFullYear() === currentYear &&
        todoDate.getMonth() === currentMonthIndex
      ) {
        monthlySummary.completed += todo.workHours || 0;
      }
    });

    const newMonthlyChartData: { name: string; value: number; type: string }[] =
      [];

    // Completed %
    if (monthlySummary.pastBaseline > 0) {
      const actualCompletionPercentage =
        (monthlySummary.completed / monthlySummary.pastBaseline) * 100;
      newMonthlyChartData.push({
        name: "Completed",
        value: actualCompletionPercentage,
        type: "Completed %",
      });
    } else {
      newMonthlyChartData.push({
        name: "Completed",
        value: 0,
        type: "Completed %",
      });
    }

    // Past Missed %
    if (monthlySummary.pastBaseline > 0) {
      const pastMissedPercentage = Math.max(
        0,
        ((monthlySummary.pastBaseline - monthlySummary.completed) /
          monthlySummary.pastBaseline) *
          100
      );
      newMonthlyChartData.push({
        name: "Missed (Past)",
        value: pastMissedPercentage,
        type: "Missed (Past) %",
      });
    } else {
      newMonthlyChartData.push({
        name: "Missed (Past)",
        value: 0,
        type: "Missed (Past) %",
      });
    }

    // Future Remaining %
    const totalMonthBaseline = daysInCurrentMonth * BASELINE_HOURS;
    if (totalMonthBaseline > 0) {
      const futureRemainingPercentage =
        (monthlySummary.futureBaseline / totalMonthBaseline) * 100;
      newMonthlyChartData.push({
        name: "Remaining (Future)",
        value: futureRemainingPercentage,
        type: "Remaining (Future) %",
      });
    } else {
      newMonthlyChartData.push({
        name: "Remaining (Future)",
        value: 0,
        type: "Remaining (Future) %",
      });
    }

    setMonthlyData(newMonthlyChartData.filter((data) => data.value > 0)); // Only show slices with positive values

    // --- Annual Data Calculation ---
    const annualSummary: {
      completed: number;
      pastBaseline: number;
      futureBaseline: number;
    } = {
      completed: 0,
      pastBaseline: 0,
      futureBaseline: 0,
    };

    const daysInCurrentYear = ((year: number) => {
      return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
        ? 366
        : 365;
    })(currentYear);

    // Calculate days passed in current year
    const startOfYear = new Date(currentYear, 0, 1);
    const timeDiff = currentDate.getTime() - startOfYear.getTime();
    const daysPassedInYear = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1; // +1 to include current day

    annualSummary.pastBaseline = daysPassedInYear * BASELINE_HOURS;
    annualSummary.futureBaseline =
      (daysInCurrentYear - daysPassedInYear) * BASELINE_HOURS;

    completedTodos.forEach((todo) => {
      const todoDate = new Date(todo.completedAt || todo.createdAt);
      if (todoDate.getFullYear() === currentYear) {
        annualSummary.completed += todo.workHours || 0;
      }
    });

    const newAnnualChartData: { name: string; value: number; type: string }[] =
      [];

    // Completed %
    if (annualSummary.pastBaseline > 0) {
      const actualCompletionPercentage =
        (annualSummary.completed / annualSummary.pastBaseline) * 100;
      newAnnualChartData.push({
        name: "Completed",
        value: actualCompletionPercentage,
        type: "Completed %",
      });
    } else {
      newAnnualChartData.push({
        name: "Completed",
        value: 0,
        type: "Completed %",
      });
    }

    // Past Missed %
    if (annualSummary.pastBaseline > 0) {
      const pastMissedPercentage = Math.max(
        0,
        ((annualSummary.pastBaseline - annualSummary.completed) /
          annualSummary.pastBaseline) *
          100
      );
      newAnnualChartData.push({
        name: "Missed (Past)",
        value: pastMissedPercentage,
        type: "Missed (Past) %",
      });
    } else {
      newAnnualChartData.push({
        name: "Missed (Past)",
        value: 0,
        type: "Missed (Past) %",
      });
    }

    // Future Remaining %
    const totalYearBaseline = daysInCurrentYear * BASELINE_HOURS;
    if (totalYearBaseline > 0) {
      const futureRemainingPercentage =
        (annualSummary.futureBaseline / totalYearBaseline) * 100;
      newAnnualChartData.push({
        name: "Remaining (Future)",
        value: futureRemainingPercentage,
        type: "Remaining (Future) %",
      });
    } else {
      newAnnualChartData.push({
        name: "Remaining (Future)",
        value: 0,
        type: "Remaining (Future) %",
      });
    }

    setAnnualData(newAnnualChartData.filter((data) => data.value > 0)); // Only show slices with positive values
  }, [todos]);

  // Helper to determine color based on type
  const getSliceColor = (type: string) => {
    if (type === "Completed %") return COLORS.completed;
    if (type === "Missed (Past) %") return COLORS.pastMissed;
    if (type === "Remaining (Future) %") return COLORS.futureRemaining;
    return "#cccccc"; // Default color
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10 w-full">
      <div className="w-full rounded-xl border bg-card text-card-foreground shadow">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="font-semibold leading-none tracking-tight text-xl">
            Monthly Work Hours Percentage (Current Month)
          </h3>
        </div>
        <div className="p-6 pt-0 w-full">
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={monthlyData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                >
                  {monthlyData.map((entry, index) => (
                    <Cell
                      key={`cell-monthly-${index}`}
                      fill={getSliceColor(entry.type)}
                    />
                  ))}
                </Pie>
                <Legend />
                <RechartsTooltip
                  formatter={(value, name, props) => [
                    `${Number(value).toFixed(1)}%`,
                    `${props.payload.name}`,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground">
              No work hours data for the current month.
            </p>
          )}
        </div>
      </div>

      <div className="w-full rounded-xl border bg-card text-card-foreground shadow">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="font-semibold leading-none tracking-tight text-xl">
            Annual Work Hours Percentage (Current Year)
          </h3>
        </div>
        <div className="p-6 pt-0 w-full">
          {annualData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={annualData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                >
                  {annualData.map((entry, index) => (
                    <Cell
                      key={`cell-annual-${index}`}
                      fill={getSliceColor(entry.type)}
                    />
                  ))}
                </Pie>
                <Legend />
                <RechartsTooltip
                  formatter={(value, name, props) => [
                    `${Number(value).toFixed(1)}%`,
                    `${props.payload.name}`,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground">
              No work hours data for the current year.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkHoursPieChart;
