export const todoSchema = {
  name: "todo",
  title: "Todo",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "description",
      title: "Description",
      type: "text",
    },
    {
      name: "completed",
      title: "Completed",
      type: "boolean",
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
    {
      name: "dueDate",
      title: "Due Date",
      type: "datetime",
      options: {
        dateFormat: "YYYY-MM-DD",
        timeFormat: "HH:mm",
        calendarTodayLabel: "Today",
      },
    },
    {
      name: "workHours",
      title: "Work Hours",
      type: "number",
    },
    {
      name: "workCompletionPercentage",
      title: "Work Completion Percentage",
      type: "number",
    },
    {
      name: "subTodos",
      title: "Sub Todos",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "id",
              title: "ID",
              type: "string",
            },
            {
              name: "title",
              title: "Title",
              type: "string",
            },
            {
              name: "completed",
              title: "Completed",
              type: "boolean",
            },
            {
              name: "createdAt",
              title: "Created At",
              type: "datetime",
            },
          ],
        },
      ],
    },
  ],
};
