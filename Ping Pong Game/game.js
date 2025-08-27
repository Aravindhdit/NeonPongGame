const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game settings
const paddleWidth = 12, paddleHeight = 90;
const ballRadius = 9;
const playerX = 30;
const aiX = canvas.width - paddleWidth - 30;

let playerY = (canvas.height - paddleHeight) / 2;
let aiY = (canvas.height - paddleHeight) / 2;
let playerScore = 0;
let aiScore = 0;

// Neon colors
const neonBlue = '#0ff6fc';
const neonPink = '#ff18a6';
const neonPurple = '#a259ff';
const neonYellow = '#fff700';

// Ball object
let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    vx: 5 * (Math.random() > 0.5 ? 1 : -1),
    vy: 3 * (Math.random() * 2 - 1),
    radius: ballRadius
};

function drawNeonRect(x, y, w, h, color) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    ctx.restore();
}

function drawNeonBall(x, y, r, color) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 24;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawNeonLine(x1, y1, x2, y2, color, width = 4, glow = 18) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = glow;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw glowing midline
    for (let i = 0; i < canvas.height; i += 34) {
        drawNeonLine(canvas.width / 2, i, canvas.width / 2, i + 18,
            neonPurple, 4, 16);
    }

    // Draw paddles
    drawNeonRect(playerX, playerY, paddleWidth, paddleHeight, neonBlue);
    drawNeonRect(aiX, aiY, paddleWidth, paddleHeight, neonPink);

    // Draw ball
    drawNeonBall(ball.x, ball.y, ball.radius, neonYellow);
}

function moveBall() {
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Collision with top/bottom walls
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy *= -1;
    }
    if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
        ball.vy *= -1;
    }

    // Collision with player paddle
    if (
        ball.x - ball.radius < playerX + paddleWidth &&
        ball.y > playerY &&
        ball.y < playerY + paddleHeight
    ) {
        ball.x = playerX + paddleWidth + ball.radius;
        ball.vx *= -1.08; // Faster after hit
        let hitPos = (ball.y - (playerY + paddleHeight / 2)) / (paddleHeight / 2);
        ball.vy += hitPos * 2.4;
        playBounceSound();
    }

    // Collision with AI paddle
    if (
        ball.x + ball.radius > aiX &&
        ball.y > aiY &&
        ball.y < aiY + paddleHeight
    ) {
        ball.x = aiX - ball.radius;
        ball.vx *= -1.08;
        let hitPos = (ball.y - (aiY + paddleHeight / 2)) / (paddleHeight / 2);
        ball.vy += hitPos * 2.4;
        playBounceSound();
    }

    // Score logic
    if (ball.x < 0) {
        aiScore++;
        updateScore();
        resetBall(-1);
    }
    if (ball.x > canvas.width) {
        playerScore++;
        updateScore();
        resetBall(1);
    }
}

function resetBall(direction = 1) {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.vx = direction * (4 + Math.random() * 2);
    ball.vy = (Math.random() * 4 - 2);
}

function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('aiScore').textContent = aiScore;
}

function moveAI() {
    const aiCenter = aiY + paddleHeight / 2;
    const reaction = 0.16 + Math.random() * 0.06; // Add some hesitance
    const target = ball.y;
    aiY += (target - aiCenter) * reaction;

    // Clamp to canvas
    if (aiY < 0) aiY = 0;
    if (aiY + paddleHeight > canvas.height)
        aiY = canvas.height - paddleHeight;
}

// Paddle follows mouse
canvas.addEventListener('mousemove', function (e) {
    const rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    playerY = mouseY - paddleHeight / 2;
    if (playerY < 0) playerY = 0;
    if (playerY + paddleHeight > canvas.height)
        playerY = canvas.height - paddleHeight;
});

// Retro bounce sound (Web Audio API, no assets needed)
let audioCtx;
function playBounceSound() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = "triangle";
    o.frequency.value = 220 + Math.random() * 80;
    g.gain.value = 0.17;
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    o.frequency.linearRampToValueAtTime(110, audioCtx.currentTime + 0.08);
    g.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.12);
    o.stop(audioCtx.currentTime + 0.13);
}

function gameLoop() {
    moveBall();
    moveAI();
    draw();
    requestAnimationFrame(gameLoop);
}

// Initialize
draw();
updateScore();
gameLoop();