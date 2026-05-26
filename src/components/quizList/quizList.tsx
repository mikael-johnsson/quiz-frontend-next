"use client";

import type { SavedQuiz } from "@/models/types";
import styles from "./quizList.module.css";
import QuizPreviewCard from "./components/quizPreviewCard/quizPreviewCard";

type QuizListProps = {
  title?: string;
  emptyStateText?: string;
  quizzes?: SavedQuiz[];
  isLoading?: boolean;
};

const QuizList = ({
  title = "Topplistan - mest sparade quiz",
  emptyStateText = "Det finns inga quiz att visa.",
  quizzes: initialQuizzes,
  isLoading = false,
}: QuizListProps = {}) => {
  const quizzes = initialQuizzes ?? [];

  return (
    <section className={styles.section} aria-labelledby="quiz-list-heading">
      <h2 id="quiz-list-heading" className={styles.heading}>
        {title}
      </h2>

      {isLoading ? (
        <div className={styles.emptyState}>Laddar quiz...</div>
      ) : quizzes.length > 0 ? (
        <div className={styles.list}>
          {quizzes.map((quiz) => (
            <QuizPreviewCard key={quiz._id} quiz={quiz} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>{emptyStateText}</div>
      )}
    </section>
  );
};

export default QuizList;
