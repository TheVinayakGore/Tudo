"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { VscEyeClosed } from "react-icons/vsc";

interface NoteEntryFormProps {
  newNoteText: string;
  setNewNoteText: (text: string) => void;
  newNoteDate: Date | undefined;
  setNewNoteDate: (date: Date | undefined) => void;
  handleAddNote: () => void;
  handleNoteFormClose: () => void;
  getDefaultMonth: () => Date;
  showNoteForm: boolean;
}

const NoteEntryForm: React.FC<NoteEntryFormProps> = ({
  newNoteText,
  setNewNoteText,
  newNoteDate,
  setNewNoteDate,
  handleAddNote,
  handleNoteFormClose,
  getDefaultMonth,
  showNoteForm,
}) => {
  return (
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
          onClick={handleAddNote}
          className="absolute bottom-0 right-0 m-2 text-xs w-auto"
        >
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
              {newNoteDate ? format(newNoteDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="border border-primary/30 overflow-hidden rounded-md w-auto mt-2 z-50">
            <Calendar
              mode="single"
              selected={newNoteDate}
              onSelect={(date: Date | undefined) => setNewNoteDate(date)}
              initialFocus
              defaultMonth={getDefaultMonth()}
            />
          </PopoverContent>
        </Popover>

        {showNoteForm && (
          <Button onClick={handleNoteFormClose}>
            Hide Form
            <VscEyeClosed className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default NoteEntryForm;
