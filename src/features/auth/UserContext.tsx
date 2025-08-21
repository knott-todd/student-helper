import React, { createContext, useContext } from "react";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

export interface User {
  user_id: string;
  isGuest: boolean;
}

interface UserContextValue {
  user: User | undefined;
  loading: boolean;
  error: string | null;
  refetchUser: () => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

async function fetchOrCreateUser(): Promise<User> {

  
  // First check if Better Auth has a session
  const { data, error } = await authClient.getSession();

  if (error) {
    throw error;
  }

  if (data?.user) {

    return {
      user_id: data.user.id,
      isGuest: false,
    } as User;
  }

  // Guest user logic
  // 1. Try localStorage first
  const stored = localStorage.getItem("guest_user");
  if (stored) {
    return JSON.parse(stored) as User;
  }

  // 2. If not found, create guest
  const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/user/create_guest`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to create guest");

  const guest = await res.json();
  const newUser: User = {
    user_id: guest.id,
    isGuest: true,
  };

  localStorage.setItem("guest_user", JSON.stringify(newUser));
  return newUser;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isError, error, refetch }: UseQueryResult<User, Error> =
    useQuery<User, Error>({
      queryKey: ["user"],
      queryFn: fetchOrCreateUser,
      staleTime: Infinity, // only fetch when explicitly refetched
    });

  const value: UserContextValue = {
    user: data,
    loading: isLoading,
    error: isError ? error?.message ?? "Unknown error" : null,
    refetchUser: () => { void refetch(); },
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
