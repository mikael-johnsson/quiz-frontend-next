import LandingAside from "@/components/landingAside/landingAside";
import styles from "./page.module.css";
import QuizForm from "@/components/quizForm/quizForm";
import Quiz from "@/components/quiz/quiz";
import { normalizeArray } from "@/lib/utils";
import NotApprovedFeedGate from "@/components/notApprovedFeed/notApprovedFeedGate";

const NEXT_PUBLIC_QUESTION_URL = process.env.NEXT_PUBLIC_QUESTION_URL || "";

type PageProps = {
  searchParams: Promise<{
    themes?: string | string[];
    difficulties?: string | string[];
    generate: string;
  }>;
};

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;

  const themes = normalizeArray(params.themes);
  const difficulties = normalizeArray(params.difficulties);

  const hasGenerated = params.generate === "true";

  return (
    <main className={styles.main}>
      <LandingAside />
      <NotApprovedFeedGate />
      <section className={styles.section}>
        <h1 className={styles.h1}>Skapa ditt quiz direkt!</h1>
        <QuizForm />
        {hasGenerated && (
          <Quiz
            themes={themes}
            difficulties={difficulties}
            url={NEXT_PUBLIC_QUESTION_URL}
          />
        )}
      </section>
    </main>
  );
}
