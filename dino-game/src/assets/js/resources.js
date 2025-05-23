class Resources {
    constructor() {
        this.images = {};
        this.sounds = {};
        this.totalResources = 0;
        this.loadedResources = 0;
        this.onLoadComplete = null;
    }

    // 載入所有資源
    loadAll(onComplete) {
        this.onLoadComplete = onComplete;

        // 圖片資源
        this.loadImage('dino', 'assets/images/dino.png');
        this.loadImage('dino-duck', 'assets/images/dino-duck.png');
        this.loadImage('dino-hurt', 'assets/images/dino-hurt.png');
        this.loadImage('cactus-small', 'assets/images/cactus-small.png');
        this.loadImage('cactus-big', 'assets/images/cactus-big.png');
        this.loadImage('bird', 'assets/images/bird.png');
        this.loadImage('cloud', 'assets/images/cloud.png');
        this.loadImage('ground', 'assets/images/ground.png');
        this.loadImage('moon', 'assets/images/moon.png');
        this.loadImage('star', 'assets/images/star.png');

        // 音效資源
        this.loadSound('jump', 'assets/sounds/jump.mp3');
        this.loadSound('hit', 'assets/sounds/hit.mp3');
        this.loadSound('point', 'assets/sounds/point.mp3');
    }

    loadImage(key, src) {
        this.totalResources++;
        const img = new Image();
        img.onload = () => this.onResourceLoad();
        img.src = src;
        this.images[key] = img;
    }

    loadSound(key, src) {
        this.totalResources++;
        const audio = new Audio();
        audio.addEventListener('canplaythrough', () => this.onResourceLoad());
        audio.src = src;
        this.sounds[key] = audio;
    }

    onResourceLoad() {
        this.loadedResources++;
        if (this.loadedResources === this.totalResources && this.onLoadComplete) {
            this.onLoadComplete();
        }
    }

    playSound(key) {
        if (this.sounds[key]) {
            this.sounds[key].currentTime = 0;
            this.sounds[key].play();
        }
    }
}
