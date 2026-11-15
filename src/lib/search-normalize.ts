const ARABIC_INDIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const EASTERN_ARABIC_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export function toWesternDigits(value: string): string {
  let out = "";
  for (const ch of value) {
    const idx1 = ARABIC_INDIC_DIGITS.indexOf(ch);
    if (idx1 !== -1) {
      out += String(idx1);
      continue;
    }
    const idx2 = EASTERN_ARABIC_DIGITS.indexOf(ch);
    if (idx2 !== -1) {
      out += String(idx2);
      continue;
    }
    out += ch;
  }
  return out;
}

/**
 * Normalizes Arabic and English text for tolerant search:
 * - Converts Arabic-Indic / Persian digits to Western digits
 * - Strips Arabic diacritics (tashkeel) and tatweel
 * - Unifies Alef forms (أ إ آ ٱ -> ا)
 * - Unifies Yaa / Alef Maksura / Hamza-on-Yaa (ى ي ئ -> ي)
 * - Unifies Taa Marbuta / Haa (ة ه -> ه)
 * - Unifies Waw with Hamza (ؤ -> و)
 * - Lowercases and collapses whitespace
 */
export function normalizeSearchText(value: string): string {
  return toWesternDigits(value || "")
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/[ىيئ]/g, "ي")
    .replace(/[ةه]/g, "ه")
    .replace(/ؤ/g, "و")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizePhoneDigits(value: string): string {
  return toWesternDigits(value || "").replace(/\D/g, "");
}

/** Strips local 0 / international 966 / 00966 prefixes for flexible phone comparison. */
export function corePhoneDigits(value: string): string {
  const digits = normalizePhoneDigits(value);
  if (digits.startsWith("00966") && digits.length > 5) return digits.slice(5);
  if (digits.startsWith("966") && digits.length >= 11) return digits.slice(3);
  return digits.replace(/^0+/, "");
}

function phoneMatchesToken(phoneTargets: string[], rawToken: string): boolean {
  const tokenDigits = normalizePhoneDigits(rawToken);
  if (!tokenDigits) return false;
  const tokenCore = corePhoneDigits(rawToken);

  return phoneTargets.some((target) => {
    const targetDigits = normalizePhoneDigits(target);
    if (!targetDigits) return false;
    if (targetDigits.includes(tokenDigits)) return true;
    const targetCore = corePhoneDigits(target);
    return Boolean(tokenCore && targetCore && targetCore.includes(tokenCore));
  });
}

/**
 * Matches a user query against text fields and phone fields using
 * tolerant Arabic normalization and multi-token matching.
 */
export function matchesNormalizedQuery(
  query: string,
  textFields: Array<string | null | undefined>,
  phoneFields: Array<string | null | undefined> = []
): boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  const haystack = normalizeSearchText(textFields.filter(Boolean).join(" "));
  const phones = phoneFields.filter((value): value is string => Boolean(value && value.trim()));

  // Also check if entire query is a phone fragment (e.g. "055 555 555")
  const wholeDigits = normalizePhoneDigits(query);
  const nonDigitRemainder = normalizeSearchText(query).replace(/[\d\s+\-().]/g, "");
  if (wholeDigits.length >= 3 && !nonDigitRemainder) {
    if (phoneMatchesToken(phones, wholeDigits)) return true;
  }

  const tokens = normalizedQuery.split(" ").filter(Boolean);
  return tokens.every((token) => {
    if (haystack.includes(token)) return true;
    const tokenDigits = normalizePhoneDigits(token);
    if (tokenDigits.length > 0 && tokenDigits.length === token.replace(/[+\-().]/g, "").length) {
      return phoneMatchesToken(phones, tokenDigits);
    }
    return false;
  });
}
