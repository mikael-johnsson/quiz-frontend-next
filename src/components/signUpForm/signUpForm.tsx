"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/services/authService";
import styles from "./signUpForm.module.css";

/**
 * SignUpForm — lets a new user create an account with their name, email and password.
 * This is a client component because it uses useState (to track form fields
 * and feedback messages) and useRouter (to redirect after a successful sign-up).
 */
const SignUpForm = () => {
  // Controlled input state — each field maps to a piece of state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI feedback state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const router = useRouter();

  /**
   * Called when the form is submitted.
   * Calls the signUp service, shows feedback, and redirects on success.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Reset any previous feedback before a new attempt
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      await signUp({ firstName, lastName, email, password });
      setSuccess(true);

      // Short delay so the user can see the success message before being redirected
      setTimeout(() => router.push("/"), 1000);
    } catch (err) {
      // Show the error message returned by the service (or a fallback)
      setError(
        err instanceof Error ? err.message : "Något gick fel, försök igen.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.heading}>Skapa konto</h2>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="signup-firstname">
              Förnamn
            </label>
            <input
              className={styles.input}
              id="signup-firstname"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              autoComplete="given-name"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="signup-lastname">
              Efternamn
            </label>
            <input
              className={styles.input}
              id="signup-lastname"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              autoComplete="family-name"
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="signup-email">
            Email
          </label>
          <input
            className={styles.input}
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="signup-password">
            Lösenord
          </label>
          <input
            className={styles.input}
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        <button className={styles.button} type="submit" disabled={isLoading}>
          {isLoading ? "Signing up..." : "Sign up"}
        </button>

        {/* Inline feedback — shown below the button */}
        {error && <p className={styles.error}>{error}</p>}
        {success && (
          <p className={styles.successMsg}>Konto skapat! Omdirigerar...</p>
        )}
      </form>
    </div>
  );
};

export default SignUpForm;
