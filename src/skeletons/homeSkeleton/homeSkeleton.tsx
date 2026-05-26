import styles from "./homeSkeleton.module.css";

const HomeSkeleton = () => {
  return (
    <main className={styles.main} aria-busy="true" aria-live="polite">
      <div className={styles.leftColumn} aria-hidden="true">
        <div className={`${styles.bannerSkeleton} ${styles.skeleton}`} />

        <section className={styles.asideSkeleton}>
          <div className={`${styles.asideTitleSkeleton} ${styles.skeleton}`} />
          <div className={`${styles.asideTextSkeleton} ${styles.skeleton}`} />
          <div className={`${styles.asideTextSkeleton} ${styles.skeleton}`} />
          <div
            className={`${styles.asideTextShortSkeleton} ${styles.skeleton}`}
          />
        </section>

        <div className={`${styles.gateSkeleton} ${styles.skeleton}`} />
      </div>

      <div className={styles.rightColumn} aria-hidden="true">
        <div className={`${styles.headingSkeleton} ${styles.skeleton}`} />

        <div className={styles.formSkeleton}>
          <section className={styles.formCard}>
            <div className={`${styles.formTitleSkeleton} ${styles.skeleton}`} />
            <div className={`${styles.fieldSkeleton} ${styles.skeleton}`} />
          </section>

          <section className={styles.formCard}>
            <div className={`${styles.formTitleSkeleton} ${styles.skeleton}`} />
            <div
              className={`${styles.fieldLabelSkeleton} ${styles.skeleton}`}
            />
            <div className={`${styles.fieldSkeleton} ${styles.skeleton}`} />
          </section>

          <section className={styles.formCard}>
            <div className={`${styles.formTitleSkeleton} ${styles.skeleton}`} />
            <div className={`${styles.fieldSkeleton} ${styles.skeleton}`} />
            <div className={`${styles.fieldSkeleton} ${styles.skeleton}`} />
            <div className={`${styles.fieldSkeleton} ${styles.skeleton}`} />
          </section>

          <div className={`${styles.buttonSkeleton} ${styles.skeleton}`} />
        </div>

        <div className={styles.listSkeleton}>
          <div className={`${styles.listHeaderSkeleton} ${styles.skeleton}`} />
          <div className={`${styles.listCardSkeleton} ${styles.skeleton}`} />
          <div className={`${styles.listCardSkeleton} ${styles.skeleton}`} />
        </div>
      </div>
    </main>
  );
};

export default HomeSkeleton;
