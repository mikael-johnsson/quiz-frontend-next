"use client";

import { useAuth } from "@/contexts/AuthContext";
import NotApprovedFeed from "./notApprovedFeed";

const NotApprovedFeedGate = () => {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return <NotApprovedFeed />;
};

export default NotApprovedFeedGate;
