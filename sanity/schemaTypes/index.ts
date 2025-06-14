import { type SchemaTypeDefinition } from "sanity";
// import { notes } from "./notes";
import { todoSchema } from "./todoSchema";
import { noteSchema } from "./noteSchema";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [todoSchema, noteSchema],
};
