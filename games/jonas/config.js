// Jonás y la Ballena - Configuration
const CONFIG = {
  canvas: {
    width: 800,
    height: 600,
    backgroundColor: '#001f3f'
  },

  player: {
    x: 150,              // Fixed X position
    startY: 300,         // Starting Y position
    size: 35,            // Player size
    gravity: 0.4,        // Gravity pull (reduced from 0.6)
    swimForce: -10,      // Upward force when swimming (stronger from -12)
    maxVelocityY: 10,    // Max fall/rise speed (reduced from 12)
    rotationSpeed: 0.15, // How fast player rotates
    color: '#FF8C00'     // Deep orange
  },

  obstacles: {
    width: 60,
    minGap: 180,         // Minimum gap (increased from 160)
    maxGap: 260,         // Maximum gap (increased from 240)
    spacing: 400,        // Distance between obstacles (increased from 350)
    speed: 2.5,          // Initial scroll speed (reduced from 3 for easier start)
    speedIncrement: 0.01, // Speed increase per point (drastically reduced for smooth ramp-up)
    maxSpeed: 9,         // Maximum speed (increased from 8)
    color: '#2C3E50'
  },

  collectibles: {
    size: 20,
    spawnChance: 0.25,   // 25% chance per obstacle
    speed: 4,            // Matches obstacle speed
    types: {
      fish: {
        points: 10,
        color: '#FFD700',
        emoji: '🐟'
      },
      scroll: {
        points: 50,
        color: '#FF6B6B',
        emoji: '📜'
      }
    }
  },

  whale: {
    x: -100,             // Starts off-screen left
    y: 250,
    size: 80,
    color: '#34495E',
    pulseSpeed: 0.05
  },

  particles: {
    bubbles: {
      count: 30,
      color: 'rgba(173, 216, 230, 0.4)',
      maxSize: 8,
      speed: 2
    }
  },

  colors: {
    ocean: ['#001f3f', '#003f7f', '#005f9f'],
    text: '#FFFFFF',
    accent: '#00BFFF',
    warning: '#FF6B6B',
    success: '#2ECC71'
  },

  audio: {
    masterVolume: 0.5,
    enabled: true
  },

  scoring: {
    pointsPerObstacle: 1,
    difficultyStep: 10    // Increase difficulty every 10 points
  }
};
