"use client";

import * as React from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

interface UserProfile {
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

const defaultProfile: UserProfile = {
  id: "student-local-demo",
  email: "student@miru.study",
  fullName: "Aoi Takahashi",
  academicRole: "Undergraduate Student",
  institution: "Faculty of Computer Science",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
};

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  profile: defaultProfile,
  isLoading: false,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(defaultProfile);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Check active session if Supabase is properly configured
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          setProfile({
            id: session.user.id,
            email: session.user.email || "student@miru.study",
            fullName: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Miru Scholar",
            academicRole: "Student",
            avatarUrl: session.user.user_metadata?.avatar_url,
          });
        } else {
          // In local workspace development without cloud secrets, use local wabi-sabi demo profile
          setProfile(defaultProfile);
        }
      } catch (e) {
        setProfile(defaultProfile);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setProfile({
          id: session.user.id,
          email: session.user.email || "student@miru.study",
          fullName: session.user.user_metadata?.full_name || "Miru Scholar",
          academicRole: "Student",
          avatarUrl: session.user.user_metadata?.avatar_url,
        });
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

