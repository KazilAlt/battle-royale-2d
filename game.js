const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const menu = document.getElementById('menu');

const keys = {};
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

const music = new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_8311d1c651.mp3');
music.loop = true;
music.volume = 0.3;

const shootSound = new Audio('https://cdn.pixabay.com/audio/2023/03/19/audio_eec944e3f6.mp3');
const enemyDeathSound = new Audio('https://cdn.pixabay.com/audio/2022/10/03/audio_1658b816b2.mp3');

let player, enemies, safeZone, bullets, playing = false;

function startGame() {
  menu.style.display = 'none';
  music.play();
  playing = true;
  resetGame();
  gameLoop();
}

function resetGame() {
  player = {
    x: 400, y: 300, size: 20, color: 'deepskyblue',
    speed: 3, health: 100, bullets: []
  };
  bullets = [];

  enemies = [];
  for (let i = 0; i < 10; i++) {
    enemies.push({
      x: Math.random() * 800,
      y: Math.random() * 600,
      size: 20,
      color: 'red',
      alive: true
    });
  }

  safeZone = { x: 400, y: 300, radius: 300, shrinkRate: 0.1 };
}
function drawBackground() {
  const grd = ctx.createLinearGradient(0, 0, 0, 600);
  grd.addColorStop(0, '#003');
  grd.addColorStop(1, '#030');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.size, player.size);
}

function movePlayer() {
  if (keys['ArrowUp']) player.y -= player.speed;
  if (keys['ArrowDown']) player.y += player.speed;
  if (keys['ArrowLeft']) player.x -= player.speed;
  if (keys['ArrowRight']) player.x += player.speed;
}

function shootBullet() {
  shootSound.currentTime = 0;
  shootSound.play();
  bullets.push({ x: player.x + player.size / 2, y: player.y, dy: -5 });
}

document.addEventListener('keydown', e => {
  if (e.key === ' ' && playing) shootBullet();
});

function drawBullets() {
  ctx.fillStyle = 'yellow';
  bullets.forEach(b => ctx.fillRect(b.x, b.y, 4, 10));
}

function updateBullets() {
  bullets.forEach(b => b.y += b.dy);
  bullets = bullets.filter(b => b.y > 0);
}

function drawEnemies() {
  enemies.forEach(e => {
    if (e.alive) {
      ctx.fillStyle = e.color;
      ctx.fillRect(e.x, e.y, e.size, e.size);
    }
  });
}

function checkCollisions() {
  bullets.forEach(bullet => {
    enemies.forEach(enemy => {
      if (enemy.alive &&
        bullet.x < enemy.x + enemy.size &&
        bullet.x + 4 > enemy.x &&
        bullet.y < enemy.y + enemy.size &&
        bullet.y + 10 > enemy.y) {
          enemy.alive = false;
          enemyDeathSound.currentTime = 0;
          enemyDeathSound.play();
      }
    });
  });
}
function moveEnemies() {
  enemies.forEach(e => {
    if (!e.alive) return;
    let dx = player.x - e.x;
    let dy = player.y - e.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      e.x += dx / dist * 1.2;
      e.y += dy / dist * 1.2;
    }

    if (
      player.x < e.x + e.size &&
      player.x + player.size > e.x &&
      player.y < e.y + e.size &&
      player.y + player.size > e.y
    ) {
      player.health -= 0.4;
    }
  });
}

function drawSafeZone() {
  ctx.beginPath();
  ctx.arc(safeZone.x, safeZone.y, safeZone.radius, 0, 2 * Math.PI);
  ctx.strokeStyle = '#0ff';
  ctx.lineWidth = 3;
  ctx.stroke();
}

function shrinkSafeZone() {
  if (safeZone.radius > 30) {
    safeZone.radius -= safeZone.shrinkRate;
  }

  let dx = player.x + player.size / 2 - safeZone.x;
  let dy = player.y + player.size / 2 - safeZone.y;
  let dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > safeZone.radius) {
    player.health -= 0.2;
  }
}

function drawHUD() {
  ctx.fillStyle = 'white';
  ctx.font = '16px Arial';
  ctx.fillText(`Vida: ${Math.floor(player.health)}%`, 20, 30);
  ctx.fillText(`Enemigos: ${enemies.filter(e => e.alive).length}`, 20, 50);
}

function drawHealthBar() {
  ctx.fillStyle = 'red';
  ctx.fillRect(20, 60, 200, 20);
  ctx.fillStyle = 'lime';
  ctx.fillRect(20, 60, 2 * player.health, 20);
  ctx.strokeStyle = 'white';
  ctx.strokeRect(20, 60, 200, 20);
}

function gameOverScreen(text) {
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.font = '48px Arial';
  ctx.fillText(text, 280, 300);
  ctx.font = '24px Arial';
  ctx.fillText('Presiona R para reiniciar', 270, 350);
}

document.addEventListener('keydown', e => {
  if (e.key === 'r' && !playing) {
    menu.style.display = 'flex';
    music.currentTime = 0;
  }
});

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  if (player.health <= 0) {
    gameOverScreen('Game Over');
    playing = false;
    return;
  }

  if (enemies.every(e => !e.alive)) {
    gameOverScreen('¡Ganaste!');
    playing = false;
    return;
  }

  drawSafeZone();
  shrinkSafeZone();
  movePlayer();
  moveEnemies();
  updateBullets();
  checkCollisions();

  drawPlayer();
  drawBullets();
  drawEnemies();
  drawHUD();
  drawHealthBar();

  requestAnimationFrame(gameLoop);
}
