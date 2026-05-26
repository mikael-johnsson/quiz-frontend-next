import Link from "next/link";
import type { Question, SavedQuiz } from "@/models/types";
import styles from "./quizPreviewContent.module.css";

type QuizPreviewContentProps = {
  quiz: SavedQuiz;
  isExpanded: boolean;
  forceExpanded?: boolean;
  isLoadingQuiz?: boolean;
  errorMessage?: string;
  onCreatorClick?: () => void;
};

const QuizPreviewContent = ({
  quiz,
  isExpanded,
  forceExpanded = false,
  isLoadingQuiz = false,
  errorMessage = "",
  onCreatorClick,
}: QuizPreviewContentProps) => {
  const shouldShowExpandedContent = isExpanded || forceExpanded;

  const creator = onCreatorClick ? (
    <button
      type="button"
      className={styles.creatorButton}
      onClick={onCreatorClick}
    >
      Quiz skapat av: {quiz.createdBy.firstname}
    </button>
  ) : (
    <p className={styles.creatorText}>
      Quiz skapat av: {quiz.createdBy.firstname}
    </p>
  );

  return (
    <>
      {creator}
      <div className={styles.saves}>Antal sparningar: {quiz.amountOfSaves}</div>
      <Link
        href={`/quiz/${encodeURIComponent(quiz._id)}`}
        className={styles.quizLink}
      >
        Öppna quiz
      </Link>
      {shouldShowExpandedContent && (
        <div className={styles.expandedContent}>
          {isLoadingQuiz && <p className={styles.status}>Laddar quiz...</p>}
          {errorMessage && <p className={styles.error}>{errorMessage}</p>}
          {!isLoadingQuiz && !errorMessage && (
            <div>
              <h3 className={styles.expandedHeading}>Frågor i quizet</h3>
              {quiz.questions.length > 0 ? (
                <ol className={styles.questionList}>
                  {(quiz.questions as Question[]).map((question) => {
                    const themes = question.themes.join(", ");

                    return (
                      <li key={question.id} className={styles.questionItem}>
                        <h4 className={styles.questionHeading}>
                          {question.question}
                        </h4>
                        <p className={styles.answerLabel}>Svar</p>
                        <p className={styles.answerText}>{question.answer}</p>
                        <div className={styles.metaRow}>
                          <span className={styles.metaChip}>
                            Svårighet: {question.difficulty}
                          </span>
                          <span className={styles.metaChip}>
                            Teman: {themes || "Inga teman"}
                          </span>
                        </div>
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
    </>
  );
};

export default QuizPreviewContent;
