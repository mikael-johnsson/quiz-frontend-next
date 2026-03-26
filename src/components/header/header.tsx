"use client";

import Link from "next/link";
import styles from "./header.module.css";
import MenuButton from "./components/menuButton";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, isLoading, isAuthenticated, logoutAction } = useAuth();
  const menuId = "hamburgerMenu";

  const navClassName = [
    styles.menu,
    isMenuOpen ? styles.menuOpen : styles.hidden,
  ]
    .filter(Boolean)
    .join(" ");

  const handleMenuToggle = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logoutAction();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className={styles.header}>
      <h2>Quiz-a-nator</h2>
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
        {!isLoading && isAuthenticated && (
          <>
            <span className={styles.userName}>{user?.firstname}</span>
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
      </div>
      <MenuButton
        onToggle={handleMenuToggle}
        isOpen={isMenuOpen}
        controlsId={menuId}
      />
      {/* Not showing since not used
      <nav id={menuId} className={navClassName}>
        <ul className={styles.menuList}>
          <li>
            <Link href="/">HEM</Link>
          </li>
          <li>
            <Link href="/">PROFIL</Link>
          </li>
          <li>
            <Link href="/">SKAPA FRÅGA</Link>
          </li>
          <li>
            <Link href="/">OM SIDAN</Link>
          </li>
          <li>
            <Link href="/auth">LOGGA IN / SKAPA KONTO</Link>
          </li>
        </ul>
      </nav> */}
    </header>
  );
};

export default Header;
