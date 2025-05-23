class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 300;
        
        this.resources = new Resources();
        this.isResourcesLoaded = false;
        
        // 初始化遊戲狀態
        this.dino = {
            x: 50,
            y: this.canvas.height - 60,
            width: 50,
            height: 50,
            velocityY: 0,
            isJumping: false,
            isDucking: false,
            frame: 0,
            animationSpeed: 0.1
        };
        
        this.obstacles = [];
        this.clouds = [];
        this.stars = [];
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
        this.gameSpeed = 5;
        this.isGameOver = false;
        this.gravity = 0.8;
        this.jumpForce = -15;
        this.groundY = this.canvas.height - 10;
        
        // 日/夜循環系統
        this.isDayTime = true;
        this.dayNightCycle = 0;
        this.cycleDuration = 30000; // 30 秒一個循環
        
        // 載入資源
        this.resources.loadAll(() => {
            this.isResourcesLoaded = true;
            this.bindEvents();
            this.updateScore();
        });
    }

    bindEvents() {
        // 鍵盤控制
        document.addEventListener('keydown', (e) => {
            if ((e.code === 'Space' || e.code === 'ArrowUp') && !this.dino.isJumping) {
                this.jump();
            } else if (e.code === 'ArrowDown') {
                this.dino.isDucking = true;
                this.dino.height = 30; // 蹲下時降低高度
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowDown') {
                this.dino.isDucking = false;
                this.dino.height = 50; // 恢復正常高度
            }
        });

        // 觸控支援
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!this.dino.isJumping) {
                this.jump();
            }
        });

        // 重新開始按鈕
        document.getElementById('restartButton').addEventListener('click', () => {
            this.restart();
        });
    }

    jump() {
        if (!this.dino.isJumping) {
            this.dino.velocityY = this.jumpForce;
            this.dino.isJumping = true;
            this.resources.playSound('jump');
        }
    }

    updateScore() {
        const currentScore = Math.floor(this.score);
        document.getElementById('score').textContent = currentScore;
        document.getElementById('highScore').textContent = this.highScore;
        
        // 每 100 分播放得分音效
        if (currentScore > 0 && currentScore % 100 === 0) {
            this.resources.playSound('point');
            this.increaseGameSpeed();
        }
    }

    increaseGameSpeed() {
        this.gameSpeed += 0.5;
    }

    spawnObstacle() {
        if (Math.random() < 0.02) {
            const types = ['cactus-small', 'cactus-big', 'bird'];
            const type = types[Math.floor(Math.random() * types.length)];
            const isBird = type === 'bird';
            
            this.obstacles.push({
                x: this.canvas.width,
                y: isBird ? this.canvas.height - 100 : this.canvas.height - 60,
                width: 30,
                height: isBird ? 30 : 40,
                type: type
            });
        }
    }

    spawnCloud() {
        if (Math.random() < 0.01) {
            this.clouds.push({
                x: this.canvas.width,
                y: Math.random() * (this.canvas.height / 2),
                speed: this.gameSpeed * 0.5
            });
        }
    }

    spawnStar() {
        if (!this.isDayTime && Math.random() < 0.05) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * (this.canvas.height / 2),
                brightness: Math.random()
            });
        }
    }

    update() {
        if (!this.isResourcesLoaded || this.isGameOver) return;

        // 更新日/夜循環
        this.dayNightCycle = (this.dayNightCycle + 16.67) % this.cycleDuration;
        this.isDayTime = this.dayNightCycle < this.cycleDuration / 2;

        // 更新恐龍位置
        this.dino.velocityY += this.gravity;
        this.dino.y += this.dino.velocityY;
        this.dino.frame += this.dino.animationSpeed;

        // 地面碰撞檢測
        if (this.dino.y > this.canvas.height - 60) {
            this.dino.y = this.canvas.height - 60;
            this.dino.velocityY = 0;
            this.dino.isJumping = false;
        }

        // 更新障礙物
        this.spawnObstacle();
        this.obstacles = this.obstacles.filter(obstacle => {
            obstacle.x -= this.gameSpeed;
            return obstacle.x > -obstacle.width;
        });

        // 更新雲朵
        this.spawnCloud();
        this.clouds = this.clouds.filter(cloud => {
            cloud.x -= cloud.speed;
            return cloud.x > -50;
        });

        // 更新星星
        if (!this.isDayTime) {
            this.spawnStar();
        }

        // 碰撞檢測
        for (let obstacle of this.obstacles) {
            if (this.checkCollision(this.dino, obstacle)) {
                this.gameOver();
                return;
            }
        }

        // 更新分數
        this.score += 0.1;
        this.updateScore();
    }

    checkCollision(dino, obstacle) {
        // 考慮蹲下狀態的碰撞檢測
        const dinoHitbox = {
            x: dino.x + 5,
            y: dino.y + 5,
            width: dino.width - 10,
            height: dino.height - 10
        };

        return dinoHitbox.x < obstacle.x + obstacle.width &&
               dinoHitbox.x + dinoHitbox.width > obstacle.x &&
               dinoHitbox.y < obstacle.y + obstacle.height &&
               dinoHitbox.y + dinoHitbox.height > obstacle.y;
    }

    draw() {
        if (!this.isResourcesLoaded) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 繪製背景
        if (!this.isDayTime) {
            // 夜晚背景
            this.ctx.fillStyle = '#000033';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // 繪製月亮
            this.ctx.drawImage(this.resources.images['moon'], 
                this.canvas.width - 100, 50, 40, 40);
            
            // 繪製星星
            this.stars.forEach(star => {
                this.ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
                this.ctx.beginPath();
                this.ctx.arc(star.x, star.y, 2, 0, Math.PI * 2);
                this.ctx.fill();
            });
        } else {
            // 白天背景
            this.ctx.fillStyle = '#87CEEB';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // 繪製雲朵
        this.clouds.forEach(cloud => {
            this.ctx.drawImage(this.resources.images['cloud'], 
                cloud.x, cloud.y, 50, 30);
        });

        // 畫地面
        this.ctx.drawImage(this.resources.images['ground'], 
            0, this.groundY - 10, this.canvas.width, 20);

        // 畫恐龍
        const dinoImage = this.dino.isDucking ? 
            this.resources.images['dino-duck'] :
            this.resources.images['dino'];
        
        this.ctx.drawImage(
            this.isGameOver ? this.resources.images['dino-hurt'] : dinoImage,
            this.dino.x, this.dino.y, this.dino.width, this.dino.height
        );

        // 畫障礙物
        this.obstacles.forEach(obstacle => {
            this.ctx.drawImage(
                this.resources.images[obstacle.type],
                obstacle.x, obstacle.y, obstacle.width, obstacle.height
            );
        });
    }

    gameOver() {
        this.isGameOver = true;
        this.resources.playSound('hit');
        
        // 更新最高分
        if (this.score > this.highScore) {
            this.highScore = Math.floor(this.score);
            localStorage.setItem('highScore', this.highScore.toString());
        }
        
        document.querySelector('.game-over').classList.remove('hidden');
        document.getElementById('finalScore').textContent = Math.floor(this.score);
    }

    restart() {
        this.dino.y = this.canvas.height - 60;
        this.dino.velocityY = 0;
        this.dino.isJumping = false;
        this.dino.isDucking = false;
        this.dino.height = 50;
        this.obstacles = [];
        this.clouds = [];
        this.stars = [];
        this.score = 0;
        this.gameSpeed = 5;
        this.isGameOver = false;
        this.dayNightCycle = 0;
        document.querySelector('.game-over').classList.add('hidden');
    }
}