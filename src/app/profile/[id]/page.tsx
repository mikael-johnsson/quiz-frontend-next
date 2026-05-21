"use client";

import { useAuth } from "@/contexts/AuthContext";
import PasswordChangeForm from "@/app/profile/[id]/components/profileSettings/passwordChangeForm";
import styles from "./page.module.css";
import ContributionsList from "@/app/profile/[id]/components/profile/contributionsList";

/**
 * ProfilePage - Displays the authenticated user's personal profile dashboard.
 * This component fetches user data from the AuthContext and displays
 * profile information along with settings and preferences.
 */
const ProfilePage = () => {
  const { user, isLoading } = useAuth();

  // Show loading state while auth data is being fetched
  if (isLoading) {
    return <div className={styles.container}>Läser in...</div>;
  }

  // If user is not authenticated, show message (in real app, would redirect to login)
  if (!user) {
    return <div className={styles.container}>Du är inte inloggad</div>;
  }

  return (
    <main className={styles.container}>
      <h1 className={styles.heading}>Min profil</h1>

      {/* User Information Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Profilinformation</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoRow}>
            <label className={styles.label}>Namn:</label>
            <span className={styles.value}>{user.firstname}</span>
          </div>
          <div className={styles.infoRow}>
            <label className={styles.label}>E-post:</label>
            <span className={styles.value}>{user.email}</span>
          </div>
        </div>
      </section>

      {/* Password Change Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Ändra lösenord</h2>
        <PasswordChangeForm email={user.email} />
      </section>

      {/* Contribution stats */}
      <ContributionsList />
    </main>
  );
};

export default ProfilePage;
