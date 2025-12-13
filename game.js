// ============================================
// DUCKLING WITH A KNIFE - MOBILE RPG
// ============================================

// Game State
let gameState = 'playing'; // playing, shopping, dead, sleeping
let gameTime = 8.0; // 8:00 AM start
let isDay = true;
let gameLoaded = false;

// Player Stats
const player = {
    x: 300,
    y: 200,
    width: 32,
    height: 32,
    speed: 3,
    health: 100,
    maxHealth: 100,
    bread: 0,
    knifeLevel: 1,
    knifeDamage: 10,
    atHome: false,
    direction: 'down'
};

// Game Objects
const houses = [
    { x: 100, y: 100, width: 64, height: 64, isPlayersHome: true }
];

const enemies = [];
const bosses = [];
const breadPieces = [];

// Shop Items
const shopItems = [
    { id: 1, name: "Sharp Knife", cost: 50, type: "damage", value: 5, description: "+5 Damage" },
    { id: 2, name: "Health Potion", cost: 30, type: "health", value: 50, description: "Restore 50 HP" },
    { id: 3, name: "Better Handle", cost: 80, type: "speed", value: 1, description: "+1 Speed" },
    { id: 4, name: "Knife Upgrade", cost: 150, type: "level", value: 1, description: "Knife Level +1" }
];

// Canvas Setup
let canvas, ctx;
let keys = {};

// Mobile input state
let mobileInput = {
    up: false,
    down: false,
    left: false,
    right: false
};

// Initialize Game
function initGame() {
    console.log('Initializing game...');
    
    // Get canvas
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas size to match screen
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Create initial game objects
    createInitialObjects();
    
    // Setup shop items
    setupShop();
    
    // Start game loop
    gameLoop();
    
    // Update UI
    updateUI();
    
    gameLoaded = true;
    console.log('Game initialized!');
}

// Resize canvas for mobile
function resizeCanvas() {
    const gameWrapper = document.querySelector('.game-wrapper');
    const hudHeight = document.querySelector('.game-hud').offsetHeight;
    const controlsHeight = document.querySelector('.mobile-controls').offsetHeight;
    
    const availableHeight = window.innerHeight - hudHeight - controlsHeight - 80;
    const availableWidth = window.innerWidth - 20;
    
    canvas.width = Math.min(availableWidth, 800);
    canvas.height = Math.min(availableHeight, 600);
    
    // Reposition player if needed
    player.x = Math.min(player.x, canvas.width - player.width);
    player.y = Math.min(player.y, canvas.height - player.height);
}

// Create initial game objects
function createInitialObjects() {
    // Create some enemies
    for (let i = 0; i < 3; i++) {
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
    
    // Create bread boss
    bosses.push({
        x: canvas.width - 150,
        y: 100,
        width: 64,
        height: 64,
        health: 200,
        maxHealth: 200,
        type: 'bread_boss',
        breadReward: 100,
        name: "Bread Guardian"
    });
    
    // Create some bread pieces (for decoration)
    for (let i = 0; i < 3; i++) {
        breadPieces.push({
            x: Math.random() * (canvas.width - 30),
            y: Math.random() * (canvas.height - 30),
            width: 20,
            height: 20,
            decorative: true
        });
    }
}

// Setup shop items
function setupShop() {
    const shopItemsContainer = document.getElementById('shopItems');
    shopItemsContainer.innerHTML = '';
    
    shopItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'shop-item';
        itemElement.innerHTML = `
            <div>
                <strong>${item.name}</strong><br>
                <small>${item.description}</small>
            </div>
            <div>
                🍞${item.cost}<br>
                <button class="buy-btn" onclick="buyItem(${item.id})" 
                        ${player.bread < item.cost ? 'disabled' : ''}>
                    BUY
                </button>
            </div>
        `;
        shopItemsContainer.appendChild(itemElement);
    });
}

// Update UI
function updateUI() {
    if (!gameLoaded) return;
    
    // Update health
    document.getElementById('healthValue').textContent = player.health;
    const healthPercent = (player.health / player.maxHealth) * 100;
    document.getElementById('healthFill').style.width = `${healthPercent}%`;
    
    // Update bread
    document.getElementById('breadValue').textContent = player.bread;
    
    // Update time
    const hour = Math.floor(gameTime);
    const minute = Math.floor((gameTime % 1) * 60);
    const timeString = `${isDay ? 'DAY' : 'NIGHT'} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    document.getElementById('timeDisplay').textContent = timeString;
    
    // Update shop buttons
    const buyButtons = document.querySelectorAll('.buy-btn');
    shopItems.forEach((item, index) => {
        if (buyButtons[index]) {
            buyButtons[index].disabled = player.bread < item.cost;
        }
    });
}

// Draw game
function drawGame() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background (grass)
    ctx.fillStyle = '#2a5c3d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw lake
    drawLake();
    
    // Draw houses
    drawHouses();
    
    // Draw bread pieces
    drawBreadPieces();
    
    // Draw enemies
    drawEnemies();
    
    // Draw bosses
    drawBosses();
    
    // Draw player
    drawPlayer();
    
    // Draw day/night overlay
    if (!isDay) {
        ctx.fillStyle = 'rgba(0, 0, 50, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

// Draw lake
function drawLake() {
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.ellipse(150, 150, 80, 60, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#2980b9';
    ctx.beginPath();
    ctx.ellipse(150, 150, 60, 45, 0, 0, Math.PI * 2);
    ctx.fill();
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
        
        // Label if player's home
        if (house.isPlayersHome) {
            ctx.fillStyle = 'gold';
            ctx.font = '12px Arial';
            ctx.fillText('HOME', house.x + 10, house.y - 10);
        }
    });
}

// Draw player
function drawPlayer() {
    // Body (duckling)
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
    
    // Knife (based on level)
    const knifeLength = 15 + (player.knifeLevel * 3);
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(player.x + 25, player.y + 15, knifeLength, 4);
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(player.x + 20, player.y + 13, 5, 8);
    
    // Draw direction indicator
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    if (player.direction === 'up') {
        ctx.moveTo(player.x + 16, player.y - 5);
        ctx.lineTo(player.x + 32, player.y - 15);
        ctx.lineTo(player.x + 48, player.y - 5);
    } else if (player.direction === 'down') {
        ctx.moveTo(player.x + 16, player.y + 37);
        ctx.lineTo(player.x + 32, player.y + 47);
        ctx.lineTo(player.x + 48, player.y + 37);
    } else if (player.direction === 'left') {
        ctx.moveTo(player.x - 5, player.y + 16);
        ctx.lineTo(player.x - 15, player.y + 32);
        ctx.lineTo(player.x - 5, player.y + 48);
    } else { // right
        ctx.moveTo(player.x + 37, player.y + 16);
        ctx.lineTo(player.x + 47, player.y + 32);
        ctx.lineTo(player.x + 37, player.y + 48);
    }
    ctx.closePath();
    ctx.fill();
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
        
        // Angry eyes
        ctx.fillStyle = 'red';
        ctx.fillRect(enemy.x + 10, enemy.y - 6, 3, 3);
        ctx.fillRect(enemy.x + 19, enemy.y - 6, 3, 3);
        
        // Health bar
        if (enemy.health < 30) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
            ctx.fillRect(enemy.x, enemy.y - 5, (enemy.health / 30) * 32, 3);
        }
    });
}

// Draw bosses
function drawBosses() {
    bosses.forEach(boss => {
        // Boss body (giant bread)
        ctx.fillStyle = '#D35400';
        ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
        
        // Bread texture
        ctx.fillStyle = '#F39C12';
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                ctx.fillRect(
                    boss.x + 5 + (i * 15),
                    boss.y + 5 + (j * 15),
                    10, 10
                );
            }
        }
        
        // Angry face
        ctx.fillStyle = 'black';
        ctx.fillRect(boss.x + 20, boss.y + 20, 8, 8);
        ctx.fillRect(boss.x + 36, boss.y + 20, 8, 8);
        ctx.fillRect(boss.x + 24, boss.y + 35, 16, 5);
        
        // Health bar
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(boss.x, boss.y - 8, boss.width, 6);
        ctx.fillStyle = '#2ecc71';
        const healthPercent = (boss.health / boss.maxHealth);
        ctx.fillRect(boss.x, boss.y - 8, boss.width * healthPercent, 6);
        
        // Name
        ctx.fillStyle = 'gold';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(boss.name, boss.x, boss.y - 15);
    });
}

// Draw bread pieces
function drawBreadPieces() {
    breadPieces.forEach(bread => {
        if (bread.decorative) {
            ctx.fillStyle = '#8D6E63';
            ctx.fillRect(bread.x, bread.y, bread.width, bread.height);
            ctx.fillStyle = '#FFECB3';
            ctx.fillRect(bread.x + 3, bread.y + 3, bread.width - 6, bread.height - 6);
        }
    });
}

// Check collision
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Update game time
function updateTime() {
    gameTime += 0.01; // 1 minute per frame at 60fps
    
    if (gameTime >= 24) {
        gameTime = 0;
    }
    
    // Day/night cycle (6 AM to 8 PM is day)
    isDay = gameTime >= 6 && gameTime < 20;
}

// Update enemies
function updateEnemies() {
    enemies.forEach((enemy, index) => {
        // Chase player if close
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
            enemy.chasing = true;
        }
        
        // Move towards player
        if (enemy.chasing && distance > 20) {
            enemy.x += (dx / distance) * enemy.speed;
            enemy.y += (dy / distance) * enemy.speed;
        }
        
        // Damage player if touching
        if (checkCollision(player, enemy)) {
            player.health -= 2;
            if (window.showMessage) {
                window.showMessage("Human attacked you! -2 HP");
            }
            updateUI();
            
            // Check death
            if (player.health <= 0) {
                playerDie();
            }
        }
        
        // Remove dead enemies
        if (enemy.health <= 0) {
            enemies.splice(index, 1);
        }
    });
}

// Update bosses
function updateBosses() {
    bosses.forEach(boss => {
        // Move boss randomly
        if (Math.random() < 0.02) {
            boss.x += (Math.random() - 0.5) * 4;
            boss.y += (Math.random() - 0.5) * 4;
            
            // Keep in bounds
            boss.x = Math.max(50, Math.min(canvas.width - boss.width - 50, boss.x));
            boss.y = Math.max(50, Math.min(canvas.height - boss.height - 50, boss.y));
        }
        
        // Damage player if touching
        if (checkCollision(player, boss)) {
            player.health -= 5;
            if (window.showMessage) {
                window.showMessage("Boss damaged you! -5 HP");
            }
            updateUI();
            
            if (player.health <= 0) {
                playerDie();
            }
        }
    });
}

// Player movement
function updatePlayer() {
    // Determine movement from mobile input
    if (mobileInput.up) {
        player.y -= player.speed;
        player.direction = 'up';
    }
    if (mobileInput.down) {
        player.y += player.speed;
        player.direction = 'down';
    }
    if (mobileInput.left) {
        player.x -= player.speed;
        player.direction = 'left';
    }
    if (mobileInput.right) {
        player.x += player.speed;
        player.direction = 'right';
    }
    
    // Keep player in bounds
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
    
    // Check if player is at home
    player.atHome = houses.some(house => 
        house.isPlayersHome && checkCollision(player, house)
    );
}

// Player attack
function attack() {
    if (gameState !== 'playing') return;
    
    if (window.showMessage) {
        window.showMessage("🔪 You attack with your knife!");
    }
    
    let hitSomething = false;
    
    // Check enemy hits
    enemies.forEach((enemy, index) => {
        if (checkCollision(player, enemy)) {
            enemy.health -= player.knifeDamage;
            hitSomething = true;
            
            if (enemy.health <= 0) {
                enemies.splice(index, 1);
                if (window.showMessage) {
                    window.showMessage("Human defeated!");
                }
            }
        }
    });
    
    // Check boss hits
    bosses.forEach((boss, index) => {
        if (checkCollision(player, boss)) {
            boss.health -= player.knifeDamage;
            hitSomething = true;
            
            if (window.showMessage) {
                window.showMessage(`Hit ${boss.name} for ${player.knifeDamage} damage!`);
            }
            
            if (boss.health <= 0) {
                player.bread += boss.breadReward;
                bosses.splice(index, 1);
                
                if (window.showMessage) {
                    window.showMessage(`🎉 ${boss.name} defeated! Got ${boss.breadReward} bread!`);
                }
                
                // Respawn boss after 30 seconds
                setTimeout(() => {
                    bosses.push({
                        x: canvas.width - 150,
                        y: 100,
                        width: 64,
                        height: 64,
                        health: 200,
                        maxHealth: 200,
                        type: 'bread_boss',
                        breadReward: 100,
                        name: "Bread Guardian"
                    });
                    if (window.showMessage) {
                        window.showMessage("⚠️ Bread Guardian has respawned!");
                    }
                }, 30000);
            }
        }
    });
    
    if (!hitSomething && window.showMessage) {
        window.showMessage("You swung at the air...");
    }
    
    updateUI();
}

// Player quack
function quack() {
    if (gameState !== 'playing') return;
    
    if (window.showMessage) {
        window.showMessage("🦆 QUACK! Enemies are scared!");
    }
    
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

// Player sleep
function sleep() {
    if (gameState !== 'playing') return;
    
    if (!player.atHome) {
        if (window.showMessage) {
            window.showMessage("Go to your house by the lake to sleep!");
        }
        return;
    }
    
    gameState = 'sleeping';
    if (window.showMessage) {
        window.showMessage("💤 Sleeping at home...");
    }
    
    // Heal player after sleep
    setTimeout(() => {
        player.health = player.maxHealth;
        gameTime = 8; // Wake up at 8 AM
        gameState = 'playing';
        if (window.showMessage) {
            window.showMessage("☀️ You wake up feeling refreshed!");
        }
        updateUI();
    }, 2000);
}

// Open shop
function openShop() {
    if (gameState !== 'playing') return;
    
    gameState = 'shopping';
    if (window.openShop) {
        window.openShop();
    }
}

// Buy item from shop
function buyItem(itemId) {
    const item = shopItems.find(i => i.id === itemId);
    if (!item || player.bread < item.cost) return;
    
    player.bread -= item.cost;
    
    switch(item.type) {
        case 'damage':
            player.knifeDamage += item.value;
            if (window.showMessage) {
                window.showMessage(`Knife damage increased to ${player.knifeDamage}!`);
            }
            break;
        case 'health':
            player.health = Math.min(player.maxHealth, player.health + item.value);
            if (window.showMessage) {
                window.showMessage(`Restored ${item.value} HP!`);
            }
            break;
        case 'speed':
            player.speed += item.value;
            if (window.showMessage) {
                window.showMessage(`Speed increased to ${player.speed}!`);
            }
            break;
        case 'level':
            player.knifeLevel += item.value;
            if (window.showMessage) {
                window.showMessage(`Knife upgraded to level ${player.knifeLevel}!`);
            }
            break;
    }
    
    updateUI();
    setupShop(); // Refresh shop
}

// Player death
function playerDie() {
    gameState = 'dead';
    
    if (window.showDeathScreen) {
        window.showDeathScreen();
    }
    
    // Lose all bread
    player.bread = 0;
    
    // Reset position
    player.x = 300;
    player.y = 200;
    player.health = player.maxHealth;
    
    // Clear enemies
    enemies.length = 0;
    createInitialObjects();
    
    updateUI();
}

// Respawn player
function respawn() {
    gameState = 'playing';
    
    if (window.hideDeathScreen) {
        window.hideDeathScreen();
    }
    
    if (window.showMessage) {
        window.showMessage("You respawn at the lake. Try again!");
    }
}

// Game loop
function gameLoop() {
    if (gameState === 'playing') {
        updatePlayer();
        updateTime();
        updateEnemies();
        updateBosses();
    }
    
    drawGame();
    updateUI();
    
    requestAnimationFrame(gameLoop);
}

// Handle mobile input
function handleMobileInput(direction, pressed) {
    mobileInput[direction] = pressed;
}

// Handle action buttons
function handleAction(action) {
    switch(action) {
        case 'attack':
            attack();
            break;
        case 'quack':
            quack();
            break;
        case 'shop':
            openShop();
            break;
        case 'sleep':
            sleep();
            break;
    }
}

// Make functions available globally
window.initGame = initGame;
window.handleMobileInput = handleMobileInput;
window.handleAction = handleAction;
window.buyItem = buyItem;
window.gameRespawn = respawn;
window.closeShop = function() {
    gameState = 'playing';
    if (window.closeShop) {
        window.closeShop();
    }
};
