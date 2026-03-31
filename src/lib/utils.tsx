import type { QuizSnapshot } from "@/models/types";

/**
 *
 * @param value a string or string array coming from the search params, or undefined if not present
 * @returns an array of strings, ensuring that even a single string is wrapped in an array, and undefined is returned as an empty array
 */
export function normalizeArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export const QUIZ_SNAPSHOT_STORAGE_KEY = "quizSnapshot";
export const QUIZ_SNAPSHOT_TTL_MS = 30 * 60 * 1000;

const getLocalStorageSafely = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const isStringArray = (value: unknown): value is string[] => {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
};

const isNumberArray = (value: unknown): value is number[] => {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "number")
  );
};

const isQuizSnapshot = (value: unknown): value is QuizSnapshot => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const snapshot = value as Record<string, unknown>;

  return (
    typeof snapshot.version === "number" &&
    typeof snapshot.createdAt === "string" &&
    isNumberArray(snapshot.questionIds) &&
    isStringArray(snapshot.themes) &&
    isStringArray(snapshot.difficulties)
  );
};

/**
 * Checks if a snapshot is still valid based on its creation time and a TTL.
 */
export const isSnapshotFresh = (
  snapshot: QuizSnapshot,
  ttlMs: number = QUIZ_SNAPSHOT_TTL_MS,
) => {
  const createdAtMs = Date.parse(snapshot.createdAt);

  if (Number.isNaN(createdAtMs)) {
    return false;
  }

  return Date.now() - createdAtMs <= ttlMs;
};

/**
 * Saves the quiz snapshot in localStorage.
 * Failures are ignored so UI flow does not crash in restricted browser contexts.
 */
export const saveQuizSnapshot = (snapshot: QuizSnapshot) => {
  const storage = getLocalStorageSafely();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(QUIZ_SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // no-op
  }
};

/**
 * Reads and validates quiz snapshot from localStorage.
 * Returns null for missing, malformed, or invalid data.
 */
export const readQuizSnapshot = () => {
  const storage = getLocalStorageSafely();

  if (!storage) {
    return null;
  }

  try {
    const raw = storage.getItem(QUIZ_SNAPSHOT_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    if (!isQuizSnapshot(parsed)) {
      storage.removeItem(QUIZ_SNAPSHOT_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

/**
 * Removes quiz snapshot from localStorage.
 */
export const clearQuizSnapshot = () => {
  const storage = getLocalStorageSafely();

  if (!storage) {
    return;
  }

  try {
    storage.removeItem(QUIZ_SNAPSHOT_STORAGE_KEY);
  } catch {
    // no-op
  }
};
