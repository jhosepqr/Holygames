// Noé y el Arca - Game Configuration
const CONFIG = {
    canvas: {
        width: 800,
        height: 600,
        backgroundColor: '#1a1a2e'
    },

    player: {
        width: 60,
        height: 80,
        speed: 8,
        startX: 400,
        startY: 520
    },

    animals: {
        types: [
            { emoji: '🐑', name: 'Oveja', points: 10, speed: 2 },
            { emoji: '🐦', name: 'Paloma', points: 15, speed: 2.5 },
            { emoji: '🦁', name: 'León', points: 20, speed: 3 },
            { emoji: '🐘', name: 'Elefante', points: 25, speed: 1.5 },
            { emoji: '🦒', name: 'Jirafa', points: 20, speed: 2 },
            { emoji: '🐻', name: 'Oso', points: 15, speed: 2.5 },
            { emoji: '🐰', name: 'Conejo', points: 10, speed: 3 }
        ],
        size: 50,
        spawnInterval: 1500,
        minSpawnInterval: 600
    },

    rainbow: {
        emoji: '🌈',
        points: 50,
        spawnChance: 0.1,
        speed: 1
    },

    rain: {
        dropCount: 100,
        minSpeed: 3,
        maxSpeed: 8,
        damageChance: 0.05 // Chance to hit player and reduce points
    },

    ark: {
        emoji: '🚢',
        width: 120,
        height: 80
    },

    scoring: {
        pairBonus: 25,
        levelThreshold: 100
    },

    audio: {
        enabled: true,
        masterVolume: 0.6
    },

    difficulty: {
        speedIncrement: 0.0005,
        spawnDecrease: 5
    }
};
