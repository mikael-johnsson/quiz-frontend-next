"use client";

import { useState } from "react";
import type { Question, SavedQuiz } from "@/models/types";
import {
  getSavedQuiz,
  saveQuizById,
  unsaveQuizById,
} from "@/services/quizService";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./quizPreviewCard.module.css";

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
      <button
        type="button"
        className={styles.creatorButton}
        onClick={toggleQuiz}
      >
        Quiz skapat av: {activeQuiz.createdBy.firstname}
      </button>
      <div className={styles.saves}>
        Antal sparningar: {activeQuiz.amountOfSaves}
      </div>
      <div>
        {user ? (
          <>
            {isSaved && <span className={styles.savedBadge}>SAVED</span>}
            <button
              type="button"
              className={styles.saveButton}
              onClick={handleSave}
              disabled={isLoadingQuiz}
            >
              {isSaved ? "UNSAVE" : "SAVE"}
            </button>
          </>
        ) : null}
      </div>
      {isExpanded && (
        <div className={styles.expandedContent}>
          {isLoadingQuiz && <p className={styles.status}>Laddar quiz...</p>}
          {errorMessage && <p className={styles.error}>{errorMessage}</p>}
          {!isLoadingQuiz && !errorMessage && (
            <div>
              <h3 className={styles.expandedHeading}>Frågor i quizet</h3>
              {quiz.questions.length > 0 ? (
                <ol className={styles.questionList}>
                  {(quiz.questions as (number | Question)[]).map((q) => {
                    const isNumber = typeof q === "number";
                    const key = isNumber ? q : (q.id ?? JSON.stringify(q));
                    return (
                      <li key={key} className={styles.questionItem}>
                        {isNumber ? `Fråga med id ${q}` : q.question}
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <p className={styles.status}>Inga frågor finns i detta quiz.</p>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
};

export default QuizPreviewCard;
