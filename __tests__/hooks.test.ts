import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChat } from '../src/hooks/useChat';
import { useQuiz } from '../src/hooks/useQuiz';

// Mock Services
vi.mock('../src/services/ai.service', () => ({
  aiService: {
    generateChatStream: vi.fn().mockResolvedValue({
      async *[Symbol.asyncIterator]() {
        yield 'AI response';
      }
    })
  }
}));

vi.mock('../src/services/storage.service', () => ({
  storageService: {
    saveQuizResult: vi.fn().mockResolvedValue(true)
  }
}));

describe('useChat Hook', () => {
  it('should initialize with empty messages', () => {
    const { result } = renderHook(() => useChat());
    expect(result.current.messages).toHaveLength(0);
    expect(result.current.loading).toBe(false);
  });
});

describe('useQuiz Hook', () => {
  it('should initialize with null current question', () => {
    const { result } = renderHook(() => useQuiz());
    expect(result.current.currentQuestion).toBeNull();
    expect(result.current.score).toBe(0);
  });
});
