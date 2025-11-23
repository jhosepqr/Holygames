/* --- SYSTEM MANAGER --- */
let game; // Phaser game instance

function launchGame(gameId) {
  if (gameId === "peregrino") {
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("game-wrapper").style.display = "block";
    document.getElementById("game-ui").style.display = "flex";

    // Initialize Mobile Controls if needed
    if ("ontouchstart" in window) {
      document.getElementById("controls-overlay").style.display = "flex";
    }

    // Show Start Screen
    document.getElementById("start-screen").style.display = "block";

    // Init Canvas Size
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize Phaser Game
    const config = {
      type: Phaser.CANVAS,
      canvas: document.getElementById("gameCanvas"),
      width: 800, // 20*40
      height: 600, // 15*40
      scene: PeregrinoScene,
      physics: {
        default: "arcade",
        arcade: { debug: false },
      },
    };
    game = new Phaser.Game(config);

    // Ensure canvas has focus for input
    document.getElementById("gameCanvas").focus();
  } else if (gameId === "jonas") {
    // Navigate to Jonas game
    window.location.href = "games/jonas/index.html";
  }
}

function exitGame() {
  if (game) {
    game.destroy(true);
    game = null;
  }
  document.getElementById("game-wrapper").style.display = "none";
  document.getElementById("dashboard").style.display = "flex";
}

function resizeCanvas() {
  const cvs = document.getElementById("gameCanvas");
  const container = document.getElementById("game-wrapper");
  // Logic to keep pixel art aspect ratio or fill
  // For simplicity in this hybrid view, we center it

  const TILE = 40;
  const W = 20 * TILE;
  const H = 15 * TILE;

  // Check available space
  let scale = Math.min(container.clientWidth / W, container.clientHeight / H);
  if (scale > 1) scale = 1; // Don't pixelate too much

  // We will keep internal resolution but scale via CSS or just center
  // To keep logic simple, we stick to fixed canvas size but centered
  cvs.width = W;
  cvs.height = H;
  cvs.style.marginTop = (container.clientHeight - H) / 2 + "px";
}
