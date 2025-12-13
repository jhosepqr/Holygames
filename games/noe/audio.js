// Noé y el Arca - Audio System with Background Music
class AudioManager {
    constructor() {
        this.context = null;
        this.enabled = CONFIG.audio.enabled;
        this.masterVolume = CONFIG.audio.masterVolume;
        this.muted = false;
        this.initialized = false;
        this.musicPlaying = false;
        this.musicNodes = [];
    }

    init() {
        if (this.initialized) return;

        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            console.log('[AUDIO] Initialized');
        } catch (e) {
            console.warn('[AUDIO] Web Audio API not supported', e);
            this.enabled = false;
        }
    }

    resume() {
        if (this.context && this.context.state === 'suspended') {
            this.context.resume();
        }
    }

    // Background music - cheerful arcade style melody
    startMusic() {
        if (!this.enabled || this.muted || !this.context || this.musicPlaying) return;

        this.musicPlaying = true;
        this.playMelodyLoop();
    }

    playMelodyLoop() {
        if (!this.musicPlaying || this.muted) return;

        const now = this.context.currentTime;

        // Simple cheerful melody notes (C major scale pattern)
        const melody = [
            { freq: 523.25, duration: 0.2 },  // C5
            { freq: 587.33, duration: 0.2 },  // D5
            { freq: 659.25, duration: 0.2 },  // E5
            { freq: 698.46, duration: 0.3 },  // F5
            { freq: 659.25, duration: 0.2 },  // E5
            { freq: 587.33, duration: 0.2 },  // D5
            { freq: 523.25, duration: 0.3 },  // C5
            { freq: 392.00, duration: 0.2 },  // G4
            { freq: 440.00, duration: 0.2 },  // A4
            { freq: 493.88, duration: 0.2 },  // B4
            { freq: 523.25, duration: 0.4 },  // C5
        ];

        let time = now;
        const totalDuration = melody.reduce((sum, note) => sum + note.duration, 0);

        melody.forEach(note => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            const filter = this.context.createBiquadFilter();

            osc.type = 'triangle';
            osc.frequency.value = note.freq;

            filter.type = 'lowpass';
            filter.frequency.value = 2000;

            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(this.masterVolume * 0.15, time + 0.02);
            gain.gain.setValueAtTime(this.masterVolume * 0.15, time + note.duration - 0.05);
            gain.gain.linearRampToValueAtTime(0, time + note.duration);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.context.destination);

            osc.start(time);
            osc.stop(time + note.duration);

            time += note.duration;
        });

        // Bass line
        this.playBassLine(now, totalDuration);

        // Loop the melody
        setTimeout(() => {
            if (this.musicPlaying && !this.muted) {
                this.playMelodyLoop();
            }
        }, totalDuration * 1000);
    }

    playBassLine(startTime, duration) {
        const bassNotes = [
            { freq: 130.81, duration: duration / 4 },  // C3
            { freq: 146.83, duration: duration / 4 },  // D3
            { freq: 130.81, duration: duration / 4 },  // C3
            { freq: 98.00, duration: duration / 4 },   // G2
        ];

        let time = startTime;
        bassNotes.forEach(note => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();

            osc.type = 'sine';
            osc.frequency.value = note.freq;

            gain.gain.setValueAtTime(this.masterVolume * 0.1, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + note.duration - 0.05);

            osc.connect(gain);
            gain.connect(this.context.destination);

            osc.start(time);
            osc.stop(time + note.duration);

            time += note.duration;
        });
    }

    stopMusic() {
        this.musicPlaying = false;
    }

    // Sound effects
    playCollect(points) {
        if (!this.enabled || this.muted || !this.context) return;

        const now = this.context.currentTime;
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        // Higher pitch for higher value items
        const baseFreq = 400 + (points * 10);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.1);

        gain.gain.setValueAtTime(this.masterVolume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc.connect(gain);
        gain.connect(this.context.destination);

        osc.start(now);
        osc.stop(now + 0.2);
    }

    playPairBonus() {
        if (!this.enabled || this.muted || !this.context) return;

        const now = this.context.currentTime;
        const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

        frequencies.forEach((freq, i) => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            const delay = i * 0.08;
            gain.gain.setValueAtTime(0, now + delay);
            gain.gain.linearRampToValueAtTime(this.masterVolume * 0.3, now + delay + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.3);

            osc.connect(gain);
            gain.connect(this.context.destination);

            osc.start(now + delay);
            osc.stop(now + delay + 0.3);
        });
    }

    playRainbow() {
        if (!this.enabled || this.muted || !this.context) return;

        const now = this.context.currentTime;
        // Magical arpeggio
        const notes = [392, 440, 494, 523, 587, 659, 698, 784];

        notes.forEach((freq, i) => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            const delay = i * 0.06;
            gain.gain.setValueAtTime(0, now + delay);
            gain.gain.linearRampToValueAtTime(this.masterVolume * 0.25, now + delay + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.4);

            osc.connect(gain);
            gain.connect(this.context.destination);

            osc.start(now + delay);
            osc.stop(now + delay + 0.4);
        });
    }

    playMiss() {
        if (!this.enabled || this.muted || !this.context) return;

        const now = this.context.currentTime;
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);

        gain.gain.setValueAtTime(this.masterVolume * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc.connect(gain);
        gain.connect(this.context.destination);

        osc.start(now);
        osc.stop(now + 0.2);
    }

    playGameOver() {
        if (!this.enabled || this.muted || !this.context) return;

        const now = this.context.currentTime;
        const notes = [392, 349, 330, 294, 262];

        notes.forEach((freq, i) => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();

            osc.type = 'triangle';
            osc.frequency.value = freq;

            const delay = i * 0.15;
            gain.gain.setValueAtTime(this.masterVolume * 0.4, now + delay);
            gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.3);

            osc.connect(gain);
            gain.connect(this.context.destination);

            osc.start(now + delay);
            osc.stop(now + delay + 0.3);
        });
    }

    playLevelUp() {
        if (!this.enabled || this.muted || !this.context) return;

        const now = this.context.currentTime;
        const notes = [523, 659, 784, 1047];

        notes.forEach((freq, i) => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();

            osc.type = 'square';
            osc.frequency.value = freq;

            const delay = i * 0.1;
            gain.gain.setValueAtTime(0, now + delay);
            gain.gain.linearRampToValueAtTime(this.masterVolume * 0.2, now + delay + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.2);

            osc.connect(gain);
            gain.connect(this.context.destination);

            osc.start(now + delay);
            osc.stop(now + delay + 0.2);
        });
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.muted) {
            this.stopMusic();
        } else if (this.initialized) {
            this.startMusic();
        }
        return this.muted;
    }
}

const audioManager = new AudioManager();
