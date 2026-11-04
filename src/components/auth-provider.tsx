"use client";

import * as React from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  academicRole: string;
  avatarUrl?: string;
  institution?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Fetch real profile from Supabase database
  const fetchProfile = async (currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (data && !error) {
        setProfile({
          id: data.id,
          email: data.email,
          fullName: data.full_name || currentUser.email?.split("@")[0] || "Student",
          academicRole: data.academic_role || "Student",
          avatarUrl: data.avatar_url,
          institution: data.institution,
        });
      } else {
        // Fallback to user metadata if profile row pending
        setProfile({
          id: currentUser.id,
          email: currentUser.email || "",
          fullName: currentUser.user_metadata?.full_name || currentUser.email?.split("@")[0] || "Student",
          academicRole: "Student",
          avatarUrl: currentUser.user_metadata?.avatar_url,
        });
      }
    } catch (e) {
      console.error("Profile fetch error:", e);
    }
  };

  React.useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (e) {
        console.error("Session check error:", e);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return React.useContext(AuthContext);
}
