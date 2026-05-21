"use client";
import styles from "./quizForm.module.css";
import { useRouter } from "next/navigation";

type QuizFormProps = {
  themes: string[];
};

const QuizForm = ({ themes }: QuizFormProps) => {
  const router = useRouter();

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    const params = new URLSearchParams();

    // Append all form fields except `amount` so we can normalize `amount` first
    formData.forEach((value, key) => {
      if (key === "amount") return;
      params.append(key, value.toString());
    });

    // Normalize and clamp `amount` before appending
    const amountEntry = formData.get("amount");
    if (amountEntry !== null) {
      const parsed = parseInt(amountEntry.toString(), 10);
      if (!Number.isNaN(parsed)) {
        const clamped = Math.min(Math.max(parsed, 1), 50);
        params.append("amount", clamped.toString());
      }
    }

    params.append("generate", "true");
    router.push(`/?${params.toString()}`);
  };

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
        <h3 className={styles.heading}>Antal frågor</h3>
        <input
          id="amount"
          name="amount"
          type="number"
          min={1}
          max={50}
          defaultValue={10}
          aria-label="Antal frågor"
        />
        <p style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
          Välj hur många frågor som ska genereras (1–50).
        </p>
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
