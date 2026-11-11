import { CLASSES } from "./classes";

export interface CharacterInput {
  name: string;
  class: string;
  ilvl: number;
  cp: number | null;
}

export type FieldErrors = Record<string, string>;

export const MAX_CHARACTERS = 50;
export const MAX_ILVL = 3000;
export const MAX_CP = 100_000_000;

export function validateCharacter(input: unknown): { value?: CharacterInput; errors?: FieldErrors } {
  const errors: FieldErrors = {};
  const raw = (input ?? {}) as Record<string, unknown>;
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const cls = typeof raw.class === "string" ? raw.class.trim() : "";
  const ilvl = typeof raw.ilvl === "number" ? raw.ilvl : NaN;

  if (!name) errors.name = "Name is required";
  else if (name.length > 32) errors.name = "Name is too long";
  if (!cls) errors.class = "Class is required";
  else if (!CLASSES.includes(cls)) errors.class = "Unknown class";
  if (!Number.isFinite(ilvl) || ilvl <= 0 || ilvl > MAX_ILVL) errors.ilvl = "ilvl must be a number between 1 and 3000";

  let cp: number | null = null;
  if (raw.cp !== undefined && raw.cp !== null && raw.cp !== "") {
    if (typeof raw.cp === "number" && Number.isFinite(raw.cp) && raw.cp > 0 && raw.cp <= MAX_CP) cp = raw.cp;
    else errors.cp = `CP must be a number between 1 and ${MAX_CP.toLocaleString("en-US")}`;
  }

  if (Object.keys(errors).length) return { errors };
  return { value: { name, class: cls, ilvl, cp } };
}

/** Validates a full roster, including case-insensitive unique names. Errors are keyed `characters.<index>.<field>`. */
export function validateRoster(input: unknown): { value?: CharacterInput[]; errors?: FieldErrors } {
  if (!Array.isArray(input) || input.length === 0) return { errors: { characters: "At least one character is required" } };
  if (input.length > MAX_CHARACTERS) return { errors: { characters: `At most ${MAX_CHARACTERS} characters` } };

  const errors: FieldErrors = {};
  const value: CharacterInput[] = [];
  const seen = new Set<string>();
  input.forEach((item, i) => {
    const result = validateCharacter(item);
    if (result.errors) {
      for (const [field, msg] of Object.entries(result.errors)) errors[`characters.${i}.${field}`] = msg;
      return;
    }
    const key = result.value!.name.toLowerCase();
    if (seen.has(key)) errors[`characters.${i}.name`] = "Duplicate character name";
    seen.add(key);
    value.push(result.value!);
  });
  if (Object.keys(errors).length) return { errors };
  return { value };
}
