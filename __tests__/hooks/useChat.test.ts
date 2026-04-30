import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useChat } from "@/hooks/useChat";
import { aiService } from "@/services/ai.service";
import { storageService } from "@/services/storage.service";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

// Mock dependencies
vi.mock("@/services/ai.service", () => ({
  aiService: {
    fetchChatResponse: vi.fn(),
  },
}));

vi.mock("@/services/storage.service", () => ({
  storageService: {
    saveChatSession: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    error: vi.fn(),
  },
}));

describe("useChat hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({ user: { uid: "test-user-id" } });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initialize with default assistant message and detailed mode", () => {
    const { result } = renderHook(() => useChat());

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].role).toBe("assistant");
    expect(result.current.mode).toBe("detailed");
    expect(result.current.isLoading).toBe(false);
  });

  it("should handle mode change", () => {
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.setMode("simple");
    });

    expect(result.current.mode).toBe("simple");
  });

  it("should not send empty message", async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage("   ");
    });

    expect(result.current.messages).toHaveLength(1);
    expect(aiService.fetchChatResponse).not.toHaveBeenCalled();
  });

  it("should handle successful message sending, streaming simulation, and persistence", async () => {
    (aiService.fetchChatResponse as any).mockResolvedValue("Hello world");
    (storageService.saveChatSession as any).mockResolvedValue(undefined);

    const { result } = renderHook(() => useChat());

    // We must mock timers because of the typewriter effect
    vi.useFakeTimers();

    let sendPromise: Promise<void>;
    act(() => {
      sendPromise = result.current.sendMessage("How do elections work?");
    });

    // Run all timers to complete the streaming simulation
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    await act(async () => {
      await sendPromise;
    });

    // Initial msg + User Msg + AI Msg
    expect(result.current.messages).toHaveLength(3);
    expect(result.current.messages[1].role).toBe("user");
    expect(result.current.messages[1].content).toBe("How do elections work?");

    // AI message
    expect(result.current.messages[2].role).toBe("assistant");
    expect(result.current.messages[2].content).toBe("Hello world");

    expect(storageService.saveChatSession).toHaveBeenCalledWith(
      "test-user-id",
      "How do elections work?",
      "Hello world",
      "detailed"
    );
  });

  it("should handle aiService error", async () => {
    (aiService.fetchChatResponse as any).mockRejectedValue(new Error("API Rate Limit"));

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage("Hello");
    });

    expect(toast.error).toHaveBeenCalledWith("API Rate Limit");
    expect(result.current.isLoading).toBe(false);
  });

  it("should not persist session if user is not logged in", async () => {
    (useAuth as any).mockReturnValue({ user: null });
    (aiService.fetchChatResponse as any).mockResolvedValue("Test");

    const { result } = renderHook(() => useChat());

    vi.useFakeTimers();

    let sendPromise: Promise<void>;
    act(() => {
      sendPromise = result.current.sendMessage("Hello");
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    await act(async () => {
      await sendPromise;
    });

    expect(storageService.saveChatSession).not.toHaveBeenCalled();
  });
});
