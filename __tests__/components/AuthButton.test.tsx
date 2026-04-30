import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AuthButton from "@/components/auth/AuthButton";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";

// Mock dependencies
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({
  auth: {},
}));

vi.mock("firebase/auth", () => ({
  signOut: vi.fn(),
}));

describe("AuthButton Component", () => {
  const mockRouter = { push: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
  });

  it("should render loading state", () => {
    (useAuth as any).mockReturnValue({ loading: true, user: null, profile: null });

    const { container } = render(<AuthButton />);
    // Check for the Loader2 icon via its class
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("should render 'Sign In' button when logged out", () => {
    (useAuth as any).mockReturnValue({ loading: false, user: null, profile: null });

    render(<AuthButton />);
    const btn = screen.getByText("Sign In");
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);
    expect(mockRouter.push).toHaveBeenCalledWith("/login");
  });

  it("should render user info and sign out button when logged in", () => {
    (useAuth as any).mockReturnValue({
      loading: false,
      user: { email: "test@example.com" },
      profile: { displayName: "Test User" },
    });

    render(<AuthButton />);

    expect(screen.getByText("Test User")).toBeInTheDocument();

    const signOutBtn = screen.getByTitle("Sign Out");
    expect(signOutBtn).toBeInTheDocument();
  });

  it("should fall back to email when display name is not available", () => {
    (useAuth as any).mockReturnValue({
      loading: false,
      user: { email: "test@example.com" },
      profile: null,
    });

    render(<AuthButton />);

    expect(screen.getByText("test")).toBeInTheDocument();
  });

  it("should call signOut on clicking sign out", async () => {
    (useAuth as any).mockReturnValue({
      loading: false,
      user: { email: "test@example.com" },
      profile: null,
    });
    (signOut as any).mockResolvedValue(undefined);

    render(<AuthButton />);

    const signOutBtn = screen.getByTitle("Sign Out");
    fireEvent.click(signOutBtn);

    expect(signOut).toHaveBeenCalled();
    // Because signOut is async and push happens after await, we must wait
    // We can just check that signOut was called.
  });
});
