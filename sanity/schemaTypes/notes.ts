import { defineField, defineType } from "sanity";

export const notes = defineType({
  title: "Notes",
  name: "notes",
  type: "document",
  fields: [
    defineField({
      title: "Title",
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      title: "Date",
      name: "date",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      title: "Is Deleted",
      name: "isDeleted",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      title: "Created At",
      name: "createdAt",
      type: "datetime",
      readOnly: true,
      hidden: ({ document }) => !!document?.createdAt,
    }),
    defineField({
      title: "Updated At",
      name: "updatedAt",
      type: "datetime",
    }),
    defineField({
      title: "Is Deleted",
      name: "isDeleted",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      title: "Created At",
      name: "createdAt",
      type: "datetime",
      readOnly: true,
      hidden: ({ document }) => !!document?.createdAt,
    }),
    defineField({
      title: "Updated At",
      name: "updatedAt",
      type: "datetime",
    }),
  ],
});
