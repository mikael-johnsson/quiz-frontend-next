"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import styles from "./loginForm.module.css";

/**
 * LoginForm — lets an existing user sign in with email and password.
 * This is a client component because it uses useState (to track form fields
 * and feedback messages) and useRouter (to redirect after a successful login).
 */
const LoginForm = () => {
  // Controlled input state — each field maps to a piece of state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI feedback state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const { loginAction, isLoading: isAuthLoading, isAuthenticated } = useAuth();

  /**
   * Called when the form is submitted.
   * Calls the login service, shows feedback, and redirects on success.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Reset any previous feedback before a new attempt
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      const res = await loginAction({ email: email, password: password });
      if (res) {
        console.log("Login successful:", res);
      }

      setSuccess(true);

      router.push("/");
    } catch (err) {
      // Show the error message returned by the service (or a fallback)
      setError(
        err instanceof Error ? err.message : "Något gick fel, försök igen.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return (
      <div className={styles.card}>
        <h2 className={styles.heading}>Logga in</h2>
        <p>Du är redan inloggad.</p>
        <p>
          Gå till <Link href="/">startsidan</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.heading}>Logga in</h2>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="login-email">
            Email
          </label>
          <input
            className={styles.input}
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="login-password">
            Lösenord
          </label>
          <input
            className={styles.input}
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <button className={styles.button} type="submit" disabled={isLoading}>
          {isLoading ? "Loggar in..." : "Logga in"}
        </button>

        {/* Inline feedback — shown below the button */}
        {error && <p className={styles.error}>{error}</p>}
        {success && (
          <p className={styles.successMsg}>
            Inloggning lyckades! Omdirigerar...
          </p>
        )}
      </form>
    </div>
  );
};

export default LoginForm;
