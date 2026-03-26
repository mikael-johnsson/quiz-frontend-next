"use client";
import styles from "./quizForm.module.css";
import { getThemeOptions } from "./utils/getThemeOptions";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

const QuizForm = () => {
  const [themes, setThemes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      setIsLoading(false);
      setThemes([]);
      return;
    }

    const loadThemes = async () => {
      setIsLoading(true);

      try {
        const themes = await getThemeOptions(NEXT_PUBLIC_BASE_URL);
        setThemes(themes);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadThemes();
  }, [isAuthLoading, isAuthenticated]);

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    const params = new URLSearchParams();

    formData.forEach((value, key) => {
      params.append(key, value.toString());
    });

    params.append("generate", "true");
    router.push(`/?${params.toString()}`);
  };

  if (isAuthLoading || isLoading) return <div>Loading form...</div>;

  if (!isAuthenticated) {
    return (
      <div>
        Du behöver vara inloggad för att skapa quiz.{" "}
        <Link href="/login">Logga in här</Link>.
      </div>
    );
  }

  return (
    <form id="search-form" className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.col}>
        <h3 className={styles.heading}>Teman</h3>
        <select
          className={styles.select}
          name="themes"
          id="themes-dropdown"
          multiple
        >
          {themes?.map((theme) => {
            return (
              <option key={theme} value={theme}>
                {theme.toUpperCase()}
              </option>
            );
          })}
        </select>
      </div>

      <div className={styles.col}>
        <h3 className={styles.heading}>Svårighetsgrad</h3>

        <div className={styles.checks}>
          <label className={styles.check}>
            <input
              id="easy"
              className={styles.checkInput}
              type="checkbox"
              value="easy"
              name="difficulties"
            />
            <span className={styles.checkBox} aria-hidden="true"></span>
            <span className="check__text">Enkelt</span>
          </label>

          <label className={styles.check}>
            <input
              id="medium"
              className={styles.checkInput}
              type="checkbox"
              value="medium"
              name="difficulties"
            />
            <span className={styles.checkBox} aria-hidden="true"></span>
            <span className="check__text">Medium</span>
          </label>

          <label className={styles.check}>
            <input
              id="hard"
              className={styles.checkInput}
              type="checkbox"
              value="hard"
              name="difficulties"
            />
            <span className={styles.checkBox} aria-hidden="true"></span>
            <span className="check__text">Svårt</span>
          </label>
        </div>
      </div>

      <button id="fetch-button" className={styles.submitButton} type="submit">
        Generera quiz
      </button>
    </form>
  );
};

export default QuizForm;
