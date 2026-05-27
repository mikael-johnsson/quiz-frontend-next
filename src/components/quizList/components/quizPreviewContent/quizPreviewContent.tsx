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

  const quizName = onCreatorClick ? (
    <Link
      href={`/quiz/${encodeURIComponent(quiz._id)}`}
      className={styles.creatorButton}
    >
      Namn: {quiz.quizName}
    </Link>
  ) : (
    <p className={styles.creatorText}>Namn: {quiz.quizName}</p>
  );

  const openQuizLink = onCreatorClick ? (
    <button type="button" className={styles.quizLink} onClick={onCreatorClick}>
      Öppna quiz
    </button>
  ) : null;

  return (
    <>
      <div className={styles.creator}>
        {quizName} {openQuizLink}
      </div>

      <div className={styles.saves}>Antal sparningar: {quiz.amountOfSaves}</div>

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
