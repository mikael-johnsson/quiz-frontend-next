import { useAuth } from "@/contexts/AuthContext";
import { PostQuestionRequest } from "@/models/types";
import { createQuestion } from "@/services/quizService";
import { getThemeOptions } from "@/components/quizForm/utils/getThemeOptions";
import { useEffect, useRef, useState } from "react";
import styles from "./questionForm.module.css";

const NEXT_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

const QUESTION_TYPES = [{ value: "singleAnswer", label: "Vanligt svar" }];

const DIFFICULTY_OPTIONS = [
  { value: "enkelt", label: "Enkel" },
  { value: "medelsvår", label: "Medelsvår" },
  { value: "svår", label: "Svår" },
];

type QuestionFormProps = {
  onCreated?: () => void;
};

const QuestionForm = ({ onCreated }: QuestionFormProps) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const successTimeoutRef = useRef<number | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [questionType, setQuestionType] = useState(QUESTION_TYPES[0].value);
  const [themes, setThemes] = useState<string[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState("");
  const [isLoadingThemes, setIsLoadingThemes] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current !== null) {
        window.clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      setThemes([]);
      setIsLoadingThemes(false);
      return;
    }

    const loadThemes = async () => {
      setIsLoadingThemes(true);
      setError(null);

      try {
        const themeOptions = await getThemeOptions(NEXT_PUBLIC_BASE_URL);
        setThemes(themeOptions);
      } catch {
        setError("Kunde inte hämta teman. Försök igen.");
      } finally {
        setIsLoadingThemes(false);
      }
    };

    void loadThemes();
  }, [isAuthenticated, isLoading]);

  const resetForm = () => {
    setQuestion("");
    setAnswer("");
    setQuestionType(QUESTION_TYPES[0].value);
    setSelectedThemes([]);
    setDifficulty("");
  };

  const getValidationError = () => {
    if (!question.trim()) {
      return "Du måste skriva en fråga.";
    }

    if (!answer.trim()) {
      return "Du måste skriva ett svar.";
    }

    if (!questionType.trim()) {
      return "Du måste välja frågetyp.";
    }

    if (selectedThemes.length === 0) {
      return "Du måste välja minst ett tema.";
    }

    if (!difficulty.trim()) {
      return "Du måste välja svårighetsgrad.";
    }

    return null;
  };

  const handleThemesChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValues = Array.from(event.currentTarget.selectedOptions).map(
      (option) => option.value,
    );
    setSelectedThemes(selectedValues);
  };

  if (!user || !isAuthenticated) {
    return (
      <p className={styles.statusMessage}>
        Du måste vara inloggad för att skapa en fråga.
      </p>
    );
  }

  if (isLoadingThemes) {
    return <p className={styles.statusMessage}>Laddar formuläret...</p>;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    const validationError = getValidationError();
    if (validationError) {
      setError(validationError);
      return;
    }

    const postData: PostQuestionRequest = {
      question: question.trim(),
      answer: answer.trim(),
      questionType,
      themes: selectedThemes,
      difficulty,
      createdBy: user.id,
    };

    setIsSubmitting(true);

    try {
      await createQuestion(postData);
      setSuccess(true);
      resetForm();

      if (onCreated) {
        successTimeoutRef.current = window.setTimeout(() => {
          onCreated();
        }, 2000);
      }
    } catch (submitError) {
      if (submitError instanceof Error) {
        setError(submitError.message);
      } else {
        setError("Något gick fel när frågan skulle sparas.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="question">
          Fråga
        </label>
        <input
          className={styles.input}
          type="text"
          id="question"
          name="question"
          value={question}
          onChange={(event) => setQuestion(event.currentTarget.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "question-form-error" : undefined}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="answer">
          Svar
        </label>
        <input
          className={styles.input}
          type="text"
          id="answer"
          name="answer"
          value={answer}
          onChange={(event) => setAnswer(event.currentTarget.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "question-form-error" : undefined}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="questionType">
          Frågetyp
        </label>
        <select
          className={styles.select}
          id="questionType"
          name="questionType"
          value={questionType}
          onChange={(event) => setQuestionType(event.currentTarget.value)}
        >
          {QUESTION_TYPES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="themes">
          Teman
        </label>
        <select
          className={`${styles.select} ${styles.themesSelect}`}
          id="themes"
          name="themes"
          multiple
          size={5}
          value={selectedThemes}
          onChange={handleThemesChange}
          aria-describedby="themes-helper"
        >
          {themes.map((theme) => (
            <option key={theme} value={theme}>
              {theme}
            </option>
          ))}
        </select>
        <p id="themes-helper" className={styles.helperText}>
          Håll in Cmd (Mac) för att välja flera teman.
        </p>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="difficulty">
          Svårighetsgrad
        </label>
        <select
          className={styles.select}
          id="difficulty"
          name="difficulty"
          value={difficulty}
          onChange={(event) => setDifficulty(event.currentTarget.value)}
        >
          <option value="">Välj svårighetsgrad</option>
          {DIFFICULTY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p
          id="question-form-error"
          className={`${styles.feedback} ${styles.error}`}
          role="alert"
        >
          {error}
        </p>
      )}
      {success && (
        <p className={`${styles.feedback} ${styles.success}`} role="status">
          Frågan skapades.
        </p>
      )}

      <button
        className={styles.submitButton}
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Sparar..." : "Skapa fråga"}
      </button>
    </form>
  );
};

export default QuestionForm;
