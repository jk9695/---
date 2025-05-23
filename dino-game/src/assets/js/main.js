let game;

window.addEventListener('load', () => {
    game = new Game();
    gameLoop();
});

function gameLoop() {
    game.update();
    game.draw();
    requestAnimationFrame(gameLoop);
}