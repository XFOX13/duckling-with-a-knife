// ============================================
// DUCKLING WITH A KNIFE - RPG VERSION
// ============================================

// Game State
const GameState = {
    PLAYING: 'playing',
    SHOP: 'shop',
    DEAD: 'dead',
    SLEEPING: 'sleeping'
};

let currentState = GameState.PLAYING;
let gameTime = 0; // In-game hours (0-23)
let isDay = true;

// Player Stats
const player = {
    x: 400,
    y: 250,
    width: 32,
    height: 32,
    speed: 3,
    health: 100,
    maxHealth: 100,
    bread: 0,
    knifeLevel: 1,
    knifeDamage: 10,
    atHome: false
};

// Houses
const houses = [
    { x: 100, y: 100, width: 64, height: 64, isPlayersHome: true }
];

// Enemies
const enemies = [];
const bosses = [];

// Shop items
const shopItems = [
    { name: "Sharp Knife", cost: 50, type: "damage", value: 5, description: "+5 Damage" },
    { name: "Health Potion", cost: 30, type: "health", value: 50, description: "Restore 50 HP" },
    { name: "Better Handle", cost: 80, type: "speed", value: 1, description: "+1 Speed" },
    { name: "Knife Upgrade", cost: 150, type: "level", value: 1, description: "Knife Level +1" }
];

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const healthValue = document.getElementById('healthValue');
const healthFill = document.getElementById('healthFill');
const breadValue = document.getElementById('breadValue');
const knifeLevel = document.getElementById('knifeLevel');
const timeDisplay = document.getElementById('timeDisplay');
const logMessages = document.getElementById('logMessages');

// Initialize game
function initGame() {
    // Create some enemies
    for (let i = 0; i < 5; i++) {
        enemies.push({
            x: Math.random() * (canvas.width - 50),
            y: Math.random() * (canvas.height - 50),
            width: 32,
            height: 32,
            health: 30,
            type: 'human',
            speed: 1,
            chasing: false
        });
    }
    
    // Create a boss
    bosses.push({
        x: 600,
        y: 100,
        width: 64,
        height: 64,
        health: 200,
        type: 'bread_boss',
        breadReward: 100,
        name: "Bread Guardian"
    });
    
    updateUI();
    addLog("Game started! Find the Bread Boss near the lake.");
}

// Update UI
function updateUI() {
    healthValue.textContent = player.health;
    healthFill.style.width = `${(player.health / player.maxHealth) * 100}%`;
    breadValue.textContent = player.bread;
    knifeLevel.textContent = player.knifeLevel;
    
    // Time display
    const hour = Math.floor(gameTime);
    timeDisplay.textContent = isDay ? `Day (${hour}:00)` : `Night (${hour}:00)`;
    
    // Change health bar color based on health
    if (player.health < 30) {
        healthFill.style.background = '#e74c3c';
    } else if (player.health < 60) {
        healthFill.style.background = '#f39c12';
    } else {
        healthFill.style.background = '#2ecc71';
    }
}

// Add message to log
function addLog(message) {
    const p = document.createElement('p');
    p.textContent = `[${getTimeString()}] ${message}`;
    logMessages.prepend(p);
    
    // Keep only last 5 messages
    if (logMessages.children.length > 5) {
        logMessages.removeChild(logMessages.lastChild);
    }
}

// Get time string
function getTimeString() {
    const hour = Math.floor(gameTime);
    return `${hour.toString().padStart(2, '0')}:00`;
}

// Draw player (duckling)
function drawPlayer() {
    // Body
    ctx.fillStyle = '#FFEB3B';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Head
    ctx.fillStyle = '#FFF176';
    ctx.fillRect(player.x + 20, player.y - 8, 24, 32);
    
    // Beak
    ctx.fillStyle = '#FF9800';
    ctx.fillRect(player.x + 40, player.y + 8, 12, 8);
    
    // Eye
    ctx.fillStyle = 'black';
    ctx.fillRect(player.x + 32, player.y + 4, 4, 4);
    
    // Knife (size based on level)
    const knifeLength = 15 + (player.knifeLevel * 3);
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(player.x + 25, player.y + 15, knifeLength, 4);
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(player.x + 20, player.y + 13, 5, 8);
    
    // Draw player name
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.fillText('Duckling', player.x - 10, player.y - 5);
}

// Draw houses
function drawHouses() {
    houses.forEach(house => {
        // House base
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(house.x, house.y, house.width, house.height);
        
        // Roof
        ctx.fillStyle = '#A52A2A';
        ctx.beginPath();
        ctx.moveTo(house.x - 10, house.y);
        ctx.lineTo(house.x + house.width/2, house.y - 20);
        ctx.lineTo(house.x + house.width + 10, house.y);
        ctx.closePath();
        ctx.fill();
        
        // Door
        ctx.fillStyle = '#654321';
        ctx.fillRect(house.x + 25, house.y + 30, 15, 34);
        
        // Window
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(house.x + 10, house.y + 15, 12, 12);
        ctx.fillStyle = '#000';
        ctx.fillRect(house.x + 10, house.y + 21, 12, 1);
        ctx.fillRect(house.x + 16, house.y + 15, 1, 12);
        
        // Label
        if (house.isPlayersHome) {
            ctx.fillStyle = 'gold';
            ctx.font = '10px Arial';
            ctx.fillText('YOUR HOUSE', house.x, house.y - 25);
        }
    });
}

// Draw enemies
function drawEnemies() {
    enemies.forEach(enemy => {
        // Human body
        ctx.fillStyle = '#3498db';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // Head
        ctx.fillStyle = '#FFCCBC';
        ctx.fillRect(enemy.x + 6, enemy.y - 12, 20, 20);
        
        // Eyes (angry!)
        ctx.fillStyle = 'red';
        ctx.fillRect(enemy.x + 10, enemy.y - 6, 3, 3);
        ctx.fillRect(enemy.x + 19, enemy.y - 6, 3, 3);
        
        // Label
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.fillText('Human', enemy.x - 5, enemy.y - 15);
        
        // Health bar
        if (enemy.health < 30) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
            ctx.fillRect(enemy.x, enemy.y - 5, (enemy.health / 30) * 32, 3);
        }
    });
    
    // Draw bosses
    bosses.forEach(boss => {
        // Boss body (big bread!)
        ctx.fillStyle = '#D35400';
        ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
        
        // Bread texture
        ctx.fillStyle = '#F39C12';
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                ctx.fillRect(boss.x + 5 + (i * 15), boss.y + 5 + (j * 15), 10, 10);
            }
        }
        
        // Angry face
        ctx.fillStyle = 'black';
        ctx.fillRect(boss.x + 20, boss.y + 20, 8, 8); // Left eye
        ctx.fillRect(boss.x + 36, boss.y + 20, 8, 8); // Right eye
        ctx.fillRect(boss.x + 24, boss.y + 35, 16, 5); // Angry mouth
        
        // Boss name and health
        ctx.fillStyle = 'gold';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(boss.name, boss.x - 20, boss.y - 10);
        
        // Health bar
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(boss.x, boss.y - 5, boss.width, 5);
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(boss.x, boss.y - 5, (boss.health / 200) * boss.width, 5);
    });
}

// Draw lake
function drawLake() {
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.ellipse(150, 150, 100, 60, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#2980b9';
    ctx.beginPath();
    ctx.ellipse(150, 150, 80, 50, 0, 0, Math.PI * 2);
    ctx.fill();
}

// Draw grass/ground
function drawGround() {
    // Grass
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Path to house
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(180, 130, 400, 20);
    
    // Draw some trees
    for (let i = 0; i < 10; i++) {
        const x = 50 + (i % 5) * 150;
        const y = 300 + Math.floor(i / 5) * 150;
        
        // Tree trunk
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x, y, 15, 40);
        
        // Leaves
        ctx.fillStyle = '#2ecc71';
        ctx.beginPath();
        ctx.arc(x + 7, y - 10, 25, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Check collision
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Attack function
function attack() {
    if (currentState !== GameState.PLAYING) return;
    
    addLog("🔪 You swing your knife!");
    
    // Check enemy hits
    let hitSomething = false;
    
    enemies.forEach((enemy, index) => {
        if (checkCollision(player, enemy)) {
            enemy.health -= player.knifeDamage;
            addLog(`You hit a human for ${player.knifeDamage} damage!`);
            
            if (enemy.health <= 0) {
                enemies.splice(index, 1);
                addLog("Human defeated! (No bread from humans)");
            }
            hitSomething = true;
        }
    });
    
    // Check boss hits
    bosses.forEach(boss => {
        if (checkCollision(player, boss)) {
            boss.health -= player.knifeDamage;
            addLog(`You hit ${boss.name} for ${player.knifeDamage} damage!`);
            
            if (boss.health <= 0) {
                player.bread += boss.breadReward;
                addLog(`🎉 ${boss.name} defeated! You got ${boss.breadReward} bread!`);
                bosses.splice(bosses.indexOf(boss), 1);
                
                // Respawn boss after 30 seconds
                setTimeout(() => {
                    bosses.push({
                        x: 600,
                        y: 100,
                        width: 64,
                        height: 64,
                        health: 200,
                        type: 'bread_boss',
                        breadReward: 100,
                        name: "Bread Guardian"
                    });
                    addLog("⚠️ The Bread Guardian has respawned!");
                }, 30000);
            }
            hitSomething = true;
        }
    });
    
    if (!hitSomething) {
        addLog("You swung at the air...");
    }
    
    updateUI();
}

// Quack function (scare enemies)
function quack() {
    if (currentState !== GameState.PLAYING) return;
    
    addLog("🦆 QUACK!!! Enemies are scared!");
    
    // Push enemies away
    enemies.forEach(enemy => {
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
            enemy.x += (dx / distance) * 50;
            enemy.y += (dy / distance) * 50;
            enemy.chasing = false;
        }
    });
}

// Sleep function (go home and rest)
function sleep() {
    // Check if player is at home
    const atHome = houses.some(house => 
        house.isPlayersHome && checkCollision(player, house)
    );
    
    if (!atHome) {
        addLog("You need to go home to sleep! (Your house is by the lake)");
        return;
    }
    
    player.atHome = true;
    currentState = GameState.SLEEPING;
    addLog("💤 You go to sleep in your house...");
    
    // Heal player and advance time
    setTimeout(() => {
        player.health = player.maxHealth;
        gameTime = 8; // Wake up at 8 AM
        isDay = true;
        player.atHome = false;
        currentState = GameState.PLAYING;
        addLog("☀️ You wake up feeling refreshed! Health restored.");
        updateUI();
    }, 2000);
}

// Shop function
function openShop() {
    if (currentState !== GameState.PLAYING) return;
    
    currentState = GameState.SHOP;
    addLog("=== SHOP ===");
    shopItems.forEach(item => {
        addLog(`${item.name}: ${item.cost} bread - ${item.description}`);
    });
    addLog("Click an item to buy (will implement soon!)");
    addLog("Press ESC to leave shop");
    
    // TODO: Implement shop UI
}

// Update game time
function updateTime() {
    gameTime += 0.01; // 1 minute per frame at 60fps
    
    if (gameTime >= 24) {
        gameTime = 0;
    }
    
    // Day/night cycle
    isDay = gameTime >= 6 && gameTime < 20;
    
    // Update time display every 10 seconds
    if (Math.floor(gameTime * 60) % 600 === 0) {
        updateUI();
    }
}

// Enemy AI
function updateEnemies() {
    enemies.forEach(enemy => {
        // Chase player if close
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
            enemy.chasing = true;
        }
        
        if (enemy.chasing && distance > 20) {
            enemy.x += (dx / distance) * enemy.speed;
            enemy.y += (dy / distance) * enemy.speed;
        }
        
        // Damage player if touching
        if (checkCollision(player, enemy)) {
            player.health -= 2;
            addLog("💢 Human attacked you! -2 HP");
            updateUI();
            
            // Check death
            if (player.health <= 0) {
                playerDie();
            }
        }
    });
}

// Player death
function playerDie() {
    currentState = GameState.DEAD;
    addLog("💀 YOU DIED!");
    addLog("All your bread is lost...");
    
    // Reset but keep knife level (roguelike style)
    player.health = player.maxHealth;
    player.bread = 0;
    player.x = 400;
    player.y = 250;
    
    // Clear enemies and respawn
    enemies.length = 0;
    for (let i = 0; i < 5; i++) {
        enemies.push({
            x: Math.random() * (canvas.width - 50),
            y: Math.random() * (canvas.height - 50),
            width: 32,
            height: 32,
            health: 30,
            type: 'human',
            speed: 1,
            chasing: false
        });
    }
    
    setTimeout(() => {
        currentState = GameState.PLAYING;
        addLog("You respawn at the lake. Try again!");
    }, 3000);
    
    updateUI();
}

// Game loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw game world
    drawGround();
    drawLake();
    drawHouses();
    drawEnemies();
    drawPlayer();
    
    // Update game systems
    if (currentState === GameState.PLAYING) {
        updateTime();
        updateEnemies();
    }
    
    // Draw time of day overlay
    if (!isDay) {
        ctx.fillStyle = 'rgba(0, 0, 50, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw moon
        ctx.fillStyle = '#ecf0f1';
        ctx.beginPath();
        ctx.arc(700, 50, 20, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Draw state indicator
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText(`State: ${currentState}`, 10, 30);
    ctx.fillText(`Home: ${player.atHome ? "Yes" : "No"}`, 10, 50);
    
    requestAnimationFrame(gameLoop);
}

// Keyboard controls
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    // Attack
    if (e.key === ' ' && currentState === GameState.PLAYING) {
        attack();
        e.preventDefault();
    }
    
    // Quack
    if (e.key === 'q' && currentState === GameState.PLAYING) {
        quack();
    }
    
    // Shop
    if (e.key === 'e' && currentState === GameState.PLAYING) {
        openShop();
    }
    
    // Sleep/Home
    if (e.key === 'h' && currentState === GameState.PLAYING) {
        sleep();
    }
    
    // Escape shop
    if (e.key === 'Escape' && currentState === GameState.SHOP) {
        currentState = GameState.PLAYING;
        addLog("Left the shop.");
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Movement update
function updateMovement() {
    if (currentState !== GameState.PLAYING) return;
    
    if (keys['w'] || keys['arrowup']) player.y -= player.speed;
    if (keys['s'] || keys['arrowdown']) player.y += player.speed;
    if (keys['a'] || keys['arrowleft']) player.x -= player.speed;
    if (keys['d'] || keys['arrowright']) player.x += player.speed;
    
    // Keep in bounds
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
}

// Button events
document.getElementById('attackBtn').addEventListener('click', attack);
document.getElementById('quackBtn').addEventListener('click', quack);
document.getElementById('shopBtn').addEventListener('click', openShop);
document.getElementById('sleepBtn').addEventListener('click', sleep);

// Update movement 60 times per second
setInterval(updateMovement, 16);

// Initialize and start game
initGame();
gameLoop();
console.log("🎮 Zelda-style RPG started!");
console.log("Find the Bread Boss by the lake!");
