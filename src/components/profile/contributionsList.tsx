"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type {
  PostQuestionRequest,
  Question,
  UpdateQuestionRequest,
} from "@/models/types";
import {
  deleteQuestion,
  getUserQuestions,
  updateQuestion,
} from "@/services/quizService";
import styles from "./contributionsList.module.css";

type ApprovalFilter = "all" | "approved" | "pending";

type FilterDraft = {
  approval: ApprovalFilter;
  search: string;
  theme: string;
  difficulty: string;
};

/**
 * ContributionsList shows the questions created by the logged-in user.
 * It fetches the data on mount and handles loading, empty, and error states.
 */
const ContributionsList = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(
    null,
  );
  const [editForm, setEditForm] = useState<UpdateQuestionRequest | null>(null);
  const [isSavingQuestionId, setIsSavingQuestionId] = useState<number | null>(
    null,
  );
  const [isDeletingQuestionId, setIsDeletingQuestionId] = useState<
    number | null
  >(null);
  const [actionMessage, setActionMessage] = useState("");
  const [filterDraft, setFilterDraft] = useState<FilterDraft>({
    approval: "all",
    search: "",
    theme: "",
    difficulty: "",
  });
  const [activeFilters, setActiveFilters] = useState<FilterDraft>(filterDraft);

  const buildQueryOptions = (filters: FilterDraft) => ({
    ...(filters.approval === "approved" ? { isApproved: true } : {}),
    ...(filters.approval === "pending" ? { isApproved: false } : {}),
    ...(filters.search.trim().length > 0
      ? { search: filters.search.trim() }
      : {}),
    ...(filters.theme.trim().length > 0
      ? { themes: [filters.theme.trim()] }
      : {}),
    ...(filters.difficulty.trim().length > 0
      ? { difficulties: [filters.difficulty.trim()] }
      : {}),
  });

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated || !user) {
      setQuestions([]);
      return;
    }

    let isMounted = true;

    const loadQuestions = async () => {
      setIsLoadingQuestions(true);
      setErrorMessage("");
      setActionMessage("");

      try {
        const response = await getUserQuestions(
          user.id,
          buildQueryOptions(activeFilters),
        );

        if (!isMounted) {
          return;
        }

        setQuestions(response.questions);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setQuestions([]);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Kunde inte hämta dina frågor just nu.",
        );
      } finally {
        if (isMounted) {
          setIsLoadingQuestions(false);
        }
      }
    };

    void loadQuestions();

    return () => {
      isMounted = false;
    };
  }, [activeFilters, isAuthenticated, isAuthLoading, user]);

  const submitFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActiveFilters(filterDraft);
  };

  const resetFilters = () => {
    const clearedFilters: FilterDraft = {
      approval: "all",
      search: "",
      theme: "",
      difficulty: "",
    };

    setFilterDraft(clearedFilters);
    setActiveFilters(clearedFilters);
  };

  if (isAuthLoading || isLoadingQuestions) {
    return <p className={styles.status}>Laddar dina frågor...</p>;
  }

  if (!isAuthenticated || !user) {
    return (
      <p className={styles.status}>
        Du måste vara inloggad för att se dina frågor.
      </p>
    );
  }

  if (errorMessage) {
    return (
      <p className={styles.statusError} role="alert">
        {errorMessage}
      </p>
    );
  }

  if (questions.length === 0) {
    return (
      <p className={styles.status}>Du har inte skapat några frågor ännu.</p>
    );
  }

  const totalQuestions = questions.length;
  const approvedQuestions = questions.filter(
    (question) => question.isApproved,
  ).length;
  const pendingQuestions = totalQuestions - approvedQuestions;

  const startEdit = (question: Question) => {
    setEditingQuestionId(question.id);
    setEditForm({
      question: question.question,
      id: question.id,
      answer: question.answer,
      questionType: question.questionType,
      themes: question.themes,
      difficulty: question.difficulty,
      createdBy: question.createdBy,
      createdWhen: question.createdWhen,
    });
    setActionMessage("");
    setErrorMessage("");
  };

  const cancelEdit = () => {
    setEditingQuestionId(null);
    setEditForm(null);
  };

  const handleEditFieldChange = <K extends keyof PostQuestionRequest>(
    field: K,
    value: PostQuestionRequest[K],
  ) => {
    if (!editForm) {
      return;
    }

    setEditForm({ ...editForm, [field]: value });
  };

  const saveEditedQuestion = async (questionId: number) => {
    if (!editForm) {
      return;
    }

    setIsSavingQuestionId(questionId);
    setErrorMessage("");
    setActionMessage("");

    try {
      console.log("edit form: ", editForm);
      await updateQuestion(questionId, editForm);
      setActionMessage("Frågan har uppdaterats.");
      setEditingQuestionId(null);
      setEditForm(null);

      const refreshed = await getUserQuestions(
        user!.id,
        buildQueryOptions(activeFilters),
      );
      setQuestions(refreshed.questions);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Kunde inte uppdatera frågan.",
      );
    } finally {
      setIsSavingQuestionId(null);
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    const shouldDelete = window.confirm(
      "Är du säker på att du vill ta bort den här frågan?",
    );

    if (!shouldDelete) {
      return;
    }

    setIsDeletingQuestionId(questionId);
    setErrorMessage("");
    setActionMessage("");

    try {
      await deleteQuestion(questionId);
      setActionMessage("Frågan har tagits bort.");
      const refreshed = await getUserQuestions(
        user!.id,
        buildQueryOptions(activeFilters),
      );
      setQuestions(refreshed.questions);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Kunde inte ta bort frågan.",
      );
    } finally {
      setIsDeletingQuestionId(null);
    }
  };

  return (
    <div className={styles.wrapper}>
      <h3>Mina frågor</h3>
      <section
        className={styles.stats}
        aria-label="Sammanfattning av dina frågor"
      >
        <article className={styles.statCard}>
          <span className={styles.statLabel}>Totalt</span>
          <strong className={styles.statValue}>{totalQuestions}</strong>
        </article>
        <article className={styles.statCard}>
          <span className={styles.statLabel}>Godkända</span>
          <strong className={styles.statValue}>{approvedQuestions}</strong>
        </article>
        <article className={styles.statCard}>
          <span className={styles.statLabel}>Väntar</span>
          <strong className={styles.statValue}>{pendingQuestions}</strong>
        </article>
      </section>

      <form className={styles.filters} onSubmit={submitFilters}>
        <div className={styles.filterRow}>
          <label className={styles.filterLabel} htmlFor="approval-filter">
            Status
          </label>
          <select
            id="approval-filter"
            className={styles.filterInput}
            value={filterDraft.approval}
            onChange={(event) =>
              setFilterDraft((current) => ({
                ...current,
                approval: event.currentTarget.value as ApprovalFilter,
              }))
            }
          >
            <option value="all">Alla</option>
            <option value="approved">Godkända</option>
            <option value="pending">Väntar på godkännande</option>
          </select>
        </div>

        <div className={styles.filterRow}>
          <label className={styles.filterLabel} htmlFor="search-filter">
            Sök
          </label>
          <input
            id="search-filter"
            className={styles.filterInput}
            value={filterDraft.search}
            onChange={(event) =>
              setFilterDraft((current) => ({
                ...current,
                search: event.currentTarget.value,
              }))
            }
            placeholder="Sök i fråga eller svar"
          />
        </div>

        <div className={styles.filterRow}>
          <label className={styles.filterLabel} htmlFor="theme-filter">
            Tema
          </label>
          <input
            id="theme-filter"
            className={styles.filterInput}
            value={filterDraft.theme}
            onChange={(event) =>
              setFilterDraft((current) => ({
                ...current,
                theme: event.currentTarget.value,
              }))
            }
            placeholder="Filtrera på tema"
          />
        </div>

        <div className={styles.filterRow}>
          <label className={styles.filterLabel} htmlFor="difficulty-filter">
            Svårighetsgrad
          </label>
          <input
            id="difficulty-filter"
            className={styles.filterInput}
            value={filterDraft.difficulty}
            onChange={(event) =>
              setFilterDraft((current) => ({
                ...current,
                difficulty: event.currentTarget.value,
              }))
            }
            placeholder="Filtrera på svårighetsgrad"
          />
        </div>

        <div className={styles.filterActions}>
          <button type="submit" className={styles.saveButton}>
            Tillämpa filter
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={resetFilters}
          >
            Rensa filter
          </button>
        </div>
      </form>

      {actionMessage && (
        <p className={styles.status} role="status">
          {actionMessage}
        </p>
      )}

      {questions.map((question) => (
        <article key={question.id} className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.questionTitle}>{question.question}</h3>
            <span
              className={`${styles.badge} ${
                question.isApproved ? styles.approved : styles.pending
              }`}
            >
              {question.isApproved ? "Godkänd" : "Väntar på godkännande"}
            </span>
          </div>

          <dl className={styles.metaList}>
            <div className={styles.metaRow}>
              <dt className={styles.metaLabel}>Tema</dt>
              <dd className={styles.metaValue}>{question.themes.join(", ")}</dd>
            </div>
            <div className={styles.metaRow}>
              <dt className={styles.metaLabel}>Svårighetsgrad</dt>
              <dd className={styles.metaValue}>{question.difficulty}</dd>
            </div>
            <div className={styles.metaRow}>
              <dt className={styles.metaLabel}>Skapad</dt>
              <dd className={styles.metaValue}>
                {new Date(question.createdWhen).toLocaleDateString("sv-SE")}
              </dd>
            </div>
          </dl>

          {editingQuestionId === question.id && editForm ? (
            <div className={styles.editForm}>
              <label
                className={styles.editLabel}
                htmlFor={`question-${question.id}`}
              >
                Fråga
              </label>
              <input
                id={`question-${question.id}`}
                className={styles.editInput}
                value={editForm.question}
                onChange={(event) =>
                  handleEditFieldChange("question", event.currentTarget.value)
                }
              />

              <label
                className={styles.editLabel}
                htmlFor={`answer-${question.id}`}
              >
                Svar
              </label>
              <textarea
                id={`answer-${question.id}`}
                className={styles.editTextarea}
                value={editForm.answer}
                onChange={(event) =>
                  handleEditFieldChange("answer", event.currentTarget.value)
                }
              />

              <label
                className={styles.editLabel}
                htmlFor={`difficulty-${question.id}`}
              >
                Svårighetsgrad
              </label>
              <input
                id={`difficulty-${question.id}`}
                className={styles.editInput}
                value={editForm.difficulty}
                onChange={(event) =>
                  handleEditFieldChange("difficulty", event.currentTarget.value)
                }
              />

              <label
                className={styles.editLabel}
                htmlFor={`themes-${question.id}`}
              >
                Teman (komma-separerade)
              </label>
              <input
                id={`themes-${question.id}`}
                className={styles.editInput}
                value={editForm.themes.join(", ")}
                onChange={(event) =>
                  handleEditFieldChange(
                    "themes",
                    event.currentTarget.value
                      .split(",")
                      .map((theme) => theme.trim())
                      .filter((theme) => theme.length > 0),
                  )
                }
              />

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.saveButton}
                  onClick={() => saveEditedQuestion(question.id)}
                  disabled={isSavingQuestionId === question.id}
                >
                  {isSavingQuestionId === question.id ? "Sparar..." : "Spara"}
                </button>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={cancelEdit}
                  disabled={isSavingQuestionId === question.id}
                >
                  Avbryt
                </button>
              </div>
            </div>
          ) : null}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => startEdit(question)}
              disabled={isDeletingQuestionId === question.id}
            >
              Redigera
            </button>
            <button
              type="button"
              className={styles.dangerButton}
              onClick={() => handleDeleteQuestion(question.id)}
              disabled={isDeletingQuestionId === question.id}
            >
              {isDeletingQuestionId === question.id ? "Tar bort..." : "Ta bort"}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
};

export default ContributionsList;
