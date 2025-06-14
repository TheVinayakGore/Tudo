"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { IoAdd, IoTrash } from "react-icons/io5";
import { format } from "date-fns";

interface TodoEntryFormProps {
  newTodoText: string;
  setNewTodoText: (text: string) => void;
  newTodoDesc: string;
  setNewTodoDesc: (desc: string) => void;
  newTodoDate: Date | undefined;
  setNewTodoDate: (date: Date | undefined) => void;
  showSubTodoForm: boolean;
  setShowSubTodoForm: (show: boolean) => void;
  subTodoInputs: string[];
  setSubTodoInputs: (inputs: string[]) => void;
  handleAddTodo: () => void;
  editingTodo: boolean;
  getDefaultMonth: () => Date;
  isMonthExpired: (month: string) => boolean;
  selectedMonth: string | null;
}

const TodoEntryForm: React.FC<TodoEntryFormProps> = ({
  newTodoText,
  setNewTodoText,
  newTodoDesc,
  setNewTodoDesc,
  newTodoDate,
  setNewTodoDate,
  showSubTodoForm,
  setShowSubTodoForm,
  subTodoInputs,
  setSubTodoInputs,
  handleAddTodo,
  editingTodo,
  getDefaultMonth,
}) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col md:flex-row gap-2 w-full">
        <div className="flex gap-2 w-full md:w-1/3">
          <Input
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            placeholder="Add new todo..."
            className="w-full"
            onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
            required
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
              onSelect={(date: Date | undefined) => setNewTodoDate(date)}
              initialFocus
              defaultMonth={getDefaultMonth()}
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
            />
          </PopoverContent>
        </Popover>

        <Button onClick={handleAddTodo} className="flex-1 gap-1">
          <IoAdd className="h-4 w-4" /> {editingTodo ? "Update" : "Add"}
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
                  if (e.key === "Enter" && input.trim()) {
                    handleAddTodo(); // Trigger main todo add/update which includes sub-todos
                  }
                }}
              />
              {index === subTodoInputs.length - 1 ? (
                <Button
                  size="icon"
                  className="flex-shrink-0 text-xs sm:text-sm"
                  onClick={() => setSubTodoInputs([...subTodoInputs, ""])}
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
  );
};

export default TodoEntryForm;
