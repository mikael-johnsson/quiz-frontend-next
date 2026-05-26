import styles from "./profileSkeleton.module.css";

const ProfileSkeleton = () => {
  return (
    <main className={styles.container} aria-busy="true" aria-live="polite">
      <div className={`${styles.headingSkeleton} ${styles.skeleton}`} />

      <section className={styles.section} aria-hidden="true">
        <div className={`${styles.sectionTitleSkeleton} ${styles.skeleton}`} />

        <div className={styles.infoGrid}>
          <div className={styles.infoRow}>
            <div className={`${styles.labelSkeleton} ${styles.skeleton}`} />
            <div className={`${styles.valueSkeleton} ${styles.skeleton}`} />
          </div>

          <div className={styles.infoRow}>
            <div className={`${styles.labelSkeleton} ${styles.skeleton}`} />
            <div className={`${styles.valueSkeleton} ${styles.skeleton}`} />
          </div>
        </div>
      </section>

      <section className={styles.section} aria-hidden="true">
        <div className={`${styles.sectionTitleSkeleton} ${styles.skeleton}`} />
        <div className={`${styles.buttonSkeleton} ${styles.skeleton}`} />
      </section>

      <section className={styles.section} aria-hidden="true">
        <div className={`${styles.sectionTitleSkeleton} ${styles.skeleton}`} />

        <div className={styles.statsList}>
          <article className={styles.statCard}>
            <div className={`${styles.statTitleSkeleton} ${styles.skeleton}`} />
            <div className={`${styles.statValueSkeleton} ${styles.skeleton}`} />
          </article>

          <article className={styles.statCard}>
            <div className={`${styles.statTitleSkeleton} ${styles.skeleton}`} />
            <div className={`${styles.statValueSkeleton} ${styles.skeleton}`} />
          </article>
        </div>
      </section>
    </main>
  );
};

export default ProfileSkeleton;
