"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, Plus, ChevronDown, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useTodoStore } from "@/store/todo-store";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

type Note = {
  id: string;
  text: string;
  createdAt: string;
};

export default function Header() {
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();
  const [, setNotes] = useState<Note[]>([]);
  const [todoText, setTodoText] = useState("");
  const [todoDescription, setTodoDescription] = useState("");
  const [todoDate, setTodoDate] = useState<Date | undefined>(new Date());
  const [todoTime, setTodoTime] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickNoteText, setQuickNoteText] = useState("");
  const [quickNoteDate, setQuickNoteDate] = useState<Date | undefined>(
    undefined
  );
  const [formMode, setFormMode] = useState<"todo" | "note">("todo");
  const addTodo = useTodoStore((state) => state.addTodo);

  const handleAddTodo = () => {
    if (todoText.trim()) {
      addTodo({
        title: todoText,
        description: todoDescription,
        completed: false,
        createdAt: new Date(),
        dueDate: todoDate,
        dueTime: todoTime,
      });
      setTodoText("");
      setTodoDescription("");
      setTodoDate(new Date());
      setTodoTime("");
      setIsDropdownOpen(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/#todos", label: "Todos" },
    { href: "/#features", label: "Features" },
    { href: "/about", label: "About" },
    { href: "/help", label: "Help" },
  ];

  return (
    <header className="fixed top-0 shadow w-full z-[100]">
      <div className="flex h-16 px-5 lg:px-20 items-center justify-between bg-white/20 dark:bg-zinc-800/20 backdrop-blur-xl w-full">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-extrabold"
        >
          <Image
            src="/logo.png"
            alt="logo"
            width={50}
            height={50}
            className="w-9"
          />
          <span>TUDO</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-10">
          <div className="space-x-5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`hover:text-orange-500 transition-all duration-300 ${
                  pathname === link.href
                    ? "font-bold text-orange-500 underline underline-offset-8 decoration-2"
                    : "font-medium"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-10 space-y-3">
            <SheetTitle className="flex flex-col items-start gap-3 w-full">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-medium p-2 px-5 transition-colors border rounded-md w-full ${
                    pathname === link.href
                      ? "bg-orange-100 border-orange-300 dark:border-orange-800 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={toggleTheme}
                className="text-sm text-start font-medium p-2 px-5 transition-colors shadow-lg rounded-md bg-orange-500 text-white w-full"
              >
                Theme
              </button>
            </SheetTitle>
          </SheetContent>
        </Sheet>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-2">
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1 w-60 md:w-96">
                <Plus className="h-4 w-4" />
                Add {formMode === "todo" ? "Todo" : "Note"}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-60 md:w-96 p-4 space-y-4"
              align="end"
            >
              {/* Toggle Switch */}
              <div className="flex justify-center gap-2 mb-4">
                <button
                  onClick={() => setFormMode("todo")}
                  className={`px-4 py-1 rounded-md font-medium transition cursor-pointer w-full ${
                    formMode === "todo"
                      ? "bg-orange-500 text-white"
                      : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  Todo
                </button>
                <button
                  onClick={() => setFormMode("note")}
                  className={`px-4 py-1 rounded-md font-medium transition cursor-pointer w-full ${
                    formMode === "note"
                      ? "bg-orange-500 text-white"
                      : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  Note
                </button>
              </div>

              {/* Todo Form */}
              {formMode === "todo" && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Add New Todo</h4>
                  <Input
                    type="text"
                    value={todoText}
                    onChange={(e) => setTodoText(e.target.value)}
                    placeholder="What needs to be done?"
                  />
                  <Input
                    type="text"
                    value={todoDescription}
                    onChange={(e) => setTodoDescription(e.target.value)}
                    placeholder="Description (optional)"
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {todoDate ? (
                          format(todoDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={todoDate}
                        onSelect={setTodoDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    value={todoTime}
                    onChange={(e) => setTodoTime(e.target.value)}
                    className="w-full"
                  />
                  <Button onClick={handleAddTodo} className="w-full">
                    Add Todo
                  </Button>
                </div>
              )}

              {/* Note Form */}
              {formMode === "note" && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Quick Note</h4>
                  <Input
                    type="text"
                    value={quickNoteText}
                    onChange={(e) => setQuickNoteText(e.target.value)}
                    placeholder="Write a note..."
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {quickNoteDate
                          ? format(quickNoteDate, "PPP")
                          : "Pick a note date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={quickNoteDate}
                        onSelect={setQuickNoteDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Button
                    onClick={() => {
                      if (!quickNoteText.trim()) return;
                      const newNote: Note = {
                        id: crypto.randomUUID(),
                        text: quickNoteText,
                        createdAt: (quickNoteDate ?? new Date()).toISOString(),
                      };
                      setNotes((prev) => [...prev, newNote]);
                      setQuickNoteText("");
                      setQuickNoteDate(undefined);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full"
                  >
                    Add Note
                  </Button>
                </div>
              )}

              {/* Cancel Button */}
              <Button
                variant="outline"
                onClick={() => setIsDropdownOpen(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="icon" onClick={toggleTheme}>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
