// GridManager.js - Handles grid creation, sizing, and DOM management
export class GridManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.cells = [];
        this.tilesAcross = 0;
        this.tilesDown = 0;
        this.cellEventHandlers = new Map();
        
        this.setupResizeListener();
    }

    calculateGridSize() {
        // Get values from CSS variables
        const rootStyles = getComputedStyle(document.documentElement);
        const cellSize = parseInt(rootStyles.getPropertyValue('--cell-size'));
        const gap = parseInt(rootStyles.getPropertyValue('--grid-gap'));
        const padding = parseInt(rootStyles.getPropertyValue('--grid-padding')) * 2;
        
        // Use window dimensions minus padding for calculation
        const availableWidth = Math.max(window.innerWidth - padding, cellSize + gap);
        const availableHeight = Math.max(window.innerHeight - padding, cellSize + gap);
        
        // Calculate how many cells can fit, accounting for gaps
        // Ensure at least 1 cell can fit in each dimension
        const tilesAcross = Math.max(1, Math.floor((availableWidth - gap) / (cellSize + gap)));
        const tilesDown = Math.max(1, Math.floor((availableHeight - gap) / (cellSize + gap)));
        
        return { tilesAcross, tilesDown };
    }

    createGrid() {
        const { tilesAcross, tilesDown } = this.calculateGridSize();
        this.tilesAcross = tilesAcross;
        this.tilesDown = tilesDown;

        // Get cell size from CSS variable
        const rootStyles = getComputedStyle(document.documentElement);
        const cellSize = parseInt(rootStyles.getPropertyValue('--cell-size'));
        
        this.container.style.gridTemplateColumns = `repeat(${tilesAcross}, ${cellSize}px)`;
        this.container.style.gridTemplateRows = `repeat(${tilesDown}, ${cellSize}px)`;

        // Clear existing cells
        this.container.innerHTML = '';
        this.cells = [];

        // Create new cells
        for (let i = 0; i < tilesAcross * tilesDown; i++) {
            const cell = document.createElement('div');
            cell.classList.add('tile-cell');
            cell.dataset.index = i;
            
            // Add event listeners from registered handlers
            this.cellEventHandlers.forEach((handler, eventType) => {
                cell.addEventListener(eventType, handler);
            });
            
            this.container.appendChild(cell);
            this.cells.push(cell);
        }

        console.log(`Created grid: ${tilesAcross} × ${tilesDown} cells`);
    }

    registerCellEventHandler(eventType, handler) {
        this.cellEventHandlers.set(eventType, handler);
    }

    getCellAtPosition(x, y) {
        if (x >= 0 && x < this.tilesAcross && y >= 0 && y < this.tilesDown) {
            const index = y * this.tilesAcross + x;
            return this.cells[index];
        }
        return null;
    }

    getCellPosition(cell) {
        const index = parseInt(cell.dataset.index);
        const x = index % this.tilesAcross;
        const y = Math.floor(index / this.tilesAcross);
        return { x, y, index };
    }

    getNeighbors(x, y) {
        const neighbors = [];
        const directions = [
            { dx: 0, dy: -1 }, // Up
            { dx: 1, dy: 0 },  // Right
            { dx: 0, dy: 1 },  // Down
            { dx: -1, dy: 0 }  // Left
        ];

        directions.forEach(({ dx, dy }) => {
            const newX = x + dx;
            const newY = y + dy;
            const cell = this.getCellAtPosition(newX, newY);
            if (cell) {
                neighbors.push({ cell, x: newX, y: newY });
            }
        });

        return neighbors;
    }

    setupResizeListener() {
        window.addEventListener('resize', () => {
            const newGrid = this.calculateGridSize();
            
            if (newGrid.tilesAcross !== this.tilesAcross || newGrid.tilesDown !== this.tilesDown) {
                console.log(`Resizing grid to ${newGrid.tilesAcross} × ${newGrid.tilesDown}`);
                this.createGrid();
                
                // Emit resize event for other modules to handle
                window.dispatchEvent(new CustomEvent('gridResized', {
                    detail: { tilesAcross: this.tilesAcross, tilesDown: this.tilesDown }
                }));
            }
        });
    }

    getDimensions() {
        return {
            tilesAcross: this.tilesAcross,
            tilesDown: this.tilesDown,
            totalCells: this.cells.length
        };
    }
}
