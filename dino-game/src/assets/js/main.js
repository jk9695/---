let game;

function showLoadingScreen() {
    const loadingScreen = document.createElement('div');
    loadingScreen.id = 'loadingScreen';
    loadingScreen.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    loadingScreen.innerHTML = '載入中...';
    document.body.appendChild(loadingScreen);
}

window.addEventListener('load', () => {
    showLoadingScreen();
    game = new Game();
    
    // 當資源載入完成時，開始遊戲
    game.resources.onLoadComplete = () => {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.remove();
        }
        gameLoop();
    };
});

function gameLoop() {
    game.update();
    game.draw();
    requestAnimationFrame(gameLoop);
}