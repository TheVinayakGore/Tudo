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

// Simplified CustomTooltip props to avoid complex Recharts internal types
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string; // The name displayed in the tooltip (e.g., "Completed (14d)")
    value: number; // The value (percentage) displayed in the tooltip
    // Recharts also passes a 'payload' property that contains the original data item
    // We'll use a flexible type here to avoid deep typing issues with Recharts' internals
    payload?: {
      // Specific structure for the original data item
      name?: string;
      value?: number;
      type?: string;
    };
  }>;
}

// Define interface for CustomLegend's payload entries
interface CustomLegendPayloadEntry {
  value: string; // This corresponds to the `name` from our data (e.g., "Completed (<b>14</b> DAYS)")
  color: string;
  payload?: {
    // The original data item from our chart data
    value: number; // The percentage value
    name: string; // The full name (e.g., "Completed (<b>14</b> DAYS)")
    type: string; // The type (e.g., "Completed %")
  };
}

// Define interface for CustomLegend props
interface CustomLegendProps {
  payload?: CustomLegendPayloadEntry[];
}

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
        name: `Completed (<b` + `>${currentDayOfMonth}</b> DAYS)`,
        value: actualCompletionPercentage,
        type: "Completed %",
      });
    } else {
      newMonthlyChartData.push({
        name: `Completed (<b` + `>${currentDayOfMonth}</b> DAYS)`,
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
        name: `Missed (<b` + `>${currentDayOfMonth}</b> DAYS)`,
        value: pastMissedPercentage,
        type: "Missed (Past) %",
      });
    } else {
      newMonthlyChartData.push({
        name: `Missed (<b` + `>${currentDayOfMonth}</b> DAYS)`,
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
        name:
          `Remaining (<b` +
          `>${daysInCurrentMonth - currentDayOfMonth}</b> DAYS)`,
        value: futureRemainingPercentage,
        type: "Remaining (Future) %",
      });
    } else {
      newMonthlyChartData.push({
        name:
          `Remaining (<b` +
          `>${daysInCurrentMonth - currentDayOfMonth}</b> DAYS)`,
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
        name: `Completed (<b` + `>${daysPassedInYear}</b> DAYS)`,
        value: actualCompletionPercentage,
        type: "Completed %",
      });
    } else {
      newAnnualChartData.push({
        name: `Completed (<b` + `>${daysPassedInYear}</b> DAYS)`,
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
        name: `Missed (<b` + `>${daysPassedInYear}</b> DAYS)`,
        value: pastMissedPercentage,
        type: "Missed (Past) %",
      });
    } else {
      newAnnualChartData.push({
        name: `Missed (<b` + `>${daysPassedInYear}</b> DAYS)`,
        value: 0,
        type: "Missed (Past) %",
      });
    }

    // Future Remaining %
    const totalAnnualBaseline = daysInCurrentYear * BASELINE_HOURS;
    if (totalAnnualBaseline > 0) {
      const futureRemainingPercentage =
        (annualSummary.futureBaseline / totalAnnualBaseline) * 100;
      newAnnualChartData.push({
        name:
          `Remaining (<b` +
          `>${daysInCurrentYear - daysPassedInYear}</b> DAYS)`,
        value: futureRemainingPercentage,
        type: "Remaining (Future) %",
      });
    } else {
      newAnnualChartData.push({
        name:
          `Remaining (<b` +
          `>${daysInCurrentYear - daysPassedInYear}</b> DAYS)`,
        value: 0,
        type: "Remaining (Future) %",
      });
    }

    setAnnualData(newAnnualChartData.filter((data) => data.value > 0));
  }, [todos]);

  // Helper to determine color based on type
  const getSliceColor = (type: string) => {
    if (type === "Completed %") return COLORS.completed;
    if (type === "Missed (Past) %") return COLORS.pastMissed;
    if (type === "Remaining (Future) %") return COLORS.futureRemaining;
    return "#cccccc"; // Default color
  };

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      // Access the original name (e.g., "Completed (14d)") from payload[0].payload.name
      const name = payload[0].payload?.name || payload[0].name;
      const value = payload[0].value;
      return (
        <div className="bg-white dark:bg-zinc-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
          <p className="text-sm font-medium">{name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {value.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom Legend Component
  const CustomLegend = (props: CustomLegendProps) => {
    const { payload } = props;

    if (!payload || payload.length === 0) {
      return null;
    }

    return (
      <ul
        className="recharts-default-legend"
        style={{ padding: 0, margin: 0, listStyle: "none" }}
      >
        {payload.map((entry: CustomLegendPayloadEntry, index: number) => (
          <li
            key={`legend-${index}`}
            className="recharts-legend-item legend-item-0"
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "5px",
            }}
          >
            <svg
              className="recharts-surface"
              width="14"
              height="14"
              viewBox="0 0 32 32"
              style={{
                display: "inline-block",
                verticalAlign: "middle",
                marginRight: "5px",
              }}
            >
              <path
                stroke="none"
                fill={entry.color}
                d="M0,4h32v24H0z"
                className="recharts-legend-icon"
              ></path>
            </svg>
            <span
              className="recharts-legend-item-text"
              style={{ color: entry.color }}
              dangerouslySetInnerHTML={{
                __html: `${entry.value} - ${Number(entry.payload?.value).toFixed(1) ?? "0"}%`,
              }}
            ></span>
          </li>
        ))}
      </ul>
    );
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
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ value }) => `${Number(value).toFixed(1)}%`}
                >
                  {monthlyData.map((entry, index) => (
                    <Cell
                      key={`cell-monthly-${index}`}
                      fill={getSliceColor(entry.type)}
                    />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
                {/* Legend formatter: display name (which includes days) and percentage */}
                <Legend
                  layout="vertical"
                  align="center"
                  verticalAlign="bottom"
                  content={<CustomLegend />}
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
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ value }) => `${Number(value).toFixed(1)}%`}
                >
                  {annualData.map((entry, index) => (
                    <Cell
                      key={`cell-annual-${index}`}
                      fill={getSliceColor(entry.type)}
                    />
                  ))}
                </Pie>
                <RechartsTooltip content={<CustomTooltip />} />
                {/* Legend formatter: display name (which includes days) and percentage */}
                <Legend
                  layout="vertical"
                  align="center"
                  verticalAlign="bottom"
                  content={<CustomLegend />}
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
