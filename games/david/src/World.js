import * as THREE from 'three';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.setupLights();
        this.setupGround();
        this.setupSky();
    }

    setupLights() {
        // Ambient light for general visibility
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Directional light (Sun)
        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(50, 100, 50);
        dirLight.castShadow = true;
        dirLight.shadow.camera.top = 50;
        dirLight.shadow.camera.bottom = -50;
        dirLight.shadow.camera.left = -50;
        dirLight.shadow.camera.right = 50;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        this.scene.add(dirLight);
    }

    setupGround() {
        // Sandy texture (procedural for now)
        const geometry = new THREE.PlaneGeometry(200, 200);
        const material = new THREE.MeshStandardMaterial({
            color: 0xE6C288, // Sand color
            roughness: 1,
            metalness: 0
        });

        const ground = new THREE.Mesh(geometry, material);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Add some random rocks/hills for detail
        const rockGeo = new THREE.DodecahedronGeometry(1, 0);
        const rockMat = new THREE.MeshStandardMaterial({ color: 0x888888 });

        for (let i = 0; i < 50; i++) {
            const rock = new THREE.Mesh(rockGeo, rockMat);
            const x = (Math.random() - 0.5) * 100;
            const z = (Math.random() - 0.5) * 100;
            // Keep center clear
            if (Math.abs(x) < 10 && Math.abs(z) < 10) continue;

            rock.position.set(x, 0.5, z);
            rock.scale.setScalar(1 + Math.random() * 2);
            rock.castShadow = true;
            rock.receiveShadow = true;
            this.scene.add(rock);
        }
    }

    setupSky() {
        // Simple sky color is handled by scene background
        // Could add clouds here later
    }
}
