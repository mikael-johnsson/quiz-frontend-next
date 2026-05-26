import styles from "./page.module.css";

export default function Loading() {
  return (
    <main className={styles.container} aria-busy="true" aria-live="polite">
      <section className={styles.card} aria-hidden="true">
        <div className={`${styles.labelSkeleton} ${styles.skeleton}`} />
        <div className={`${styles.headingSkeleton} ${styles.skeleton}`} />
        <div className={`${styles.savesSkeleton} ${styles.skeleton}`} />

        <div className={styles.questionsSection}>
          <div
            className={`${styles.sectionHeadingSkeleton} ${styles.skeleton}`}
          />

          <ol className={styles.questionList}>
            <li
              className={`${styles.questionItemSkeleton} ${styles.skeleton}`}
            />
            <li
              className={`${styles.questionItemSkeleton} ${styles.skeleton}`}
            />
            <li
              className={`${styles.questionItemSkeleton} ${styles.skeleton}`}
            />
          </ol>
        </div>
      </section>
    </main>
  );
}
