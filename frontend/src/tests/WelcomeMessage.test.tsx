import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TopMessage, BottomMessage } from '../components/chat/WelcomeMessage';

describe('WelcomeMessage Components', () => {
    it('renders top message correctly', () => {
        render(<TopMessage />);
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
        expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    });

    it('renders bottom message correctly', () => {
        render(<BottomMessage />);
        expect(screen.getByText(/course/i)).toBeInTheDocument();
        expect(screen.getByText(/ask/i)).toBeInTheDocument();
    });

    it('has proper styling classes', () => {
        const { container } = render(<TopMessage />);
        expect(container.firstChild).toHaveClass('welcome-message');
    });

    it('displays all required sections', () => {
        render(<TopMessage />);
        render(<BottomMessage />);
        const sections = screen.getAllByRole('heading');
        expect(sections.length).toBeGreaterThan(0);
        const links = screen.getAllByRole('link');
        expect(links.length).toBeGreaterThan(0);
    });
}); 