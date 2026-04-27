"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "@/lib/firebase";
import { signOut, onAuthStateChanged, User, signInWithPopup } from "firebase/auth";
import { LogIn, LogOut, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AuthButton() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (e) {
      setLoading(false);
    }
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      toast.success("Signed in successfully!");
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      localStorage.removeItem("demo_session");
      await signOut(auth);
      toast.success("Signed out");
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
        {user.photoURL ? (
          <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-surface-dark/20" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
            {user.email?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
        <button
          onClick={handleSignOut}
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
