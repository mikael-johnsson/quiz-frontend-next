"use client";

import Link from "next/link";
import styles from "./header.module.css";
import MenuButton from "./components/menuButton";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  return (
    <header className={styles.header}>
      <h2>Quiz-a-nator</h2>
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
