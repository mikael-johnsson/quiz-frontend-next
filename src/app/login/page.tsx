import LoginForm from "@/components/loginForm/loginForm";
import Link from "next/link";
import styles from "./page.module.css";

/**
 * Dedicated login page route.
 * Uses the existing auth page layout styles so the visual structure
 * stays consistent while we build separate auth pages step by step.
 */
export default function LoginPage() {
  return (
    <main className={styles.main}>
      <h1 className={styles.heading}>Logga in</h1>
      <div className={styles.formWrap}>
        <LoginForm />
      </div>
      <p className={styles.linkRow}>
        Har du inget konto?{" "}
        <Link className={styles.link} href="/signup">
          Skapa konto
        </Link>
      </p>
    </main>
  );
}
