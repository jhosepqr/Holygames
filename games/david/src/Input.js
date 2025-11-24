export class Input {
    constructor(container) {
        this.container = container;
        this.isLocked = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.isMouseDown = false;

        // Movement keys
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false
        };

        this.setupListeners();
    }

    setupListeners() {
        document.addEventListener('pointerlockchange', () => {
            this.isLocked = document.pointerLockElement === this.container;
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isLocked) {
                this.mouseX = e.movementX;
                this.mouseY = e.movementY;
            }
        });

        document.addEventListener('mousedown', (e) => {
            if (this.isLocked && e.button === 0) {
                this.isMouseDown = true;
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (this.isLocked && e.button === 0) {
                this.isMouseDown = false;
            }
        });

        document.addEventListener('keydown', (e) => {
            switch (e.key.toLowerCase()) {
                case 'w': this.keys.w = true; break;
                case 'a': this.keys.a = true; break;
                case 's': this.keys.s = true; break;
                case 'd': this.keys.d = true; break;
            }
        });

        document.addEventListener('keyup', (e) => {
            switch (e.key.toLowerCase()) {
                case 'w': this.keys.w = false; break;
                case 'a': this.keys.a = false; break;
                case 's': this.keys.s = false; break;
                case 'd': this.keys.d = false; break;
            }
        });
    }

    lockPointer() {
        this.container.requestPointerLock();
    }

    unlockPointer() {
        document.exitPointerLock();
    }

    getMovementDelta() {
        return {
            x: this.mouseX,
            y: this.mouseY
        };
    }

    resetMouseDelta() {
        this.mouseX = 0;
        this.mouseY = 0;
    }
}
