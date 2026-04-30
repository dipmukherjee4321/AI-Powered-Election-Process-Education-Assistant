import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useVoice } from "@/hooks/useVoice";

describe("useVoice hook", () => {
  let mockRecognition: any;

  beforeEach(() => {
    mockRecognition = {
      start: vi.fn(),
      stop: vi.fn(),
      onstart: null,
      onresult: null,
      onerror: null,
      onend: null,
    };

    class MockSpeechRecognition {
      constructor() {
        return mockRecognition;
      }
    }
    (window as any).SpeechRecognition = MockSpeechRecognition;

    // Mock console.warn and console.error
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    delete (window as any).SpeechRecognition;
    delete (window as any).webkitSpeechRecognition;
    vi.restoreAllMocks();
  });

  it("should warn if speech recognition is not supported", () => {
    delete (window as any).SpeechRecognition;
    delete (window as any).webkitSpeechRecognition;

    const { result } = renderHook(() => useVoice());
    const onResult = vi.fn();

    act(() => {
      result.current.startListening(onResult);
    });

    expect(console.warn).toHaveBeenCalledWith("Speech Recognition not supported in this browser.");
    expect(result.current.isListening).toBe(false);
  });

  it("should initialize and start recognition", () => {
    const { result } = renderHook(() => useVoice());
    const onResult = vi.fn();

    act(() => {
      result.current.startListening(onResult);
    });

    expect(mockRecognition.start).toHaveBeenCalled();

    // Simulate onstart
    act(() => {
      mockRecognition.onstart();
    });

    expect(result.current.isListening).toBe(true);
  });

  it("should handle speech results", () => {
    const { result } = renderHook(() => useVoice());
    const onResult = vi.fn();

    act(() => {
      result.current.startListening(onResult);
    });

    const mockEvent = {
      results: [[{ transcript: "hello world" }]],
    };

    act(() => {
      mockRecognition.onresult(mockEvent);
    });

    expect(onResult).toHaveBeenCalledWith("hello world");
  });

  it("should handle recognition error", () => {
    const { result } = renderHook(() => useVoice());
    const onResult = vi.fn();

    act(() => {
      result.current.startListening(onResult);
      mockRecognition.onstart();
    });

    expect(result.current.isListening).toBe(true);

    const mockErrorEvent = { error: "not-allowed" };

    act(() => {
      mockRecognition.onerror(mockErrorEvent);
    });

    expect(console.error).toHaveBeenCalledWith("Speech recognition error:", "not-allowed");
    expect(result.current.isListening).toBe(false);
  });

  it("should handle recognition end", () => {
    const { result } = renderHook(() => useVoice());
    const onResult = vi.fn();

    act(() => {
      result.current.startListening(onResult);
      mockRecognition.onstart();
    });

    expect(result.current.isListening).toBe(true);

    act(() => {
      mockRecognition.onend();
    });

    expect(result.current.isListening).toBe(false);
  });
});
