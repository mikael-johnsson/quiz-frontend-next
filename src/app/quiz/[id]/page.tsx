import Link from "next/link";
import type { SavedQuiz } from "@/models/types";
import { buildSavedQuizPdfHref, getSavedQuiz } from "@/services/quizService";
import QuizPreviewContent from "@/components/quizList/components/quizPreviewContent/quizPreviewContent";
import styles from "./page.module.css";

type QuizRoutePageProps = {
  params: Promise<{
    id?: string;
  }>;
};

const isQuiz = (value: SavedQuiz | null): value is SavedQuiz => {
  return value !== null;
};

export default async function QuizRoutePage({ params }: QuizRoutePageProps) {
  const routeParams = await params;
  const quizId = routeParams.id?.trim();

  if (!quizId) {
    return (
      <main className={styles.container}>
        <section className={styles.errorCard} aria-live="polite">
          <h1 className={styles.heading}>Quizet kunde inte laddas</h1>
          <p className={styles.message}>Quiz-id saknas i länken.</p>
          <Link href="/" className={styles.backLink}>
            Till startsidan
          </Link>
        </section>
      </main>
    );
  }

  let quiz: SavedQuiz | null = null;
  let errorMessage = "";

  try {
    quiz = await getSavedQuiz(quizId);
  } catch {
    errorMessage =
      "Kunde inte ladda quizet. Kontrollera länken och försök igen.";
  }

  if (!isQuiz(quiz)) {
    return (
      <main className={styles.container}>
        <section className={styles.errorCard} aria-live="polite">
          <h1 className={styles.heading}>Quizet kunde inte laddas</h1>
          <p className={styles.message}>{errorMessage}</p>
          <Link href="/" className={styles.backLink}>
            Till startsidan
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <article className={styles.card}>
        <QuizPreviewContent quiz={quiz} isExpanded={false} forceExpanded />

        <div className={styles.actions}>
          <Link
            href={buildSavedQuizPdfHref(quiz)}
            className={styles.downloadButton}
          >
            Ladda ner PDF
          </Link>
        </div>
      </article>
    </main>
  );
}
