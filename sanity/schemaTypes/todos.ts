import { defineField, defineType } from "sanity";

export const todos = defineType({
  title: "Todos",
  name: "todos",
  type: "document",
  fields: [
    defineField({
      title: "Title",
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      title: "Description",
      name: "desc",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Heading 1", value: "h1" },
            { title: "Heading 2", value: "h2" },
            { title: "Heading 3", value: "h3" },
            { title: "Heading 4", value: "h4" },
            { title: "Heading 5", value: "h5" },
            { title: "Divider", value: "hr" },
            { title: "Quote", value: "blockquote" },
          ],
          lists: [
            { title: "Bullet", value: "bullet" },
            { title: "Numbered", value: "number" },
            { title: "Square", value: "square" },
            { title: "Circle", value: "circle" },
            { title: "Alphabet", value: "alpha" },
            { title: "Roman", value: "roman" },
          ],
        },
        {
          type: "image",
          options: {
            hotspot: true,
          },
          fields: [
            {
              title: "Attribution",
              name: "attribution",
              type: "string",
            },
          ],
        },
        {
          title: "Code Block",
          type: "code",
          options: {
            language: "javascript",
            theme: "atomOneDark",
          },
        },
      ],
    }),
    defineField({
      title: "Date",
      name: "date",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
  ],
});
