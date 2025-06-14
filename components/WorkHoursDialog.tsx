"use client";
import React, { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import type { Todo } from "@/store/todo-store";
import { Progress } from "@/components/ui/progress";

interface WorkHoursDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (todoId: string, hours: number) => void;
  todo: Todo | null;
}

const BASELINE_HOURS = 12;

const WorkHoursDialog: React.FC<WorkHoursDialogProps> = ({
  open,
  onClose,
  onSave,
  todo,
}) => {
  const [hours, setHours] = useState<string>("");
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);

  useEffect(() => {
    if (hours.trim() && !isNaN(Number(hours))) {
      const percentage = Math.min((Number(hours) / BASELINE_HOURS) * 100, 100);
      setCompletionPercentage(percentage);
    } else {
      setCompletionPercentage(0);
    }
  }, [hours]);

  const handleSave = () => {
    if (todo && hours.trim() && !isNaN(Number(hours))) {
      onSave(todo.id, Number(hours));
      setHours("");
      onClose();
    }
  };

  const handleCancel = () => {
    setHours("");
    onClose();
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Enter Work Hours</AlertDialogTitle>
          <AlertDialogDescription>
            How many hours did you spend on this todo? (Baseline:{" "}
            {BASELINE_HOURS} hours/day)
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            id="work-hours"
            type="number"
            placeholder="e.g., 2.5"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="col-span-3"
            min="0"
            step="0.1"
          />
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Work Completion</span>
              <span>{completionPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {completionPercentage >= 100
                ? "Great job! You've exceeded the daily baseline."
                : completionPercentage > 0
                  ? `${BASELINE_HOURS - Number(hours)} hours remaining to reach baseline`
                  : "Enter hours to see completion percentage"}
            </p>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSave}>Save</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default WorkHoursDialog;
