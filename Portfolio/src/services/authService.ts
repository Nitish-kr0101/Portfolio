import axios from "axios";
import { api, saveTokens, clearTokens } from "@/lib/api";
import type { AuthResponse, UserProfile } from "@/types";

const USER_KEY = "niveshtrack_user";

const toUserProfile = (r: AuthResponse): UserProfile => ({
  userId: r.userId,
  name: r.name,
  email: r.email,
  currency: r.currency,
  darkMode: r.darkMode,
});

export const authService = {
  login: async (email: string, password: string): Promise<{ user: UserProfile }> => {
    const { data } = await axios.post<AuthResponse>("http://localhost:8081/api/auth/login", {
      email,
      password,
    });
    saveTokens(data.accessToken, data.refreshToken);
    const user = toUserProfile(data);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return { user };
  },

  register: async (name: string, email: string, password: string): Promise<{ user: UserProfile }> => {
    const { data } = await axios.post<AuthResponse>("http://localhost:8081/api/auth/register", {
      name,
      email,
      password,
    });
    saveTokens(data.accessToken, data.refreshToken);
    const user = toUserProfile(data);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return { user };
  },

  logout: () => {
    clearTokens();
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("niveshtrack_access_token");
  },

  getUser: (): UserProfile | null => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  updateProfile: async (profile: Partial<UserProfile>): Promise<UserProfile> => {
    const { data } = await api.put<AuthResponse>("/api/user/profile", profile);
    const updated = toUserProfile(data);
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    return updated;
  },

  getProfile: async (): Promise<UserProfile> => {
    const { data } = await api.get<AuthResponse>("/api/user/profile");
    return toUserProfile(data);
  },
};
