import styles from "./landingAside.module.css";

const LandingAside = () => {
  return (
    <aside className={styles.aside}>
      <h2 className={styles.heading}>Hur fungerar det?</h2>
      <p className={styles.text}>
        Välj dina teman, välj dina svårighetsgrader och generera ditt quiz! Alla
        frågor är faktakollade av riktiga användare.
      </p>
    </aside>
  );
};

export default LandingAside;
