"use client";

import { useState } from "react";
import type { SavedQuiz } from "@/models/types";
import {
  getSavedQuiz,
  saveQuizById,
  unsaveQuizById,
} from "@/services/quizService";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./quizPreviewCard.module.css";
import { HeartIcon } from "@heroicons/react/24/solid";
import QuizPreviewContent from "../quizPreviewContent/quizPreviewContent";

type QuizPreviewCardProps = {
  quiz: SavedQuiz;
};

export const QuizPreviewCard = ({ quiz }: QuizPreviewCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [quizMeta, setQuizMeta] = useState<
    Partial<Pick<SavedQuiz, "amountOfSaves" | "createdBy" | "createdWhen">>
  >({});
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const activeQuiz = {
    ...quiz,
    ...quizMeta,
  };

  const { user, setUser } = useAuth();
  const savedQuizIds = (user?.savedQuizzes ?? []).map(String);
  const isSaved = savedQuizIds.includes(String(quiz._id));

  const toggleQuiz = async () => {
    if (isExpanded) {
      setIsExpanded(false);
      setErrorMessage("");
      return;
    }

    setIsExpanded(true);
  };

  const handleSave = async () => {
    setErrorMessage("");

    if (!user) {
      alert("Logga in för att spara quiz.");
      return;
    }

    if (!quiz?._id) {
      console.error("Attempted to save quiz but quiz._id is missing", { quiz });
      setErrorMessage("Quiz-id saknas. Kan inte spara.");
      return;
    }

    setIsLoadingQuiz(true);

    try {
      if (isSaved) {
        await unsaveQuizById(quiz._id);
        const updated = (user.savedQuizzes || []).filter(
          (id) => id !== quiz._id,
        );
        setUser({ ...user, savedQuizzes: updated });
        try {
          const latest = await getSavedQuiz(quiz._id);
          setQuizMeta((current) => ({
            ...current,
            amountOfSaves: latest.amountOfSaves,
            createdBy: latest.createdBy,
            createdWhen: latest.createdWhen,
          }));
        } catch {}
      } else {
        await saveQuizById(quiz._id);
        const updated = Array.from(
          new Set([...(user.savedQuizzes || []), quiz._id]),
        );
        setUser({ ...user, savedQuizzes: updated });
        try {
          const latest = await getSavedQuiz(quiz._id);
          setQuizMeta((current) => ({
            ...current,
            amountOfSaves: latest.amountOfSaves,
            createdBy: latest.createdBy,
            createdWhen: latest.createdWhen,
          }));
        } catch {}
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Kunde inte spara quizet.",
      );
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  return (
    <article className={styles.card}>
      <QuizPreviewContent
        quiz={activeQuiz}
        isExpanded={isExpanded}
        isLoadingQuiz={isLoadingQuiz}
        errorMessage={errorMessage}
        onCreatorClick={toggleQuiz}
      />
      <div>
        {user ? (
          <button
            type="button"
            onClick={handleSave}
            className={styles.saveButton}
            aria-label={isSaved ? "Ta bort sparat quiz" : "Spara quiz"}
            aria-pressed={isSaved}
            disabled={isLoadingQuiz}
          >
            <HeartIcon
              className={styles.saveIcon}
              color={isSaved ? "red" : "currentColor"}
            />
          </button>
        ) : null}
      </div>
    </article>
  );
};

export default QuizPreviewCard;
