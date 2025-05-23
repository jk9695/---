class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 300;
        
        this.dino = {
            x: 50,
            y: this.canvas.height - 60,
            width: 50,
            height: 50,
            velocityY: 0,
            isJumping: false
        };
        
        this.obstacles = [];
        this.score = 0;
        this.gameSpeed = 5;
        this.isGameOver = false;
        this.gravity = 0.8;
        this.jumpForce = -15;
        
        this.groundY = this.canvas.height - 10;
        
        this.bindEvents();
        this.updateScore();
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if ((e.code === 'Space' || e.code === 'ArrowUp') && !this.dino.isJumping) {
                this.jump();
            }
        });

        document.getElementById('restartButton').addEventListener('click', () => {
            this.restart();
        });
    }

    jump() {
        if (!this.dino.isJumping) {
            this.dino.velocityY = this.jumpForce;
            this.dino.isJumping = true;
        }
    }

    updateScore() {
        document.getElementById('score').textContent = Math.floor(this.score);
    }

    spawnObstacle() {
        if (Math.random() < 0.02) {
            this.obstacles.push({
                x: this.canvas.width,
                y: this.canvas.height - 60,
                width: 20,
                height: 40
            });
        }
    }

    update() {
        if (this.isGameOver) return;

        // 更新恐龍位置
        this.dino.velocityY += this.gravity;
        this.dino.y += this.dino.velocityY;

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
        return dino.x < obstacle.x + obstacle.width &&
               dino.x + dino.width > obstacle.x &&
               dino.y < obstacle.y + obstacle.height &&
               dino.y + dino.height > obstacle.y;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 畫地面
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.groundY);
        this.ctx.lineTo(this.canvas.width, this.groundY);
        this.ctx.strokeStyle = '#000';
        this.ctx.stroke();

        // 畫恐龍
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(this.dino.x, this.dino.y, this.dino.width, this.dino.height);

        // 畫障礙物
        this.ctx.fillStyle = '#666';
        this.obstacles.forEach(obstacle => {
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
    }

    gameOver() {
        this.isGameOver = true;
        document.querySelector('.game-over').classList.remove('hidden');
        document.getElementById('finalScore').textContent = Math.floor(this.score);
    }

    restart() {
        this.dino.y = this.canvas.height - 60;
        this.dino.velocityY = 0;
        this.dino.isJumping = false;
        this.obstacles = [];
        this.score = 0;
        this.isGameOver = false;
        document.querySelector('.game-over').classList.add('hidden');
    }
}