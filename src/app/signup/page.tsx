import SignUpForm from "@/components/signUpForm/signUpForm";
import Link from "next/link";
import styles from "../login/page.module.css";

/**
 * Dedicated signup page route.
 * Reuses the same auth layout styles as the login page so both pages
 * look consistent while we implement the auth flow in small steps.
 */
export default function SignUpPage() {
  return (
    <main className={styles.main}>
      <h1 className={styles.heading}>Skapa konto</h1>
      <div className={styles.formWrap}>
        <SignUpForm />
      </div>
      <p className={styles.linkRow}>
        Har du redan ett konto?{" "}
        <Link className={styles.link} href="/login">
          Logga in
        </Link>
      </p>
    </main>
  );
}
