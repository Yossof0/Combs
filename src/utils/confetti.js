import confetti from 'canvas-confetti';

export function fireConfetti() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#0ea5e9', '#7c3aed', '#f97316', '#22c55e', '#ec4899'],
  });
}

export function fireSmallConfetti() {
  confetti({
    particleCount: 30,
    spread: 50,
    origin: { y: 0.7 },
    scalar: 0.8,
    colors: ['#0ea5e9', '#7c3aed', '#22c55e'],
  });
}
