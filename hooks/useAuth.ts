import { useAuthContext } from "@/context/AuthContext";
import type { User, LoginForm } from "@/lib/types";

export interface UseAuthReturn {
  user:    User | null;
  loading: boolean;
  login:   (form: LoginForm) => Promise<void>;
  logout:  () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  return useAuthContext();
}
