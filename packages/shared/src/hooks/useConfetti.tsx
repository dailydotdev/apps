import React, { useState, useRef, useEffect, useCallback } from 'react';

// Interface for confetti pieces
interface ConfettiPiece {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  shape: 'rect' | 'circle';
  drag: number;
  gravity: number;
  opacity: number;
}

interface UseConfettiReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  showConfetti: boolean;
  setShowConfetti: React.Dispatch<React.SetStateAction<boolean>>;
  triggerConfetti: (position: { x: number; y: number }) => void;
  ConfettiCanvas: () => JSX.Element | null;
}

export const useConfetti = (): UseConfettiReturn => {
  const [showConfetti, setShowConfetti] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confettiPiecesRef = useRef<ConfettiPiece[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const [originPosition, setOriginPosition] = useState({ x: 0, y: 0 });

  const generateConfetti = useCallback(() => {
    const confettiPieces: ConfettiPiece[] = [];
    const confettiCount = 150; // Number of confetti pieces
    const colors = [
      '#ff5757', // red
      '#ff8c00', // orange
      '#ffff00', // yellow
      '#00ff00', // green
      '#00ffff', // cyan
      '#0080ff', // blue
      '#8000ff', // purple
      '#ff00ff', // magenta
      '#ffffff', // white
    ];

    // Use the provided position as the source
    const sourceX = originPosition.x;
    const sourceY = originPosition.y;

    // For better distribution in a circle, we'll use different strategy
    for (let i = 0; i < confettiCount; i += 1) {
      // To distribute angles more evenly, we'll divide the circle into sections
      // and add some randomness within each section
      const sectionCount = 12; // Divide the circle into 12 sections
      const sectionIndex = Math.floor(Math.random() * sectionCount);
      const sectionAngle = (Math.PI * 2) / sectionCount;
      const baseAngle = sectionIndex * sectionAngle;
      const angleWithinSection = Math.random() * sectionAngle;
      const angle = baseAngle + angleWithinSection;

      // We'll bias toward the sections that are more horizontal and upward
      // by controlling how many confetti pieces go into each section
      const direction = baseAngle / (Math.PI * 2); // 0-1 representing direction around the circle

      const shouldAddPiece = !(
        direction > 0.3 &&
        direction < 0.7 &&
        Math.random() < 0.5
      );

      if (shouldAddPiece) {
        // Adjust speed based on direction
        // Downward angle is around 0.5 (when normalized to 0-1)
        // Give more velocity to upward trajectories
        let speedMultiplier = 1.0;
        if (direction < 0.25 || direction > 0.75) {
          // Top half gets more speed
          speedMultiplier = 1.3;
        }

        // Initial velocity
        const baseSpeed = Math.random() * 10 + 15;
        const speed = baseSpeed * speedMultiplier;

        // Add small variance to the starting position
        const startVariance = 20;
        const startX =
          sourceX + (Math.random() * startVariance - startVariance / 2);
        const startY =
          sourceY + (Math.random() * startVariance - startVariance / 2);

        const isCircle = Math.random() > 0.7; // 30% chance to be a circle

        confettiPieces.push({
          x: startX,
          y: startY,
          velocityX: Math.cos(angle) * speed * (0.2 + Math.random() * 0.8),
          velocityY: Math.sin(angle) * speed * (0.2 + Math.random() * 0.8),
          size: Math.random() * 8 + 3, // Smaller pieces, varying sizes
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.2,
          shape: isCircle ? 'circle' : 'rect',
          drag: 0.975 - Math.random() * 0.02, // Increased drag to slow down falling
          gravity: 0.11 + Math.random() * 0.08, // Reduced gravity for slower fall
          opacity: 0.9 + Math.random() * 0.1,
        });
      }
    }

    return confettiPieces;
  }, [originPosition]);

  const drawConfetti = useCallback(
    (ctx: CanvasRenderingContext2D, confetti: ConfettiPiece) => {
      ctx.save();
      ctx.translate(confetti.x, confetti.y);
      ctx.rotate(confetti.rotation);
      ctx.fillStyle = confetti.color;
      ctx.globalAlpha = confetti.opacity;

      if (confetti.shape === 'circle') {
        // Draw a circle
        ctx.beginPath();
        ctx.arc(0, 0, confetti.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Draw a rectangle with varying aspect ratios
        const width = confetti.size * 0.5;
        const height = confetti.size * (1 + Math.random() * 0.5);
        ctx.beginPath();
        ctx.roundRect(-width / 2, -height / 2, width, height, 1);
        ctx.fill();
      }

      ctx.restore();
    },
    [],
  );

  const updateConfetti = useCallback((confettiPieces: ConfettiPiece[]) => {
    return confettiPieces
      .map((confetti) => {
        const updatedConfetti = { ...confetti };

        // Apply physics - gravity pulls down, velocity moves the piece
        updatedConfetti.velocityY += updatedConfetti.gravity;

        // Apply drag/air resistance
        updatedConfetti.velocityX *= updatedConfetti.drag;
        updatedConfetti.velocityY *= updatedConfetti.drag;

        // Update position
        updatedConfetti.x += updatedConfetti.velocityX;
        updatedConfetti.y += updatedConfetti.velocityY;

        // Gently rotate the confetti
        updatedConfetti.rotation += updatedConfetti.rotationSpeed;

        // Fade out as it falls, slower to match the slower fall
        const fallFactor = updatedConfetti.velocityY > 0 ? 1.2 : 1; // Reduced from 1.5 to 1.2
        updatedConfetti.opacity -=
          (0.0025 + Math.random() * 0.0015) * fallFactor; // Reduced fade rate (was 0.003)

        return updatedConfetti;
      })
      .filter((confetti) => {
        // Remove confetti that is faded out or off-screen
        return (
          confetti.opacity > 0 &&
          confetti.y < window.innerHeight + 100 &&
          confetti.y > -100 &&
          confetti.x > -100 &&
          confetti.x < window.innerWidth + 100
        );
      });
  }, []);

  const animateConfetti = useCallback(() => {
    if (!canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw and update each confetti piece
    confettiPiecesRef.current.forEach((piece) => drawConfetti(ctx, piece));
    confettiPiecesRef.current = updateConfetti(confettiPiecesRef.current);

    // Stop animation when all confetti has faded out
    if (confettiPiecesRef.current.length === 0) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
        setShowConfetti(false);
      }
      return;
    }

    animationFrameRef.current = requestAnimationFrame(animateConfetti);
  }, [drawConfetti, updateConfetti]);

  const startConfetti = useCallback(() => {
    if (!canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;

    // Set canvas to full window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Generate confetti pieces
    confettiPiecesRef.current = generateConfetti();

    // Start animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(animateConfetti);
  }, [animateConfetti, generateConfetti]);

  // Cleanup function to cancel animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, []);

  // Set up canvas when showConfetti state changes
  useEffect(() => {
    if (showConfetti) {
      startConfetti();
    }
  }, [showConfetti, startConfetti]);

  // Function to trigger confetti from a specific position
  const triggerConfetti = useCallback((position: { x: number; y: number }) => {
    setOriginPosition(position);
    setShowConfetti(true);
  }, []);

  // Component that renders the canvas
  const ConfettiCanvas = useCallback(() => {
    if (!showConfetti) {
      return null;
    }

    return (
      <canvas
        ref={canvasRef}
        className="z-10 pointer-events-none fixed inset-0"
        style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999 }}
      />
    );
  }, [showConfetti]);

  return {
    canvasRef,
    showConfetti,
    setShowConfetti,
    triggerConfetti,
    ConfettiCanvas,
  };
};
