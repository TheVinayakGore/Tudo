export const noteSchema = {
  name: "note",
  title: "Note",
  type: "document",
  fields: [
    {
      name: "text",
      title: "Text",
      type: "text",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      options: {
        dateFormat: "YYYY-MM-DD",
        timeFormat: "HH:mm",
        calendarTodayLabel: "Today",
      },
    },
  ],
};
