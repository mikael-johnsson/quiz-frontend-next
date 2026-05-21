"use client";

import QuestionForm from "./components/questionForm";
import styles from "./questionModal.module.css";
import { useEffect } from "react";

type QuestionModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const QuestionModal = ({ isOpen, onClose }: QuestionModalProps) => {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // Some browsers scroll `html` instead of `body`, so lock both.
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleBackdropClick}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="question-modal-title"
      >
        <div className={styles.headerRow}>
          <h3 className={styles.title} id="question-modal-title">
            Skapa fråga
          </h3>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
          >
            Stäng
          </button>
        </div>

        <QuestionForm onCreated={onClose} />
      </div>
    </div>
  );
};

export default QuestionModal;
