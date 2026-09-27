import React, { createContext, useContext, useState, useEffect } from "react";
import { authService, initStorage } from "../services/storageService";
import { api } from "../services/apiService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Login Modal State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [pendingActionName, setPendingActionName] = useState("");

  const showToast = (message, type = "success") => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const refreshAllUsers = async () => {
    try {
      const apiUsers = await api.getUsers();
      if (Array.isArray(apiUsers) && apiUsers.length > 0) {
        setAllUsers(apiUsers);
        return;
      }
    } catch {}
    setAllUsers(authService.getAllUsers());
  };

  useEffect(() => {
    initStorage();
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    refreshAllUsers();
    setLoading(false);

    const handleDataChange = () => {
      refreshAllUsers();
      setUser(authService.getCurrentUser());
    };

    window.addEventListener("users-data-changed", handleDataChange);
    window.addEventListener("families-data-changed", handleDataChange);
    window.addEventListener("storage", handleDataChange);
    window.addEventListener("focus", handleDataChange);

    return () => {
      window.removeEventListener("users-data-changed", handleDataChange);
      window.removeEventListener("families-data-changed", handleDataChange);
      window.removeEventListener("storage", handleDataChange);
      window.removeEventListener("focus", handleDataChange);
    };
  }, []);

  const login = async (username, password) => {
    const cleanUser = (username || "").trim().toLowerCase();
    const cleanPass = String(password || "").trim();

    try {
      const res = await api.login(cleanUser, cleanPass);
      if (res && res.success && res.user) {
        setUser(res.user);
        authService.setCurrentUser(res.user);
        showToast(`Selamat datang kembali, ${res.user.name}!`, "success");
        if (pendingAction) {
          pendingAction(res.user);
          setPendingAction(null);
          setPendingActionName("");
        }
        return true;
      }

      // If server returned failure or user not found, attempt local storage
      const localRes = authService.login(cleanUser, cleanPass);
      if (localRes && localRes.success && localRes.user) {
        setUser(localRes.user);
        showToast(`Selamat datang kembali, ${localRes.user.name}!`, "success");
        if (pendingAction) {
          pendingAction(localRes.user);
          setPendingAction(null);
          setPendingActionName("");
        }
        return true;
      }

      showToast(res?.message || localRes?.message || "Username atau password salah. Silakan coba lagi.", "error");
      return false;
    } catch (err) {
      // Local fallback in case of network error
      const localRes = authService.login(cleanUser, cleanPass);
      if (localRes && localRes.success && localRes.user) {
        setUser(localRes.user);
        showToast(`Selamat datang, ${localRes.user.name}!`, "success");
        if (pendingAction) {
          pendingAction(localRes.user);
          setPendingAction(null);
          setPendingActionName("");
        }
        return true;
      }
      showToast(localRes?.message || "Username atau password salah.", "error");
      return false;
    }
  };

  const quickLogin = (userId) => {
    const target = allUsers.find(u => u.id === userId);
    if (target) {
      authService.setCurrentUser(target);
      setUser(target);
      showToast(`Login berhasil sebagai: ${target.name} (${target.role.toUpperCase()})`, "success");
      if (pendingAction) {
        pendingAction(target);
        setPendingAction(null);
        setPendingActionName("");
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    showToast("Anda telah keluar. Mode penjelajah tamu aktif.", "info");
  };

  // Require Auth guard: if logged in, executes action; if not, opens login modal!
  const requireAuth = (actionCallback, actionName = "Akses Fitur Ini") => {
    if (user) {
      actionCallback(user);
    } else {
      setPendingAction(() => actionCallback);
      setPendingActionName(actionName);
      setIsLoginModalOpen(true);
    }
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setPendingAction(null);
    setPendingActionName("");
  };

  const updateProfile = async ({ name, phone, avatar }) => {
    if (!user) return null;
    try {
      const updated = await api.updateProfile(user.id, { name, phone, avatar });
      if (updated) {
        setUser(updated);
        authService.setCurrentUser(updated);
        setAllUsers(allUsers.map(u => u.id === updated.id ? updated : u));
        showToast("Profil Anda berhasil diperbarui di database!", "success");
        return updated;
      }
    } catch {
      const updated = authService.updateUserProfile(user.id, { name, phone, avatar });
      if (updated) {
        setUser(updated);
        setAllUsers(authService.getAllUsers());
        showToast("Profil Anda berhasil diperbarui!", "success");
        return updated;
      }
    }
    return null;
  };

  const changePassword = async (oldPassword, newPassword) => {
    if (!user) return { success: false, message: "Silakan login terlebih dahulu" };
    try {
      const res = await api.changePassword(user.id, oldPassword, newPassword);
      if (res.success) {
        setUser(res.user);
        authService.setCurrentUser(res.user);
        setAllUsers(allUsers.map(u => u.id === res.user.id ? res.user : u));
        showToast("Password Anda berhasil diperbarui!", "success");
        return { success: true };
      }
    } catch {
      const res = authService.changePassword(user.id, oldPassword, newPassword);
      if (res.success) {
        setUser(res.user);
        setAllUsers(authService.getAllUsers());
        showToast("Password Anda berhasil diperbarui!", "success");
        return { success: true };
      } else {
        showToast(res.message || "Password lama salah.", "error");
        return { success: false, message: res.message };
      }
    }
  };

  const refreshUsers = async () => {
    try {
      const users = await api.getUsers();
      setAllUsers(users);
    } catch {
      setAllUsers(authService.getAllUsers());
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        allUsers,
        loading,
        toast,
        showToast,
        login,
        quickLogin,
        logout,
        requireAuth,
        isLoginModalOpen,
        closeLoginModal,
        pendingActionName,
        updateProfile,
        changePassword,
        refreshUsers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
