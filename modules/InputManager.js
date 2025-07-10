// InputManager.js - Handles mouse and keyboard input
export class InputManager {
    constructor(gridManager, cellManager) {
        this.gridManager = gridManager;
        this.cellManager = cellManager;
        this.hoveredCell = null;
        
        // Key state tracking
        this.keysPressed = {
            s: false,
            e: false,
            o: false
        };
        
        // Mouse drag state tracking
        this.mouseDragState = {
            isMouseDown: false,
            dragMode: null, // 'start', 'end', 'add-obstacle', 'remove-obstacle'
            button: null
        };
        
        // Obstacle drag mode tracking for keyboard
        this.obstacleDragMode = null; // 'add' or 'remove'
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Register cell event handlers with grid manager
        this.gridManager.registerCellEventHandler('mousedown', (e) => this.handleCellMouseDown(e));
        this.gridManager.registerCellEventHandler('mouseenter', (e) => this.handleCellMouseEnter(e));
        this.gridManager.registerCellEventHandler('mouseleave', (e) => this.handleCellMouseLeave(e));
        this.gridManager.registerCellEventHandler('contextmenu', (e) => e.preventDefault());

        // Global mouse listeners for drag functionality
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // Global keyboard listeners
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Prevent context menu globally
        window.addEventListener('contextmenu', (evt) => evt.preventDefault());
    }

    handleCellMouseDown(e) {
        const cell = e.target;
        const pos = this.gridManager.getCellPosition(cell);
        
        this.mouseDragState.isMouseDown = true;
        this.mouseDragState.button = e.button;
        
        console.log(`Mouse down on cell (${pos.x}, ${pos.y}), button: ${e.button}`);
        
        switch(e.button) {
            case 0: // Left click - Start cell
                this.cellManager.setStartCell(cell);
                this.mouseDragState.dragMode = 'start';
                console.log('Mouse drag mode set to: start');
                break;
                
            case 1: // Middle click - Toggle obstacle
                e.preventDefault();
                const wasObstacle = this.cellManager.isObstacle(cell);
                this.cellManager.toggleObstacle(cell);
                // Set drag mode based on the action that was performed
                this.mouseDragState.dragMode = wasObstacle ? 'remove-obstacle' : 'add-obstacle';
                console.log(`Mouse drag mode set to: ${this.mouseDragState.dragMode}`);
                break;
                
            case 2: // Right click - End cell
                this.cellManager.setEndCell(cell);
                this.mouseDragState.dragMode = 'end';
                console.log('Mouse drag mode set to: end');
                break;
        }
    }

    handleMouseUp(e) {
        console.log(`Mouse up, was dragging: ${this.mouseDragState.dragMode}`);
        this.mouseDragState.isMouseDown = false;
        this.mouseDragState.dragMode = null;
        this.mouseDragState.button = null;
    }

    handleCellMouseEnter(e) {
        this.hoveredCell = e.target;
        
        // Handle mouse drag functionality
        if (this.mouseDragState.isMouseDown && this.mouseDragState.dragMode) {
            switch(this.mouseDragState.dragMode) {
                case 'start':
                    this.cellManager.setStartCell(this.hoveredCell);
                    break;
                case 'end':
                    this.cellManager.setEndCell(this.hoveredCell);
                    break;
                case 'add-obstacle':
                    // Only add obstacles to empty cells (not start/end)
                    if (!this.cellManager.isStart(this.hoveredCell) && 
                        !this.cellManager.isEnd(this.hoveredCell) && 
                        !this.cellManager.isObstacle(this.hoveredCell)) {
                        this.cellManager.addObstacle(this.hoveredCell);
                    }
                    break;
                case 'remove-obstacle':
                    // Only remove obstacles
                    if (this.cellManager.isObstacle(this.hoveredCell)) {
                        this.cellManager.removeObstacle(this.hoveredCell);
                    }
                    break;
            }
        }
        
        // Handle keyboard drag functionality
        if (this.keysPressed.s) {
            this.cellManager.setStartCell(this.hoveredCell);
        } else if (this.keysPressed.e) {
            this.cellManager.setEndCell(this.hoveredCell);
        } else if (this.keysPressed.o && this.obstacleDragMode) {
            if (this.obstacleDragMode === 'add') {
                // Only add obstacles to empty cells (not start/end)
                if (!this.cellManager.isStart(this.hoveredCell) && 
                    !this.cellManager.isEnd(this.hoveredCell) && 
                    !this.cellManager.isObstacle(this.hoveredCell)) {
                    this.cellManager.addObstacle(this.hoveredCell);
                }
            } else if (this.obstacleDragMode === 'remove') {
                // Only remove obstacles
                if (this.cellManager.isObstacle(this.hoveredCell)) {
                    this.cellManager.removeObstacle(this.hoveredCell);
                }
            }
        }
    }

    handleCellMouseLeave(e) {
        if (this.hoveredCell === e.target) {
            this.hoveredCell = null;
        }
    }

    handleKeyDown(e) {
        const key = e.key.toLowerCase();
        
        // Only handle our specific keys, let others pass through
        if (!['s', 'e', 'o'].includes(key)) {
            return;
        }
        
        // These keys require a hovered cell
        if (!this.hoveredCell) return;
        
        // Prevent repeated firing when key is held down
        const isFirstPress = !this.keysPressed[key];
        
        switch(key) {
            case 's': // Start cell
                e.preventDefault();
                this.keysPressed.s = true;
                
                if (isFirstPress) {
                    this.cellManager.setStartCell(this.hoveredCell);
                }
                break;
                
            case 'e': // End cell
                e.preventDefault();
                this.keysPressed.e = true;
                
                if (isFirstPress) {
                    this.cellManager.setEndCell(this.hoveredCell);
                }
                break;
                
            case 'o': // Obstacle cell
                e.preventDefault();
                this.keysPressed.o = true;
                
                if (isFirstPress && this.hoveredCell) {
                    // Determine drag mode based on initial cell state
                    if (this.cellManager.isObstacle(this.hoveredCell)) {
                        // Starting on obstacle - set mode to remove
                        this.cellManager.removeObstacle(this.hoveredCell);
                        this.obstacleDragMode = 'remove';
                    } else if (!this.cellManager.isStart(this.hoveredCell) && 
                              !this.cellManager.isEnd(this.hoveredCell)) {
                        // Starting on empty cell - set mode to add
                        this.cellManager.addObstacle(this.hoveredCell);
                        this.obstacleDragMode = 'add';
                    }
                    // If starting on start/end cell, don't set any drag mode
                }
                break;
        }
    }

    handleKeyUp(e) {
        const key = e.key.toLowerCase();
        if (this.keysPressed[key]) {
            this.keysPressed[key] = false;
            if (key === 'o') {
                this.obstacleDragMode = null;
            }
            console.log(`'${key.toUpperCase()}' key released - drag mode disabled`);
        }
    }

    // Public methods for external control
    setHoveredCell(cell) {
        this.hoveredCell = cell;
    }

    getHoveredCell() {
        return this.hoveredCell;
    }

    isKeyPressed(key) {
        return this.keysPressed[key.toLowerCase()];
    }
}
