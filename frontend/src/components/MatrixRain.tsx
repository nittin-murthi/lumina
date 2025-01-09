import { useEffect, useRef } from 'react';

const MatrixRain = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Array of cool colors
    const coolColors = [
      '#00ff9d', // mint green
      '#00ffff', // cyan
      '#4169e1', // royal blue
      '#00bfff', // deep sky blue
      '#1e90ff', // dodger blue
      '#9370db', // medium purple
      '#00ffcc', // turquoise
      '#40e0d0', // turquoise
    ];

    // Create matrix lines
    const createLine = () => {
      const line = document.createElement('div');
      line.className = 'matrix-line';
      line.style.left = `${Math.random() * 100}%`;
      line.style.height = `${Math.random() * 30 + 20}%`;
      
      // Random animation duration between 4 and 8 seconds (slower fall)
      line.style.animationDuration = `${Math.random() * 4 + 4}s`;
      
      // Random cool color
      const randomColor = coolColors[Math.floor(Math.random() * coolColors.length)];
      line.style.background = `linear-gradient(180deg, transparent, ${randomColor})`;
      
      container.appendChild(line);

      // Remove line after animation
      setTimeout(() => {
        line.remove();
      }, 8000); // Increased timeout to match longer animation
    };

    // Create initial lines
    for (let i = 0; i < 50; i++) {
      setTimeout(() => createLine(), Math.random() * 3000);
    }

    // Continue creating lines at a slower rate
    const interval = setInterval(() => {
      createLine();
    }, 150); // Slightly increased interval between new lines

    return () => {
      clearInterval(interval);
      container.innerHTML = '';
    };
  }, []);

  return <div ref={containerRef} className="matrix-bg" />;
};

export default MatrixRain; 