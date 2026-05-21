import styles from "./developmentbanner.module.css";

const DevelopmentBanner = () => {
  return (
    <div className={styles.container}>
      Den här sidan är fortfarande under utveckling. Vänligen bortse från
      bristande designkomposition och övrig styling.
    </div>
  );
};

export default DevelopmentBanner;
