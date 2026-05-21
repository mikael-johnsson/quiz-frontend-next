import LandingAside from "@/components/landingAside/landingAside";
import styles from "./page.module.css";
import QuizForm from "@/components/quizForm/quizForm";
import Quiz from "@/components/quiz/quiz";
import { normalizeArray } from "@/lib/utils";
import NotApprovedFeedGate from "@/components/notApprovedFeed/notApprovedFeedGate";
import { getThemeOptions } from "@/components/quizForm/utils/getThemeOptions";
import DevelopmentBanner from "@/components/developmentBanner/developmentBanner";

const NEXT_PUBLIC_QUESTION_URL = process.env.NEXT_PUBLIC_QUESTION_URL || "";

type PageProps = {
  searchParams: Promise<{
    themes?: string | string[];
    difficulties?: string | string[];
    generate: string;
    amount?: string | string[];
  }>;
};

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;

  const urlThemes = normalizeArray(params.themes);
  const difficulties = normalizeArray(params.difficulties);

  const hasGenerated = params.generate === "true";

  // Parse `amount` from searchParams. Backend default is 20 when omitted.
  const rawAmount = Array.isArray(params.amount)
    ? params.amount[0]
    : params.amount;
  let amount = 20; // backend default
  if (rawAmount !== undefined) {
    const parsed = parseInt(rawAmount, 10);
    if (!Number.isNaN(parsed)) {
      amount = Math.min(Math.max(parsed, 1), 50);
    }
  }

  const themes = await getThemeOptions(NEXT_PUBLIC_QUESTION_URL);

  return (
    <main className={styles.main}>
      <DevelopmentBanner />
      <LandingAside />
      <NotApprovedFeedGate />
      <section className={styles.section}>
        <h1 className={styles.h1}>Skapa ditt quiz direkt!</h1>
        <QuizForm themes={themes} />
        {hasGenerated && (
          <Quiz
            themes={urlThemes}
            difficulties={difficulties}
            url={NEXT_PUBLIC_QUESTION_URL}
            amount={amount}
          />
        )}
      </section>
    </main>
  );
}
