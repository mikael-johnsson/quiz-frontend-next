"use client";

import Link from "next/link";
import styles from "./header.module.css";
import MenuButton from "./components/menuButton/menuButton";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import QuestionModal from "./components/questionModal/questionModal";
import { useRouter } from "next/navigation";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, isLoading, isAuthenticated, logoutAction } = useAuth();
  const router = useRouter();
  const menuId = "hamburgerMenu";

  const handleMenuToggle = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logoutAction();
    } finally {
      setIsLoggingOut(false);
      router.push("/");
    }
  };

  const openQuestionModal = () => {
    setIsModalOpen(true);
  };

  const closeQuestionModal = () => {
    setIsModalOpen(false);
  };

  return (
    <header className={styles.header}>
      <Link href="/">
        <h2>Quiz-a-nator</h2>
      </Link>

      <div className={styles.authActions}>
        {!isLoading && !isAuthenticated && (
          <>
            <Link href="/login" className={styles.authLink}>
              Logga in
            </Link>
            <Link href="/signup" className={styles.authLink}>
              Skapa konto
            </Link>
          </>
        )}
        {!isLoading && isAuthenticated && user && (
          <span className={styles.userName}>
            Inloggad som: {user?.firstname}
          </span>
        )}
        {!isLoading && isAuthenticated && user && (
          <Link href={`/profile/${user.id}`} className={styles.authLink}>
            Min sida
          </Link>
        )}
        {!isLoading && isAuthenticated && (
          <>
            <button
              type="button"
              className={styles.logoutButton}
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "Loggar ut..." : "Logga ut"}
            </button>
          </>
        )}
        {!isLoading && isAuthenticated && (
          <>
            <button
              type="button"
              className={styles.logoutButton}
              onClick={openQuestionModal}
            >
              Skapa fråga
            </button>
          </>
        )}
      </div>
      {isAuthenticated && (
        <QuestionModal isOpen={isModalOpen} onClose={closeQuestionModal} />
      )}
      <MenuButton
        onToggle={handleMenuToggle}
        isOpen={isMenuOpen}
        controlsId={menuId}
      />
    </header>
  );
};

export default Header;
