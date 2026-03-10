import LoginForm from "@/components/loginForm/loginForm";
import SignUpForm from "@/components/signUpForm/signUpForm";
import styles from "./page.module.css";

/**
 * The /auth page — a server component that renders the login and sign-up
 * forms side by side. No data fetching is needed here, so it can stay
 * as a server component and let the child components handle interactivity.
 */
export default function AuthPage() {
  return (
    <main className={styles.main}>
      <h1 className={styles.heading}>Välkommen!</h1>
      <div className={styles.formsRow}>
        <LoginForm />
        <SignUpForm />
      </div>
    </main>
  );
}
