"use client";

import { useEffect, useState, type MouseEvent } from "react";
import Link from "next/link";
import type { Question } from "@/models/types";
import {
  clearQuizSnapshot,
  isSnapshotFresh,
  readQuizSnapshot,
  saveQuizSnapshot,
} from "@/lib/utils";
import styles from "./quiz.module.css";

type QuizActionsProps = {
  questions: Question[];
  themes: string[];
  difficulties: string[];
};

const QuizActions = ({ questions, themes, difficulties }: QuizActionsProps) => {
  const [fallbackWarning, setFallbackWarning] = useState("");

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
  console.log("PDF download href:", pdfDownloadHref);

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

  return (
    <div
      className={styles.actionsContainer}
      data-question-count={questions.length}
    >
      <Link
        href="/?generate=false"
        className={styles.clearButton}
        onClick={clearQuizSnapshot}
      >
        Rensa quiz
      </Link>
      <a
        href={pdfDownloadHref}
        className={styles.downloadButton}
        onClick={handleDownloadClick}
      >
        Ladda ner PDF
      </a>
      {fallbackWarning && (
        <p className={styles.snapshotWarning}>{fallbackWarning}</p>
      )}
    </div>
  );
};

export default QuizActions;
