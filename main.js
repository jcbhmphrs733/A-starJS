/*
 * Pathfinding Visualizer
 * Copyright (c) 2025 Jacob Humphreys
 * Interactive pathfinding algorithm visualization tool
 * All rights reserved.
 */

// main.js - Main application entry point
import { GridManager } from './modules/GridManager.js';
import { CellManager } from './modules/CellManager.js';
import { InputManager } from './modules/InputManager.js';
import { PathfindingManager } from './modules/PathfindingManager.js';
import { UIManager } from './modules/UIManager.js';

class PathfindingApp {
    constructor() {
        this.gridManager = null;
        this.cellManager = null;
        this.inputManager = null;
        this.pathfindingManager = null;
        this.uiManager = null;
        
        this.initialize();
    }

    initialize() {
        // Initialize grid manager
        this.gridManager = new GridManager('tile-container');
        
        // Initialize cell manager
        this.cellManager = new CellManager(this.gridManager);
        
        // Initialize input manager
        this.inputManager = new InputManager(this.gridManager, this.cellManager);
        
        // Initialize UI manager
        this.uiManager = new UIManager();
        
        // Initialize pathfinding manager (pass uiManager for animation info updates)
        this.pathfindingManager = new PathfindingManager(this.gridManager, this.cellManager, this.uiManager);
        
        // Create the initial grid
        this.gridManager.createGrid();
        
        // Setup keyboard shortcuts for pathfinding
        this.setupPathfindingShortcuts();
        
        // Show initial help
        this.uiManager.showInitialHelp();
        
        console.log('Pathfinding application initialized');
    }

    setupPathfindingShortcuts() {
        document.addEventListener('keydown', (e) => {
            console.log(`Key pressed: "${e.key}" (code: ${e.keyCode})`); // Debug logging
            switch(e.key.toLowerCase()) {
                case ' ': // Space bar
                    e.preventDefault();
                    console.log('Space bar detected, running pathfinding...');
                    this.runPathfinding();
                    break;
                case 'c':
                    e.preventDefault();
                    console.log('C key detected, clearing path...');
                    this.clearPath();
                    break;
                case 'r':
                    e.preventDefault();
                    console.log('R key detected, resetting grid...');
                    this.resetGrid();
                    break;
            }
        });
    }

    async runPathfinding() {
        if (!this.cellManager.hasValidPath()) {
            this.uiManager.showMessage('Set both start and end cells first!', 'warning');
            console.log('Cannot run pathfinding: Start and end cells must be set');
            return;
        }

        const algorithm = this.pathfindingManager.getCurrentAlgorithm();
        this.uiManager.showMessage(`Running ${algorithm.toUpperCase()}...`, 'info');
        console.log('Running pathfinding...');
        
        const result = await this.pathfindingManager.findPath();
        
        if (result.success) {
            this.uiManager.showMessage(`Path found! Length: ${result.path.length}, Explored: ${result.nodesExplored}`, 'info');
            console.log(`Path found! Length: ${result.path.length}, Nodes explored: ${result.nodesExplored}`);
        } else {
            this.uiManager.showMessage('No path found', 'error');
            console.log('No path found');
        }
    }

    clearPath() {
        this.pathfindingManager.clearPath();
        this.uiManager.showMessage('Path cleared', 'info');
        console.log('Path cleared');
    }

    resetGrid() {
        this.cellManager.clearAll();
        this.pathfindingManager.clearPath();
        this.uiManager.showMessage('Grid reset', 'info');
        console.log('Grid reset');
    }

    // Public API for external access
    getGridManager() {
        return this.gridManager;
    }

    getCellManager() {
        return this.cellManager;
    }

    getInputManager() {
        return this.inputManager;
    }

    getPathfindingManager() {
        return this.pathfindingManager;
    }

    getUIManager() {
        return this.uiManager;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.pathfindingApp = new PathfindingApp();
});

// Export for potential external use
export { PathfindingApp };
