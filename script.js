        // Game state variables
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const gameOverScreen = document.getElementById('gameOverScreen');
        const finalScoreEl = document.getElementById('finalScore');
        const newHighScoreEl = document.getElementById('newHighScore');
        const restartBtn = document.getElementById('restartBtn');

        let gameState = {
            score: 0,
            highScore: parseInt(localStorage.getItem('starGameHighScore')) || 0,
            timeLeft: 60,
            gameRunning: false,
            stars: [],
            basket: { x: 350, y: 550, width: 100, height: 30 },
            starSpeed: 2,
            lastSpeedIncrease: 0
        };

        const keys = { left: false, right: false };

        // Initialize game
        function initGame() {
            gameState.score = 0;
            gameState.timeLeft = 60;
            gameState.gameRunning = true;
            gameState.stars = [];
            gameState.basket.x = 350;
            gameState.starSpeed = 2;
            gameState.lastSpeedIncrease = 0;
            gameOverScreen.style.display = 'none';
            gameLoop();
        }

        // Main game loop
        function gameLoop() {
            if (!gameState.gameRunning) return;
            
            update();
            render();
            requestAnimationFrame(gameLoop);
        }

        // Update game logic
        function update() {
            // Update timer
            gameState.timeLeft -= 1/60;
            if (gameState.timeLeft <= 0) {
                endGame();
                return;
            }

            // Increase star speed every 15 seconds
            const elapsed = 60 - gameState.timeLeft;
            if (Math.floor(elapsed / 15) > gameState.lastSpeedIncrease) {
                gameState.starSpeed += 1;
                gameState.lastSpeedIncrease = Math.floor(elapsed / 15);
            }

            // Move basket
            if (keys.left && gameState.basket.x > 0) {
                gameState.basket.x -= 8;
            }
            if (keys.right && gameState.basket.x < canvas.width - gameState.basket.width) {
                gameState.basket.x += 8;
            }

            // Spawn new stars randomly
            if (Math.random() < 0.02) {
                gameState.stars.push({
                    x: Math.random() * (canvas.width - 30),
                    y: -30,
                    size: 15
                });
            }

            // Update stars
            updateStars();
        }

        // Update star positions and check collisions
        function updateStars() {
            for (let i = gameState.stars.length - 1; i >= 0; i--) {
                const star = gameState.stars[i];
                star.y += gameState.starSpeed;

                // Check collision with basket
                if (star.y + star.size > gameState.basket.y &&
                    star.y < gameState.basket.y + gameState.basket.height &&
                    star.x + star.size > gameState.basket.x &&
                    star.x < gameState.basket.x + gameState.basket.width) {
                    
                    gameState.score++;
                    gameState.stars.splice(i, 1);
                    continue;
                }

                // Remove stars that fell off screen
                if (star.y > canvas.height) {
                    gameState.stars.splice(i, 1);
                }
            }
        }

        // Render all game elements
        function render() {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            renderStars();
            renderBasket();
            renderUI();
        }

        // Draw all stars
        function renderStars() {
            ctx.fillStyle = '#ffd700';
            gameState.stars.forEach(star => {
                drawStar(star.x, star.y, star.size);
            });
        }

        // Draw a five-point star
        function drawStar(x, y, size) {
            const spikes = 5;
            const outerRadius = size;
            const innerRadius = size * 0.4;
            
            ctx.beginPath();
            for (let i = 0; i < spikes * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = (i * Math.PI) / spikes;
                const px = x + Math.cos(angle) * radius;
                const py = y + Math.sin(angle) * radius;
                
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
        }

        // Draw the basket
        function renderBasket() {
            const x = gameState.basket.x;
            const y = gameState.basket.y;
            const w = gameState.basket.width;
            const h = gameState.basket.height;
            
            // Create gradient for 3D effect
            const gradient = ctx.createLinearGradient(x, y, x + w, y + h);
            gradient.addColorStop(0, '#DEB887');
            gradient.addColorStop(0.3, '#D2B48C');
            gradient.addColorStop(0.7, '#CD853F');
            gradient.addColorStop(1, '#A0522D');
            
            // Basket bottom (curved)
            ctx.fillStyle = '#8B4513';
            ctx.beginPath();
            ctx.ellipse(x + w/2, y + h + 5, w/2, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Main basket body with curve
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(x + 10, y + h);
            ctx.quadraticCurveTo(x, y + h/2, x + 5, y + 10);
            ctx.lineTo(x + w - 5, y + 10);
            ctx.quadraticCurveTo(x + w, y + h/2, x + w - 10, y + h);
            ctx.closePath();
            ctx.fill();
            
            // Basket rim
            ctx.fillStyle = '#654321';
            ctx.beginPath();
            ctx.ellipse(x + w/2, y + 8, w/2 - 2, 4, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner rim highlight
            ctx.fillStyle = '#DEB887';
            ctx.beginPath();
            ctx.ellipse(x + w/2, y + 6, w/2 - 8, 2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Wicker weave pattern - vertical strips
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            
            for (let i = 0; i < 8; i++) {
                const stripX = x + 12 + (i * (w - 24) / 7);
                ctx.beginPath();
                ctx.moveTo(stripX, y + 12);
                ctx.quadraticCurveTo(stripX - 2, y + h/2, stripX, y + h - 5);
                ctx.stroke();
            }
            
            // Horizontal weave rings
            ctx.strokeStyle = '#A0522D';
            ctx.lineWidth = 2;
            
            for (let i = 0; i < 4; i++) {
                const ringY = y + 15 + (i * (h - 20) / 3);
                const ringWidth = w - 10 - (i * 4);
                const ringX = x + 5 + (i * 2);
                
                ctx.beginPath();
                ctx.ellipse(ringX + ringWidth/2, ringY, ringWidth/2, 3, 0, 0, Math.PI);
                ctx.stroke();
            }
            
            // Basket handles with rope texture
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 6;
            ctx.lineCap = 'round';
            
            // Left handle
            ctx.beginPath();
            ctx.arc(x - 5, y + h/2, 15, Math.PI/4, -Math.PI/4);
            ctx.stroke();
            
            // Right handle  
            ctx.beginPath();
            ctx.arc(x + w + 5, y + h/2, 15, Math.PI - Math.PI/4, Math.PI + Math.PI/4);
            ctx.stroke();
            
            // Handle rope detail
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 2;
            
            // Left handle rope lines
            ctx.beginPath();
            ctx.arc(x - 5, y + h/2, 15, Math.PI/4, -Math.PI/4);
            ctx.stroke();
            
            // Right handle rope lines
            ctx.beginPath();
            ctx.arc(x + w + 5, y + h/2, 15, Math.PI - Math.PI/4, Math.PI + Math.PI/4);
            ctx.stroke();
            
            // Basket shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.beginPath();
            ctx.ellipse(x + w/2, y + h + 8, w/2 + 5, 3, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner basket depth
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.ellipse(x + w/2, y + 12, w/2 - 10, 8, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw UI elements
        function renderUI() {
            ctx.fillStyle = 'white';
            ctx.font = '24px Arial';
            ctx.fillText(`Score: ${gameState.score}`, 20, 40);
            ctx.fillText(`High Score: ${gameState.highScore}`, canvas.width - 200, 40);
            ctx.fillText(`Time: ${Math.ceil(gameState.timeLeft)}s`, 20, canvas.height - 20);
            ctx.fillText(`Speed: ${gameState.starSpeed}`, canvas.width - 120, canvas.height - 20);
        }

        // End the game
        function endGame() {
            gameState.gameRunning = false;
            
            // Check for new high score
            let isNewHighScore = false;
            if (gameState.score > gameState.highScore) {
                gameState.highScore = gameState.score;
                localStorage.setItem('starGameHighScore', gameState.highScore);
                isNewHighScore = true;
            }
            
            // Show game over screen
            finalScoreEl.textContent = `Final Score: ${gameState.score}`;
            newHighScoreEl.style.display = isNewHighScore ? 'block' : 'none';
            gameOverScreen.style.display = 'flex';
        }

        // Event listeners
        document.addEventListener('keydown', (e) => {
            if (e.code === 'ArrowLeft') keys.left = true;
            if (e.code === 'ArrowRight') keys.right = true;
        });

        document.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowLeft') keys.left = false;
            if (e.code === 'ArrowRight') keys.right = false;
        });

        restartBtn.addEventListener('click', initGame);

        // Start the game
        initGame();