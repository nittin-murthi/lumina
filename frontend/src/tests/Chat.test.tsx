import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import Chat from '../pages/Chat';
import { BrowserRouter } from 'react-router-dom';

// Mock the API calls
vi.mock('../api/chat', () => ({
    sendMessage: vi.fn(() => Promise.resolve({ 
        message: 'Test response',
        type: 'assistant'
    }))
}));

describe('Chat Component', () => {
    const renderChat = () => {
        return render(
            <BrowserRouter>
                <Chat />
            </BrowserRouter>
        );
    };

    it('renders the chat interface', () => {
        renderChat();
        expect(screen.getByRole('textbox')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
    });

    it('displays welcome message on initial load', () => {
        renderChat();
        expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    });

    it('handles user input correctly', async () => {
        renderChat();
        const input = screen.getByRole('textbox');
        const sendButton = screen.getByRole('button', { name: /send/i });

        await userEvent.type(input, 'Hello, AI!');
        expect(input).toHaveValue('Hello, AI!');

        fireEvent.click(sendButton);
        expect(input).toHaveValue(''); // Input should clear after sending
    });

    it('displays messages in the chat', async () => {
        renderChat();
        const input = screen.getByRole('textbox');
        const sendButton = screen.getByRole('button', { name: /send/i });

        await userEvent.type(input, 'Test message');
        fireEvent.click(sendButton);

        await waitFor(() => {
            expect(screen.getByText('Test message')).toBeInTheDocument();
            expect(screen.getByText('Test response')).toBeInTheDocument();
        });
    });

    it('handles loading state correctly', async () => {
        renderChat();
        const input = screen.getByRole('textbox');
        const sendButton = screen.getByRole('button', { name: /send/i });

        await userEvent.type(input, 'Test message');
        fireEvent.click(sendButton);

        // Should show loading state
        expect(screen.getByText(/thinking/i)).toBeInTheDocument();

        // Wait for response
        await waitFor(() => {
            expect(screen.queryByText(/thinking/i)).not.toBeInTheDocument();
        });
    });

    it('maintains message history', async () => {
        renderChat();
        const input = screen.getByRole('textbox');
        const sendButton = screen.getByRole('button', { name: /send/i });

        // Send first message
        await userEvent.type(input, 'First message');
        fireEvent.click(sendButton);

        // Send second message
        await userEvent.type(input, 'Second message');
        fireEvent.click(sendButton);

        await waitFor(() => {
            expect(screen.getByText('First message')).toBeInTheDocument();
            expect(screen.getByText('Second message')).toBeInTheDocument();
        });
    });
}); 