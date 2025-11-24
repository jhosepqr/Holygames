export class Audio {
    constructor() {
        this.sounds = {};
        this.enabled = true;

        // Placeholder for sound loading
        // In a real implementation, we would load audio files here
    }

    play(soundName) {
        if (!this.enabled) return;

        // Simple console log for now until we have assets
        // console.log(`Playing sound: ${soundName}`);

        // Example implementation if we had files:
        // if (this.sounds[soundName]) {
        //     this.sounds[soundName].currentTime = 0;
        //     this.sounds[soundName].play();
        // }
    }
}
