/**
 * Utility functions
 */

type ClassValue = string | number | boolean | undefined | null | ClassValue[];

/**
 * Merges class names, filtering out falsy values. Useful for conditional Tailwind classes.
 */
export function cn(...inputs: ClassValue[]): string {
  return inputs
    .flat()
    .filter((x) => typeof x === "string" && x.length > 0)
    .join(" ")
    .trim();
}
