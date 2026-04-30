import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { onAuthStateChanged, getRedirectResult } from "firebase/auth";
import { getDoc, setDoc } from "firebase/firestore";
import React from "react";

// Mock Firebase
vi.mock("@/lib/firebase", () => ({
  auth: {},
  db: {},
}));

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn(),
  getRedirectResult: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(() => "mock-timestamp"),
}));

const TestComponent = () => {
  const { user, loading, profile } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div data-testid="user">{user ? user.uid : "no-user"}</div>
      <div data-testid="profile">{profile ? (profile.displayName as string) : "no-profile"}</div>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize and render loading state initially", async () => {
    (getRedirectResult as any).mockResolvedValue(null);
    // Do not call the callback immediately to test loading state
    (onAuthStateChanged as any).mockImplementation(() => vi.fn());

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should handle logged out state", async () => {
    (getRedirectResult as any).mockResolvedValue(null);
    (onAuthStateChanged as any).mockImplementation((auth: any, callback: any) => {
      callback(null); // Not logged in
      return vi.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    expect(screen.getByTestId("user").textContent).toBe("no-user");
    expect(screen.getByTestId("profile").textContent).toBe("no-profile");
  });

  it("should handle logged in state with existing profile", async () => {
    (getRedirectResult as any).mockResolvedValue(null);

    (onAuthStateChanged as any).mockImplementation((auth: any, callback: any) => {
      callback({ uid: "user-1", email: "test@test.com", displayName: "Test User" });
      return vi.fn();
    });

    (getDoc as any).mockResolvedValue({
      exists: () => true,
      data: () => ({ uid: "user-1", displayName: "Test User" }),
    });

    (setDoc as any).mockResolvedValue(undefined);

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    expect(screen.getByTestId("user").textContent).toBe("user-1");
    expect(screen.getByTestId("profile").textContent).toBe("Test User");
    expect(setDoc).toHaveBeenCalled(); // Update lastLogin
  });

  it("should handle logged in state with new profile creation", async () => {
    (getRedirectResult as any).mockResolvedValue(null);

    (onAuthStateChanged as any).mockImplementation((auth: any, callback: any) => {
      callback({ uid: "user-2", email: "new@test.com", displayName: "New User" });
      return vi.fn();
    });

    (getDoc as any).mockResolvedValue({
      exists: () => false,
    });

    (setDoc as any).mockResolvedValue(undefined);

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    expect(screen.getByTestId("user").textContent).toBe("user-2");
    expect(screen.getByTestId("profile").textContent).toBe("New User");
    expect(setDoc).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        uid: "user-2",
        email: "new@test.com",
        displayName: "New User",
      })
    );
  });
});
