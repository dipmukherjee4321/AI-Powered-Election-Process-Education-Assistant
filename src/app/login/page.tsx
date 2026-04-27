"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { googleProvider } from "@/lib/firebase";
import { Loader2, LogIn, Mail, Lock, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/>
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    // 🕒 Safety Timeout: If Firebase takes >3s to check auth, show the form anyway
    const safetyTimeout = setTimeout(() => {
      setCheckingAuth(false);
    }, 3000);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        clearTimeout(safetyTimeout);
        router.replace("/dashboard");
      } else {
        clearTimeout(safetyTimeout);
        setCheckingAuth(false);
      }
    });

    // 🔄 Handle Redirect Result if coming back from Google
    import("firebase/auth").then(({ getRedirectResult }) => {
      getRedirectResult(auth).catch((err) => {
        console.error("Redirect Result Error:", err);
        setCheckingAuth(false);
      });
    });

    return () => {
      unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, [router]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const toastId = toast.loading("Connecting to Google...");
    try {
      // Try Popup first (Better UX)
      await signInWithPopup(auth, googleProvider);
      toast.success("Signed in with Google!", { id: toastId });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      
      // Fallback for popups being blocked or internal-error in restricted environments
      if (error.code === "auth/popup-blocked" || error.code === "auth/internal-error") {
        toast.loading("Popup blocked or failed. Retrying with redirect...", { id: toastId });
        const { signInWithRedirect } = await import("firebase/auth");
        await signInWithRedirect(auth, googleProvider);
      } else if (error.code === "auth/operation-not-allowed") {
        toast.error("Google Sign-In is disabled. Enable it in Firebase Console > Build > Authentication > Sign-in method.", { id: toastId, duration: 6000 });
        setLoading(false);
      } else {
        toast.error(`Sign-In failed: ${error.message || "Unknown error"}`, { id: toastId });
        setLoading(false);
      }
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter both email and password.");
      return;
    }

    setLoading(true);
    const toastId = toast.loading(isSignUp ? "Creating account..." : "Signing in...");

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success("Account created successfully!", { id: toastId });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Login successful!", { id: toastId });
      }
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Auth Error:", error);
      
      if (error?.code === "auth/user-not-found") {
        toast.error("User not found. Please Sign Up first!", { id: toastId });
        setIsSignUp(true);
      } else if (error?.code === "auth/email-already-in-use") {
        toast.error("Email already exists. Please Sign In instead.", { id: toastId });
        setIsSignUp(false);
      } else if (error?.code === "auth/weak-password") {
        toast.error("Password should be at least 6 characters.", { id: toastId });
      } else if (error?.code === "auth/wrong-password" || error?.code === "auth/invalid-credential") {
        toast.error("Invalid email or password.", { id: toastId });
      } else if (error?.code === "auth/operation-not-allowed") {
        toast.error("Google Sign-In is not enabled. Please enable it in the Firebase Console.", { id: toastId, duration: 5000 });
      } else {
        toast.error(error.message || "Authentication failed. Please try again.", { id: toastId });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAuth(e as any);
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] p-4">
      <div className="w-full max-w-md glass p-8 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 text-primary flex items-center justify-center rounded-full mx-auto mb-4 shadow-inner">
            {isSignUp ? <UserPlus className="w-8 h-8" /> : <LogIn className="w-8 h-8" />}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-foreground/60 mt-2">
            {isSignUp ? "Join the Election Assistant" : "Sign in to access your dashboard"}
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center py-3 px-4 border border-surface-dark/20 rounded-xl shadow-sm text-sm font-semibold bg-white text-gray-700 hover:bg-gray-50 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-dark/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-surface text-foreground/50">Or with email</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground/80 px-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-foreground/50">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                className="block w-full pl-10 pr-4 py-3 bg-surface/50 border border-surface-dark/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground/80 px-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-foreground/50">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                className="block w-full pl-10 pr-4 py-3 bg-surface/50 border border-surface-dark/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim() || !password.trim()}
            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              isSignUp ? "Sign Up" : "Sign In"
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm font-semibold text-primary hover:underline transition-all"
          >
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
