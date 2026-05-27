"use client";

import { useEffect, useState, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Question } from "@/models/types";
import { useAuth } from "@/contexts/AuthContext";
import { saveGeneratedQuiz } from "@/services/quizService";
import {
  clearQuizSnapshot,
  isSnapshotFresh,
  readQuizSnapshot,
  saveQuizSnapshot,
} from "@/lib/utils";
import styles from "../quiz.module.css";

type QuizActionsProps = {
  questions: Question[];
  themes: string[];
  difficulties: string[];
};

const QuizActions = ({ questions, themes, difficulties }: QuizActionsProps) => {
  const [fallbackWarning, setFallbackWarning] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isSavingQuiz, setIsSavingQuiz] = useState(false);
  const [isQuizNameVisible, setIsQuizNameVisible] = useState(false);
  const [quizName, setQuizName] = useState("");
  const { user, setUser } = useAuth();

  const router = useRouter();

  const generatedQuestionIds = questions.map((question) => String(question.id));
  const trimmedQuizName = quizName.trim();
  const canSaveQuiz = trimmedQuizName.length > 0;

  useEffect(() => {
    saveQuizSnapshot({
      version: 1,
      createdAt: new Date().toISOString(),
      questionIds: questions.map((question) => question.id),
      themes,
      difficulties,
    });
  }, [questions, themes, difficulties]);

  const pdfParams = new URLSearchParams();

  questions.forEach((question) =>
    pdfParams.append("questionIds", String(question.id)),
  );
  themes.forEach((theme) => pdfParams.append("themes", theme));
  difficulties.forEach((difficulty) =>
    pdfParams.append("difficulties", difficulty),
  );

  const pdfDownloadHref = `api/quiz/pdf?${pdfParams.toString()}`;

  const fallbackParams = new URLSearchParams();
  themes.forEach((theme) => fallbackParams.append("themes", theme));
  difficulties.forEach((difficulty) =>
    fallbackParams.append("difficulties", difficulty),
  );
  const fallbackPdfDownloadHref = `api/quiz/pdf?${fallbackParams.toString()}`;

  const handleDownloadClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const snapshot = readQuizSnapshot();
    const hasFreshSnapshot =
      snapshot !== null &&
      isSnapshotFresh(snapshot) &&
      snapshot.questionIds.length > 0;

    if (hasFreshSnapshot) {
      setFallbackWarning("");
      return;
    }

    setFallbackWarning(
      "Kunde inte verifiera sparad quiz-data. PDF skapas med tema och svårighetsgrad som fallback.",
    );

    event.preventDefault();
    window.location.href = fallbackPdfDownloadHref;
  };

  const handleSaveQuiz = async () => {
    if (!user) {
      setSaveError("");
      setSaveMessage("Logga in för att spara quizet.");
      return;
    }

    if (!canSaveQuiz) {
      setSaveMessage("");
      setSaveError("Ange ett namn för quizet först.");
      return;
    }

    setSaveMessage("");
    setSaveError("");
    setIsSavingQuiz(true);

    try {
      const result = await saveGeneratedQuiz({
        questions: generatedQuestionIds,
        createdBy: user.id,
        quizName: trimmedQuizName,
      });

      setUser(result.user);
      // Refresh the current route so server components (like QuizList) refetch data
      try {
        router.refresh();
      } catch {}
      setSaveMessage(result.message || "Quizet sparades.");
    } catch (error) {
      setSaveMessage("");
      setSaveError(
        error instanceof Error ? error.message : "Kunde inte spara quizet.",
      );
    } finally {
      setIsSavingQuiz(false);
    }
  };

  return (
    <div
      className={`${styles.actionsContainer} QuizActionsContainer`}
      data-question-count={questions.length}
    >
      <Link
        href="/?generate=false"
        className={styles.clearButton}
        onClick={clearQuizSnapshot}
      >
        Rensa quiz
      </Link>
      <Link
        href={pdfDownloadHref}
        className={styles.downloadButton}
        onClick={handleDownloadClick}
      >
        Ladda ner PDF
      </Link>
      <button
        type="button"
        className={styles.nameToggleButton}
        onClick={() => setIsQuizNameVisible((current) => !current)}
      >
        {isQuizNameVisible ? "Dölj namn" : "Spara quiz"}
      </button>

      {isQuizNameVisible && (
        <div className={styles.nameField}>
          <label className={styles.nameLabel} htmlFor="quiz-name">
            Quiznamn
          </label>
          <input
            id="quiz-name"
            type="text"
            className={styles.nameInput}
            value={quizName}
            onChange={(event) => setQuizName(event.target.value)}
            placeholder="Skriv ett namn för quizet"
            aria-describedby="quiz-name-hint"
          />
          <p id="quiz-name-hint" className={styles.nameHint}>
            Namnet visas när du sparar quizet.
          </p>

          <button
            type="button"
            className={styles.saveButton}
            onClick={handleSaveQuiz}
            disabled={isSavingQuiz || !canSaveQuiz}
          >
            {isSavingQuiz ? "Sparar quiz..." : "Spara quiz"}
          </button>
        </div>
      )}
      {fallbackWarning && (
        <p className={styles.snapshotWarning}>{fallbackWarning}</p>
      )}
      {saveMessage && <p className={styles.snapshotWarning}>{saveMessage}</p>}
      {saveError && <p className={styles.saveError}>{saveError}</p>}
    </div>
  );
};

export default QuizActions;
