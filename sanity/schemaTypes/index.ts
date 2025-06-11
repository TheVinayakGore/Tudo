import { type SchemaTypeDefinition } from "sanity";
import { notes } from "./notes";
import { todos } from "./todos";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [notes, todos],
};
