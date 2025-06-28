import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Usuario } from "@/types/database";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: Usuario | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  // Referencias para evitar múltiples llamadas
  const profileFetchedRef = useRef(false);
  const fetchingProfileRef = useRef(false);
  const mountedRef = useRef(true);

  const fetchUserProfile = useCallback(
    async (userId: string) => {
      // Evitar múltiples llamadas simultáneas
      if (fetchingProfileRef.current) {
        console.log("Profile fetch already in progress, skipping...");
        return;
      }

      // Si ya se obtuvo el perfil para este usuario, no volver a obtenerlo
      if (profileFetchedRef.current && userProfile?.id === userId) {
        console.log("Profile already fetched for this user, skipping...");
        return;
      }

      try {
        fetchingProfileRef.current = true;
        console.log("Fetching user profile for:", userId);

        const { data, error } = await supabase
          .from("usuarios")
          .select("*")
          .eq("id", userId)
          .single();

        if (!mountedRef.current) return;

        if (error) {
          console.error("Error fetching user profile:", error);
          setUserProfile(null);
          profileFetchedRef.current = false;
          return;
        }

        console.log("User profile loaded:", data);
        setUserProfile(data as Usuario);
        profileFetchedRef.current = true;
      } catch (error) {
        console.error("Error in fetchUserProfile:", error);
        if (mountedRef.current) {
          setUserProfile(null);
          profileFetchedRef.current = false;
        }
      } finally {
        fetchingProfileRef.current = false;
      }
    },
    [userProfile?.id]
  );

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      profileFetchedRef.current = false; // Forzar refresh
      await fetchUserProfile(user.id);
    }
  }, [user?.id, fetchUserProfile]);

  const refreshUserProfile = useCallback(async () => {
    if (user?.id) {
      profileFetchedRef.current = false; // Forzar refresh
      await fetchUserProfile(user.id);
    }
  }, [user?.id, fetchUserProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("SignIn error:", error);
        if (error.message.includes("Invalid login credentials")) {
          toast.error(
            "Credenciales incorrectas. Verifica tu email y contraseña."
          );
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("Por favor confirma tu email antes de iniciar sesión.");
        } else {
          toast.error(`Error al iniciar sesión: ${error.message}`);
        }
        throw error;
      }

      if (data.user) {
        toast.success("¡Bienvenido!");
      }
    } catch (error) {
      console.error("Error in signIn:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();

      // Limpiar estado
      setUser(null);
      setSession(null);
      setUserProfile(null);
      profileFetchedRef.current = false;

      toast.success("Sesión cerrada correctamente");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Error al cerrar sesión");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    mountedRef.current = true;

    // Configurar listener de auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("Auth state changed:", event, !!session);

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Solo obtener perfil en eventos significativos, no en TOKEN_REFRESHED
        if (event !== "TOKEN_REFRESHED") {
          // Resetear flag si es un nuevo usuario
          if (!userProfile || userProfile.id !== session.user.id) {
            profileFetchedRef.current = false;
          }

          // Defer para evitar deadlocks
          setTimeout(() => {
            if (mounted && !profileFetchedRef.current) {
              fetchUserProfile(session.user.id);
            }
          }, 100);
        }
      } else {
        // Usuario desconectado
        setUserProfile(null);
        profileFetchedRef.current = false;
      }

      setLoading(false);
    });

    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error("Error getting session:", error);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user && !profileFetchedRef.current) {
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error("Error in getInitialSession:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []); // Solo ejecutar una vez al montar

  const value: AuthContextType = {
    user,
    session,
    userProfile,
    loading,
    signIn,
    signOut,
    refreshProfile,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
