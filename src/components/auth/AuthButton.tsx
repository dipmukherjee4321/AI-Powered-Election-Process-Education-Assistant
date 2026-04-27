"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LogIn, LogOut, Loader2 } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export default function AuthButton() {
  const router = useRouter();
  const { user, loading, profile } = useAuth();

  const handleSignInClick = () => {
    router.push("/login");
  };

  const handleSignOut = async () => {
    try {
      localStorage.removeItem("demo_session");
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  if (loading) {
    return <Loader2 className="w-5 h-5 animate-spin text-primary" />;
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-sm font-bold truncate max-w-[120px]">{profile?.displayName || user.email?.split("@")[0]}</span>
          <span className="text-[10px] text-foreground/50 uppercase tracking-wider font-bold">Learner</span>
        </div>
        {user.photoURL ? (
          <img src={user.photoURL} alt="Profile" className="w-9 h-9 rounded-full border-2 border-primary/20 p-0.5 shadow-sm" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold border-2 border-primary/10 shadow-sm">
            {user.email?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="flex items-center justify-center h-9 w-9 md:w-auto md:px-3 text-sm font-medium bg-surface hover:bg-surface-dark/5 rounded-lg border border-surface-dark/10 transition-colors"
          title="Sign Out"
        >
          <LogOut size={16} /> <span className="hidden md:inline ml-2">Sign Out</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignInClick}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-white hover:bg-primary-dark rounded-lg shadow-sm transition-colors"
    >
      <LogIn size={16} /> Sign In
    </button>
  );
}
