import { describe, it, expect, vi } from 'vitest';
import { aiService } from '../src/services/ai.service';
import { storageService } from '../src/services/storage.service';

// Mock Firebase
vi.mock('../src/lib/firebase', () => ({
  db: {},
  auth: {},
}));

describe('AI Service', () => {
  it('should define core methods', () => {
    expect(aiService.fetchChatResponse).toBeDefined();
    expect(aiService.generateQuiz).toBeDefined();
  });

  it('should handle chat responses', async () => {
    // Mock global fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ response: 'AI response' })
    });

    const response = await aiService.fetchChatResponse([{ role: 'user', content: 'Hello' }], 'detailed');
    expect(response).toBe('AI response');
  });
});

describe('Storage Service', () => {
  it('should define core methods', () => {
    expect(storageService.saveQuizResult).toBeDefined();
    expect(storageService.saveChatSession).toBeDefined();
    expect(storageService.syncUserProfile).toBeDefined();
  });
});
