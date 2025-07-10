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
                case '1':
                    e.preventDefault();
                    this.setAlgorithm('astar');
                    break;
                case '2':
                    e.preventDefault();
                    this.setAlgorithm('dijkstra');
                    break;
                case '3':
                    e.preventDefault();
                    this.setAlgorithm('bfs');
                    break;
                case '4':
                    e.preventDefault();
                    this.setAlgorithm('dfs');
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

    setAlgorithm(algorithm) {
        if (window.pathfindingApp) {
            window.pathfindingApp.getPathfindingManager().setAlgorithm(algorithm);
            this.updateAlgorithmDisplay(algorithm);
        }
    }

    updateAlgorithmDisplay(algorithm) {
        const algorithmDisplay = document.getElementById('current-algorithm');
        if (algorithmDisplay) {
            const algorithmNames = {
                'astar': 'A*',
                'dijkstra': 'Dijkstra',
                'bfs': 'Breadth-First Search',
                'dfs': 'Depth-First Search'
            };
            algorithmDisplay.textContent = algorithmNames[algorithm] || algorithm;
        }
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
}
