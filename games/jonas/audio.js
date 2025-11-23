// Jonás y la Ballena - Audio System
class AudioManager {
    constructor() {
        this.context = null;
        this.enabled = CONFIG.audio.enabled;
        this.masterVolume = CONFIG.audio.masterVolume;
        this.muted = false;
        this.initialized = false;
    }

    // Initialize Web Audio API context
    init() {
        if (this.initialized) return;

        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            console.log('Audio initialized');
        } catch (e) {
            console.warn('Web Audio API not supported', e);
            this.enabled = false;
        }
    }

    // Resume audio context (required for mobile/browser autoplay policies)
    resume() {
        if (this.context && this.context.state === 'suspended') {
            this.context.resume();
        }
    }

    // Play swim/jump sound
    playSwim() {
        if (!this.enabled || this.muted || !this.context) return;

        const now = this.context.currentTime;
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);

        gain.gain.setValueAtTime(this.masterVolume * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.connect(gain);
        gain.connect(this.context.destination);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    // Play collect sound (item pickup)
    playCollect(points) {
        if (!this.enabled || this.muted || !this.context) return;

        const now = this.context.currentTime;
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        // Higher pitch for higher value items
        const baseFreq = points > 20 ? 600 : 500;

        osc.type = 'square';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.1);

        gain.gain.setValueAtTime(this.masterVolume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        osc.connect(gain);
        gain.connect(this.context.destination);

        osc.start(now);
        osc.stop(now + 0.2);
    }

    // Play hit sound (collision)
    playHit() {
        if (!this.enabled || this.muted || !this.context) return;

        const now = this.context.currentTime;
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);

        gain.gain.setValueAtTime(this.masterVolume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        osc.connect(gain);
        gain.connect(this.context.destination);

        osc.start(now);
        osc.stop(now + 0.3);
    }

    // Play score milestone sound
    playMilestone() {
        if (!this.enabled || this.muted || !this.context) return;

        const now = this.context.currentTime;

        // Play a chord
        const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5

        frequencies.forEach((freq, i) => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            const delay = i * 0.05;
            gain.gain.setValueAtTime(0, now + delay);
            gain.gain.linearRampToValueAtTime(this.masterVolume * 0.2, now + delay + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.4);

            osc.connect(gain);
            gain.connect(this.context.destination);

            osc.start(now + delay);
            osc.stop(now + delay + 0.4);
        });
    }

    // Background ambient sound (subtle underwater effect)
    playAmbient() {
        if (!this.enabled || this.muted || !this.context) return;

        // Create a subtle low-frequency oscillator for underwater ambience
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        const filter = this.context.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.value = 60;

        filter.type = 'lowpass';
        filter.frequency.value = 200;

        gain.gain.value = this.masterVolume * 0.05;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.context.destination);

        osc.start();

        // Store reference to stop later if needed
        this.ambientOsc = osc;
        this.ambientGain = gain;
    }

    stopAmbient() {
        if (this.ambientOsc) {
            this.ambientOsc.stop();
            this.ambientOsc = null;
        }
    }

    // Toggle mute
    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }

    // Set master volume
    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
}

// Create global audio manager instance
const audioManager = new AudioManager();
