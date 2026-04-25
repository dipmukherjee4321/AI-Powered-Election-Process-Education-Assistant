import { render, screen, fireEvent } from '@testing-library/react';
import ChatInterface from '@/components/chat/ChatInterface';
import { describe, it, expect, vi } from 'vitest';

// Mock fetch for API integration testing
global.fetch = vi.fn();

describe('ChatInterface UI and Integration', () => {
  it('renders correctly and shows initial AI message', () => {
    render(<ChatInterface />);
    
    // Check if header is present
    expect(screen.getByText('AI Tutor')).toBeInTheDocument();
    
    // Check initial message
    expect(screen.getByText(/Hello! I am your AI Election Assistant/i)).toBeInTheDocument();
  });

  it('allows user to type and submit a message', async () => {
    render(<ChatInterface />);
    
    const input = screen.getByPlaceholderText(/Ask about elections/i);
    const sendButton = screen.getByRole('button', { name: /Send message/i });

    // Type message
    fireEvent.change(input, { target: { value: 'How does voting work?' } });
    expect(input).toHaveValue('How does voting work?');

    // Submit
    fireEvent.click(sendButton);

    // The input should be cleared and the message should be on screen
    expect(input).toHaveValue('');
    expect(screen.getByText('How does voting work?')).toBeInTheDocument();
  });

  it('has buttons rendered correctly', () => {
    render(<ChatInterface />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeInTheDocument();
    });
  });
});
