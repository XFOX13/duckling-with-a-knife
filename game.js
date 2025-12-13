// ====================================
// MOBILE TOUCH CONTROLS
// ====================================

// Create touch control buttons
function createTouchControls() {
    const controlsHTML = `
        <div class="mobile-controls">
            <div class="d-pad">
                <button class="up">⬆</button>
                <div>
                    <button class="left">⬅</button>
                    <button class="down">⬇</button>
                    <button class="right">➡</button>
                </div>
            </div>
            <div class="action-buttons">
                <button class="attack">🔪 ATTACK</button>
                <button class="quack">🦆 QUACK</button>
            </div>
        </div>
    `;
    
    // Add to page
    document.querySelector('.controls').innerHTML += controlsHTML;
    
    // Add touch events
    document.querySelector('.up').addEventListener('touchstart', () => keys['ArrowUp'] = true);
    document.querySelector('.up').addEventListener('touchend', () => keys['ArrowUp'] = false);
    
    document.querySelector('.left').addEventListener('touchstart', () => keys['ArrowLeft'] = true);
    document.querySelector('.left').addEventListener('touchend', () => keys['ArrowLeft'] = false);
    
    document.querySelector('.down').addEventListener('touchstart', () => keys['ArrowDown'] = true);
    document.querySelector('.down').addEventListener('touchend', () => keys['ArrowDown'] = false);
    
    document.querySelector('.right').addEventListener('touchstart', () => keys['ArrowRight'] = true);
    document.querySelector('.right').addEventListener('touchend', () => keys['ArrowRight'] = false);
    
    document.querySelector('.attack').addEventListener('touchstart', () => {
        if (duckling.knifeCooldown === 0) {
            duckling.knifeCooldown = 30;
            console.log("🔪 Mobile attack!");
        }
    });
    
    document.querySelector('.quack').addEventListener('touchstart', () => {
        console.log("🦆 QUACK from mobile!");
    });
}

// Add CSS for mobile controls
const mobileCSS = `
    .mobile-controls {
        display: none;
        margin-top: 20px;
    }
    
    .d-pad {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    
    .d-pad > div {
        display: flex;
        gap: 10px;
        margin-top: 5px;
    }
    
    .d-pad button, .action-buttons button {
        width: 60px;
        height: 60px;
        font-size: 24px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 10px;
        touch-action: manipulation;
    }
    
    .action-buttons {
        display: flex;
        gap: 10px;
        margin-top: 10px;
        justify-content: center;
    }
    
    .action-buttons button {
        width: 120px;
        font-size: 16px;
    }
    
    /* Show only on mobile */
    @media (max-width: 768px) {
        .mobile-controls {
            display: block;
        }
        .controls p {
            font-size: 14px;
        }
    }
`;

// Add mobile CSS to page
const style = document.createElement('style');
style.textContent = mobileCSS;
document.head.appendChild(style);

// Initialize touch controls when page loads
window.addEventListener('load', createTouchControls);
