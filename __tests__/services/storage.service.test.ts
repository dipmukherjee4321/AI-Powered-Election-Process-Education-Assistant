import { describe, it, expect, vi, beforeEach } from "vitest";
import { storageService } from "@/services/storage.service";
import { addDoc, setDoc } from "firebase/firestore";

// Mock firebase
vi.mock("@/lib/firebase", () => ({
  db: {}, // Mock db object
}));

vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(() => "mocked-timestamp"),
}));

describe("storageService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("saveChatSession", () => {
    it("should save chat session successfully", async () => {
      (addDoc as any).mockResolvedValueOnce({ id: "test-doc-id" });

      await storageService.saveChatSession(
        "user-123",
        "Hello AI",
        "Hello User",
        "detailed"
      );

      expect(addDoc).toHaveBeenCalledWith(undefined, {
        userMessage: "Hello AI",
        aiResponse: "Hello User",
        mode: "detailed",
        timestamp: "mocked-timestamp",
      });
    });

    it("should handle error when addDoc fails", async () => {
      (addDoc as any).mockRejectedValueOnce(new Error("Firestore Error"));

      await expect(
        storageService.saveChatSession(
          "user-123",
          "Hello AI",
          "Hello User",
          "detailed"
        )
      ).rejects.toThrow("Firestore Error");
    });
  });

  describe("saveQuizResult", () => {
    it("should save quiz result successfully", async () => {
      (addDoc as any).mockResolvedValueOnce({ id: "test-quiz-id" });

      await storageService.saveQuizResult("user-123", {
        score: 8,
        total: 10,
        difficulty: "medium",
        accuracy: 80,
      });

      expect(addDoc).toHaveBeenCalledWith(undefined, {
        score: 8,
        total: 10,
        difficulty: "medium",
        accuracy: 80,
        timestamp: "mocked-timestamp",
      });
    });
  });

  describe("syncUserProfile", () => {
    it("should update user profile successfully", async () => {
      (setDoc as any).mockResolvedValueOnce(undefined);

      await storageService.syncUserProfile("user-123", {
        displayName: "John Doe",
      });

      expect(setDoc).toHaveBeenCalledWith(
        undefined,
        {
          displayName: "John Doe",
          lastActive: "mocked-timestamp",
        },
        { merge: true }
      );
    });
  });
});
