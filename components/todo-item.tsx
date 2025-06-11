"use client";
import { Check, Trash2, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface TodoItemProps {
  todo: {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
  };
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (
    id: string,
    updates: { title: string; description?: string }
  ) => void;
}

export default function TodoItem({
  todo,
  onToggle,
  onDelete,
  onUpdate,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(
    todo.description || ""
  );

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate(todo.id, { title: editTitle, description: editDescription });
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg">
      <Button
        variant={todo.completed ? "default" : "outline"}
        size="icon"
        onClick={() => onToggle(todo.id)}
        disabled={isEditing}
      >
        <Check className="h-4 w-4" />
      </Button>

      {isEditing ? (
        <div className="flex-1 space-y-2">
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") setIsEditing(false);
            }}
            autoFocus
            className="w-full"
          />
          <Input
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Add description (optional)"
            className="w-full"
          />
        </div>
      ) : (
        <div className="flex-1">
          <p
            className={cn(
              todo.completed ? "line-through text-muted-foreground" : ""
            )}
          >
            {todo.title}
          </p>
          {todo.description && (
            <p className="text-sm text-muted-foreground">{todo.description}</p>
          )}
        </div>
      )}

      <div className="flex gap-2">
        {isEditing ? (
          <>
            <Button variant="ghost" size="icon" onClick={handleSave}>
              <Save className="h-4 w-4 text-green-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(false)}
            >
              <X className="h-4 w-4 text-gray-500" />
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              disabled={todo.completed}
            >
              <Edit className="h-4 w-4 text-blue-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(todo.id)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
