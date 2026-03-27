"use client";

import { useEffect, useState } from "react";
import type { QuestionResponse } from "@/models/types";
import { getQuestions } from "@/services/quizService";

const NotApprovedFeed = () => {
  const [data, setData] = useState<QuestionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const handleApprove = (questionId: number, questionText: string) => {
    console.log("Approve clicked", {
      questionId,
      questionText,
    });

    setData((previousData) => {
      if (!previousData) {
        return previousData;
      }

      const updatedQuestions = previousData.questions.filter(
        (question) => question.id !== questionId,
      );

      return {
        ...previousData,
        questions: updatedQuestions,
        totalResult: updatedQuestions.length,
      };
    });
  };

  useEffect(() => {
    const fetchNotApprovedQuestions = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await getQuestions(
          [],
          [],
          process.env.NEXT_PUBLIC_BASE_URL || "",
          false,
        );

        setData(response);
      } catch {
        setErrorMessage("Kunde inte hämta frågor som väntar på godkännande.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchNotApprovedQuestions();
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

  return (
    <div>
      <h3>Frågor väntande på godkännande</h3>
      {data.questions.map((q) => (
        <div key={q.id}>
          <h3>{q.question}</h3>
          <p>{q.answer}</p>
          <button type="button" onClick={() => handleApprove(q.id, q.question)}>
            Approve
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotApprovedFeed;
