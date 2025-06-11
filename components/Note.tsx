"use client";
import { client } from "@/sanity/lib/client";
import { format } from "date-fns";
import { PortableTextBlock } from "@portabletext/types";
import { useEffect, useState } from "react";

type Note = {
  _id: string;
  title: string;
  content: PortableTextBlock[];
  date: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

async function getNotes(): Promise<Note[]> {
  const query = `*[_type == "notes" && (!defined(isDeleted) || isDeleted == false)] | order(date desc){
    _id,
    title,
    content,
    date,
    isDeleted,
    createdAt,
    updatedAt
  }`;

  const notes = await client.fetch(query);
  return notes;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const fetchNotes = async () => {
      const data = await getNotes();
      setNotes(data);
    };
    fetchNotes();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">All Notes</h1>
      {notes.map((note) => (
        <div key={note._id} className="bg-white p-4 rounded shadow space-y-2">
          <h2 className="text-xl font-semibold">{note.title}</h2>
          <p className="text-sm text-gray-500">
            {format(new Date(note.date), "dd MMM yyyy, hh:mm a")}
          </p>
          <p className="text-xs text-gray-400">
            Created: {note.createdAt ? format(new Date(note.createdAt), "dd MMM yyyy, hh:mm a") : "N/A"}<br />
            Updated: {note.updatedAt ? format(new Date(note.updatedAt), "dd MMM yyyy, hh:mm a") : "N/A"}
          </p>
        </div>
      ))}
    </div>
  );
}
