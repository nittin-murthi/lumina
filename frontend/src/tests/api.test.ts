import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendMessage } from '../api/chat';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('API Functions', () => {
    beforeEach(() => {
        mockFetch.mockClear();
    });

    it('sends message to backend correctly', async () => {
        const mockResponse = {
            message: 'Test response',
            type: 'assistant'
        };

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockResponse)
        });

        const result = await sendMessage('Test message');
        
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/chat'),
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify({ message: 'Test message' })
            })
        );

        expect(result).toEqual(mockResponse);
    });

    it('handles API errors correctly', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error'
        });

        await expect(sendMessage('Test message')).rejects.toThrow();
    });

    it('handles network errors', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        await expect(sendMessage('Test message')).rejects.toThrow('Network error');
    });

    it('handles malformed responses', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.reject(new Error('Invalid JSON'))
        });

        await expect(sendMessage('Test message')).rejects.toThrow();
    });
}); 