"use client";

import { useCallback, useEffect, useState } from "react";
import type { QuestionResponse } from "@/models/types";
import { getQuestions, updateIsApproved } from "@/services/quizService";
import styles from "./notApprovedFeed.module.css";

const NEXT_PUBLIC_QUESTION_URL = process.env.NEXT_PUBLIC_QUESTION_URL || "";

const NotApprovedFeed = () => {
  const [data, setData] = useState<QuestionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isFeedVisible, setIsFeedVisible] = useState(true);

  const handleApprove = async (questionId: number, questionText: string) => {
    const res = await updateIsApproved(
      questionId,
      NEXT_PUBLIC_QUESTION_URL || "",
    );
    if (!res.ok) {
      setErrorMessage(`Kunde inte godkänna frågan: ${questionText}`);
      return;
    }
    await fetchNotApprovedQuestions();
  };

  const fetchNotApprovedQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await getQuestions(
        [],
        [],
        process.env.NEXT_PUBLIC_QUESTION_URL || "",
        false,
        3,
      );

      setData(response);
    } catch {
      setErrorMessage("Kunde inte hämta frågor som väntar på godkännande.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotApprovedQuestions();
  }, []);

  if (isLoading) {
    return <p>Laddar frågor...</p>;
  }

  if (errorMessage) {
    return <p>{errorMessage}</p>;
  }

  if (!data) {
    return <p>Inga frågor väntar på godkännande</p>;
  }

  if (data.questions.length === 0) {
    return <p>Inga frågor väntar på godkännande</p>;
  }

  if (!isFeedVisible) {
    return (
      <button
        type="button"
        className={styles.toggleButton}
        onClick={() => setIsFeedVisible(true)}
      >
        Visa icke godkända frågor
      </button>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Frågor väntande på godkännande</h3>
        <button
          type="button"
          className={styles.hideButton}
          onClick={() => setIsFeedVisible(false)}
        >
          Dölj feed
        </button>
      </div>
      {data.questions.map((q) => (
        <div key={q.id} className={styles.questionItem}>
          <div className={styles.questionContent}>
            <h3>{q.question}</h3>
            <p>{q.answer}</p>
          </div>
          <button
            type="button"
            className={styles.approveButton}
            onClick={() => handleApprove(q.id, q.question)}
          >
            Approve
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotApprovedFeed;
