import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LoginPage from "@/app/login/page";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import toast from "react-hot-toast";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

// Mock firebase
vi.mock("@/lib/firebase", () => ({
  auth: {},
  googleProvider: {},
}));

vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  onAuthStateChanged: vi.fn(),
  getRedirectResult: vi.fn().mockResolvedValue(null),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(() => "toast-id"),
  },
}));

describe("LoginPage Component", () => {
  const mockRouter = { push: vi.fn(), replace: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
    // Simulate user not logged in initially
    (onAuthStateChanged as any).mockImplementation((auth: any, cb: any) => {
      cb(null);
      return vi.fn();
    });
  });

  it("should render sign in form initially", async () => {
    await act(async () => {
      render(<LoginPage />);
    });

    // Safety timeout in useEffect fires and sets checkingAuth to false
    expect(screen.getByText("Welcome Back")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("should switch between sign in and sign up", async () => {
    await act(async () => {
      render(<LoginPage />);
    });

    const toggleBtn = screen.getByText("Don't have an account? Sign Up");

    fireEvent.click(toggleBtn);

    expect(screen.getByText("Create Account")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument();

    const toggleBtnBack = screen.getByText("Already have an account? Sign In");
    fireEvent.click(toggleBtnBack);

    expect(screen.getByText("Welcome Back")).toBeInTheDocument();
  });

  it("should handle email sign in successfully", async () => {
    (signInWithEmailAndPassword as any).mockResolvedValue({ user: { uid: "1" } });

    await act(async () => {
      render(<LoginPage />);
    });

    const emailInput = screen.getByPlaceholderText("you@example.com");
    const passwordInput = screen.getByPlaceholderText("••••••••");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    const submitBtn = screen.getByRole("button", { name: "Sign In" });

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(signInWithEmailAndPassword).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("Login successful!", { id: "toast-id" });
    expect(mockRouter.push).toHaveBeenCalledWith("/dashboard");
  });

  it("should handle email sign up successfully", async () => {
    (createUserWithEmailAndPassword as any).mockResolvedValue({ user: { uid: "1" } });

    await act(async () => {
      render(<LoginPage />);
    });

    // Switch to Sign Up
    fireEvent.click(screen.getByText("Don't have an account? Sign Up"));

    const emailInput = screen.getByPlaceholderText("you@example.com");
    const passwordInput = screen.getByPlaceholderText("••••••••");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    const submitBtn = screen.getByRole("button", { name: "Sign Up" });

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(createUserWithEmailAndPassword).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("Account created successfully!", { id: "toast-id" });
  });

  it("should handle auth error (wrong password)", async () => {
    const error: any = new Error("Wrong Password");
    error.code = "auth/wrong-password";
    (signInWithEmailAndPassword as any).mockRejectedValue(error);

    await act(async () => {
      render(<LoginPage />);
    });

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: "test@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), { target: { value: "wrong" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Sign In" }));
    });

    expect(toast.error).toHaveBeenCalledWith("Invalid email or password.", { id: "toast-id" });
  });

  it("should handle google sign in successfully", async () => {
    (signInWithPopup as any).mockResolvedValue({ user: { uid: "1" } });

    await act(async () => {
      render(<LoginPage />);
    });

    const googleBtn = screen.getByText("Continue with Google");

    await act(async () => {
      fireEvent.click(googleBtn);
    });

    expect(signInWithPopup).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("Signed in with Google!", { id: "toast-id" });
    expect(mockRouter.push).toHaveBeenCalledWith("/dashboard");
  });
});
