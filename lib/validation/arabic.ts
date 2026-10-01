/**
 * Conservative Arabic normalization for search: strips diacritics and
 * tatweel, normalizes alef/yeh/taa-marbuta forms, collapses whitespace.
 * It never invents matches — it only broadens equality of equivalent forms.
 */
export function normalizeArabic(input: string): string {
  return input
    .replace(/[\u064B-\u0652\u0670\u0640]/g, "") // harakat + dagger alef + tatweel
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function escapeLike(term: string): string {
  return term.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}
