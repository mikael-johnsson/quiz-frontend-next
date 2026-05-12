"use client";

import { useState, type FormEvent } from "react";
import { changePassword } from "@/services/authService";
import styles from "./passwordChangeForm.module.css";

type PasswordChangeFormProps = {
  email: string;
};

/**
 * PasswordChangeForm - A form component that allows users to change their password.
 * Collects current password, new password, and password confirmation from the user.
 */
const PasswordChangeForm = ({ email }: PasswordChangeFormProps) => {
  // State for form input values
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  /**
   * Handles form submission.
   * Validates the form before any future API call is made.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    const nextErrors = {
      currentPassword: currentPassword.trim()
        ? ""
        : "Nuvarande lösenord krävs.",
      newPassword:
        newPassword.trim().length === 0
          ? "Nytt lösenord krävs."
          : newPassword.length < 8
            ? "Nytt lösenord måste vara minst 8 tecken."
            : "",
      confirmPassword:
        confirmPassword.trim().length === 0
          ? "Bekräfta ditt nya lösenord."
          : confirmPassword !== newPassword
            ? "Lösenorden matchar inte."
            : "",
    };

    setErrors(nextErrors);

    const hasErrors = Object.values(nextErrors).some(Boolean);

    if (hasErrors) {
      return;
    }

    setIsSubmitting(true);

    try {
      await changePassword({
        email,
        currentPassword,
        newPassword,
      });

      setSubmitSuccess("Lösenordet har uppdaterats.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Ett oväntat fel uppstod när lösenordet skulle ändras.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCurrentPasswordChange = (value: string) => {
    setCurrentPassword(value);

    if (errors.currentPassword) {
      setErrors((previousErrors) => ({
        ...previousErrors,
        currentPassword: "",
      }));
    }
  };

  const handleNewPasswordChange = (value: string) => {
    setNewPassword(value);

    setErrors((previousErrors) => ({
      ...previousErrors,
      newPassword: "",
      confirmPassword:
        previousErrors.confirmPassword && value === confirmPassword
          ? ""
          : previousErrors.confirmPassword,
    }));
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);

    if (errors.confirmPassword) {
      setErrors((previousErrors) => ({
        ...previousErrors,
        confirmPassword: "",
      }));
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {submitError && (
        <p className={styles.submitError} role="alert">
          {submitError}
        </p>
      )}

      {submitSuccess && (
        <p className={styles.submitSuccess} role="status">
          {submitSuccess}
        </p>
      )}

      <div className={styles.formGroup}>
        <label htmlFor="currentPassword" className={styles.label}>
          Nuvarande lösenord
        </label>
        <input
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(e) => handleCurrentPasswordChange(e.target.value)}
          className={`${styles.input} ${errors.currentPassword ? styles.inputError : ""}`}
          placeholder="Ange ditt nuvarande lösenord"
          aria-invalid={Boolean(errors.currentPassword)}
          aria-describedby={
            errors.currentPassword ? "currentPassword-error" : undefined
          }
        />
        {errors.currentPassword && (
          <p id="currentPassword-error" className={styles.errorText}>
            {errors.currentPassword}
          </p>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="newPassword" className={styles.label}>
          Nytt lösenord
        </label>
        <input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => handleNewPasswordChange(e.target.value)}
          className={`${styles.input} ${errors.newPassword ? styles.inputError : ""}`}
          placeholder="Ange ditt nya lösenord"
          aria-invalid={Boolean(errors.newPassword)}
          aria-describedby={
            errors.newPassword ? "newPassword-error" : undefined
          }
        />
        {errors.newPassword && (
          <p id="newPassword-error" className={styles.errorText}>
            {errors.newPassword}
          </p>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="confirmPassword" className={styles.label}>
          Bekräfta nytt lösenord
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => handleConfirmPasswordChange(e.target.value)}
          className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ""}`}
          placeholder="Bekräfta ditt nya lösenord"
          aria-invalid={Boolean(errors.confirmPassword)}
          aria-describedby={
            errors.confirmPassword ? "confirmPassword-error" : undefined
          }
        />
        {errors.confirmPassword && (
          <p id="confirmPassword-error" className={styles.errorText}>
            {errors.confirmPassword}
          </p>
        )}
      </div>

      <button type="submit" className={styles.button} disabled={isSubmitting}>
        {isSubmitting ? "Ändrar lösenord..." : "Ändra lösenord"}
      </button>
    </form>
  );
};

export default PasswordChangeForm;
