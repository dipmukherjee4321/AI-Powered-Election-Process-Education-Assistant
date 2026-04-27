"use client";

import { useAuth } from "@/hooks/useAuth";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { LogIn, LogOut, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AuthButton() {
  const { user, loading, logout } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Signed in successfully!");
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "Failed to sign in");
    }
  };

  if (loading) {
    return <Loader2 className="w-5 h-5 animate-spin text-primary" />;
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        {user.photoURL ? (
          <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-surface-dark/20" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
            {user.email?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-surface hover:bg-surface-dark/5 rounded-lg border border-surface-dark/10 transition-all hover:border-red-500/30 hover:text-red-500"
        >
          <LogOut size={16} /> <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleGoogleSignIn}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white text-gray-900 hover:bg-gray-50 border border-gray-300 rounded-lg shadow-sm transition-all hover:scale-105"
    >
      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
      Sign In
    </button>
  );
}
