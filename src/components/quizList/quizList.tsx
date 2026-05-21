import { getQuizPreviews } from "@/services/quizService";
import styles from "./quizList.module.css";
import QuizPreviewCard from "./components/quizPreviewCard/quizPreviewCard";

const QuizList = async () => {
  const quizzes = await getQuizPreviews();

  return (
    <section className={styles.section} aria-labelledby="quiz-list-heading">
      <h2 id="quiz-list-heading" className={styles.heading}>
        Topplistan - mest sparade quiz
      </h2>
      {quizzes.length > 0 ? (
        <div className={styles.list}>
          {quizzes.map((quiz) => (
            <QuizPreviewCard key={quiz._id} quiz={quiz} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>Det finns inga quiz att visa.</div>
      )}
    </section>
  );
};

export default QuizList;
