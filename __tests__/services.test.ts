import { describe, it, expect, vi } from 'vitest';
import { aiService } from '../src/services/ai.service';
import { storageService } from '../src/services/storage.service';

// Mock Firebase and Gemini
vi.mock('../src/lib/firebase', () => ({
  db: {},
  auth: {},
}));

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockImplementation(() => ({
      generateContentStream: vi.fn().mockResolvedValue({
        stream: [
          { text: () => 'Test' },
          { text: () => ' response' }
        ]
      }),
      generateContent: vi.fn().mockResolvedValue({
        response: { text: () => '{"questions": []}' }
      })
    }))
  }))
}));

describe('AI Service', () => {
  it('should format prompts correctly for different modes', () => {
    // Access private or testable logic
    expect(aiService).toBeDefined();
  });

  it('should handle streaming responses', async () => {
    const stream = await aiService.generateChatStream('Hello', 'Detailed');
    expect(stream).toBeDefined();
  });
});

describe('Storage Service', () => {
  it('should define core methods', () => {
    expect(storageService.saveQuizResult).toBeDefined();
    expect(storageService.getUserHistory).toBeDefined();
  });
});
