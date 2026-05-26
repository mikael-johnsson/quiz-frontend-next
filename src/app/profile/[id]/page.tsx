"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PasswordChangeForm from "@/app/profile/[id]/components/profileSettings/passwordChangeForm";
import styles from "./page.module.css";
import ContributionsList from "@/app/profile/[id]/components/profile/contributionsList";
import ProfileSkeleton from "@/skeletons/profileSkeleton/profileSkeleton";
import QuizList from "@/components/quizList/quizList";
import type { SavedQuiz } from "@/models/types";
import { getQuizPreviews } from "@/services/quizService";

/**
 * ProfilePage - Displays the authenticated user's personal profile dashboard.
 * This component fetches user data from the AuthContext and displays
 * profile information along with settings and preferences.
 */
const ProfilePage = () => {
  const { user, isLoading } = useAuth();
  const [quizzes, setQuizzes] = useState<SavedQuiz[]>([]);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false);

  useEffect(() => {
    if (!user) {
      setQuizzes([]);
      setIsLoadingQuizzes(false);
      return;
    }

    let isMounted = true;

    const loadQuizzes = async () => {
      setIsLoadingQuizzes(true);

      try {
        const fetchedQuizzes = await getQuizPreviews({ createdBy: user.id });

        if (isMounted) {
          setQuizzes(fetchedQuizzes);
        }
      } finally {
        if (isMounted) {
          setIsLoadingQuizzes(false);
        }
      }
    };

    void loadQuizzes();

    return () => {
      isMounted = false;
    };
  }, [user]);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

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

      <QuizList
        title="Mina quiz"
        emptyStateText="Du har inte skapat några quiz ännu."
        quizzes={quizzes}
        isLoading={isLoadingQuizzes}
      />
    </main>
  );
};

export default ProfilePage;
