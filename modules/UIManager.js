// UIManager.js - Handles user interface and controls display
export class UIManager {
    constructor() {
        this.controlsVisible = false;
        this.createControlsOverlay();
        this.setupUIEventListeners();
    }

    createControlsOverlay() {
        // Create controls overlay
        const overlay = document.createElement('div');
        overlay.id = 'controls-overlay';
        overlay.innerHTML = `
            <div class="controls-panel">
                <h3>Controls</h3>
                <div class="controls-section">
                    <h4>Mouse Controls:</h4>
                    <p><strong>Left Click:</strong> Set start cell</p>
                    <p><strong>Right Click:</strong> Set end cell</p>
                    <p><strong>Middle Click:</strong> Toggle obstacle</p>
                </div>
                <div class="controls-section">
                    <h4>Keyboard Controls:</h4>
                    <p><strong>S:</strong> Set start cell (hold and drag)</p>
                    <p><strong>E:</strong> Set end cell (hold and drag)</p>
                    <p><strong>O:</strong> Toggle obstacles (hold and drag)</p>
                    <p><strong>P:</strong> Add random obstacles (10% of free cells)</p>
                </div>
                <div class="controls-section">
                    <h4>Pathfinding:</h4>
                    <p><strong>Space:</strong> Run pathfinding</p>
                    <p><strong>C:</strong> Clear path</p>
                    <p><strong>R:</strong> Reset grid</p>
                    <p><strong>1-4:</strong> Change algorithm</p>
                </div>
                <div class="controls-section">
                    <h4>UI:</h4>
                    <p><strong>H:</strong> Toggle this help</p>
                </div>
                <div class="algorithm-info">
                    <p>Current Algorithm: <span id="current-algorithm">A*</span></p>
                    <p>Animation Speed: <span id="animation-info">Adaptive based on grid size</span></p>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
    }

    setupUIEventListeners() {
        document.addEventListener('keydown', (e) => {
            switch(e.key.toLowerCase()) {
                case 'h':
                    e.preventDefault();
                    this.toggleControls();
                    break;
            }
        });
    }

    toggleControls() {
        const overlay = document.getElementById('controls-overlay');
        this.controlsVisible = !this.controlsVisible;
        overlay.style.display = this.controlsVisible ? 'flex' : 'none';
        console.log(`Controls ${this.controlsVisible ? 'shown' : 'hidden'}`);
    }

    showMessage(message, type = 'info') {
        // Create temporary message overlay
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-overlay ${type}`;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);

        // Remove after 3 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
   }

    // Show initial help message
    showInitialHelp() {
        setTimeout(() => {
            this.showMessage('Press H for controls', 'info');
        }, 1000);
    }

    // Update animation information display
    updateAnimationInfo(animationInfo) {
        const animationElement = document.getElementById('animation-info');
        if (animationElement) {
            animationElement.textContent = `${animationInfo.animationDelay} (${animationInfo.gridSize})`;
        }
    }
}
