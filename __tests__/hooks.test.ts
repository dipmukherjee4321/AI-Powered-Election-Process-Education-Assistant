import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useChat } from '../src/hooks/useChat';
import { useQuiz } from '../src/hooks/useQuiz';

// Mock Services and Context
vi.mock('../src/services/ai.service', () => ({
  aiService: {
    fetchChatResponse: vi.fn().mockResolvedValue('AI response'),
    generateQuiz: vi.fn().mockResolvedValue({ questions: [] })
  }
}));

vi.mock('../src/services/storage.service', () => ({
  storageService: {
    saveQuizResult: vi.fn().mockResolvedValue(true),
    saveChatSession: vi.fn().mockResolvedValue(true)
  }
}));

vi.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({ user: { uid: 'test-uid' } })
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn()
  }
}));

describe('useChat Hook', () => {
  it('should initialize with default assistant message', () => {
    const { result } = renderHook(() => useChat());
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.isLoading).toBe(false);
  });
});

describe('useQuiz Hook', () => {
  it('should initialize with empty questions array', () => {
    const { result } = renderHook(() => useQuiz());
    expect(result.current.questions).toHaveLength(0);
    expect(result.current.score).toBe(0);
  });
});
