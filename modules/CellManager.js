// CellManager.js - Handles cell states (start, end, obstacles)
export class CellManager {
    constructor(gridManager) {
        this.gridManager = gridManager;
        this.startCell = null;
        this.endCell = null;
        this.obstacleCells = new Set();
        
        this.setupGridResizeListener();
    }

    clearCell(cell) {
        cell.classList.remove('start', 'end', 'obstacle');
        this.obstacleCells.delete(cell);
    }

    setStartCell(cell) {
        // Remove previous start cell
        if (this.startCell) {
            this.startCell.classList.remove('start');
        }

        // If clicking on current start cell, remove it
        if (cell === this.startCell) {
            this.startCell = null;
            return false;
        }

        // Clear the new cell and set as start
        this.clearCell(cell);
        if (cell === this.endCell) {
            this.endCell = null;
        }

        cell.classList.add('start');
        this.startCell = cell;
        
        const pos = this.gridManager.getCellPosition(cell);
        console.log(`Start cell set at x:${pos.x}, y:${pos.y}`);
        return true;
    }

    setEndCell(cell) {
        // Remove previous end cell
        if (this.endCell) {
            this.endCell.classList.remove('end');
        }

        // If clicking on current end cell, remove it
        if (cell === this.endCell) {
            this.endCell = null;
            return false;
        }

        // Clear the new cell and set as end
        this.clearCell(cell);
        if (cell === this.startCell) {
            this.startCell = null;
        }

        cell.classList.add('end');
        this.endCell = cell;
        
        const pos = this.gridManager.getCellPosition(cell);
        console.log(`End cell set at x:${pos.x}, y:${pos.y}`);
        return true;
    }

    toggleObstacle(cell) {
        // Don't modify start or end cells
        if (cell === this.startCell || cell === this.endCell) {
            return false;
        }

        const pos = this.gridManager.getCellPosition(cell);
        
        if (cell.classList.contains('obstacle')) {
            // Remove obstacle
            cell.classList.remove('obstacle');
            this.obstacleCells.delete(cell);
            console.log(`Obstacle removed at x:${pos.x}, y:${pos.y}`);
            return false; // Returns false when removing
        } else {
            // Add obstacle
            this.clearCell(cell);
            cell.classList.add('obstacle');
            this.obstacleCells.add(cell);
            console.log(`Obstacle added at x:${pos.x}, y:${pos.y}`);
            return true; // Returns true when adding
        }
    }

    addObstacle(cell) {
        if (cell === this.startCell || cell === this.endCell || cell.classList.contains('obstacle')) {
            return false;
        }
        
        cell.classList.add('obstacle');
        this.obstacleCells.add(cell);
        
        const pos = this.gridManager.getCellPosition(cell);
        console.log(`Obstacle added at x:${pos.x}, y:${pos.y}`);
        return true;
    }

    removeObstacle(cell) {
        if (!cell.classList.contains('obstacle')) {
            return false;
        }
        
        cell.classList.remove('obstacle');
        this.obstacleCells.delete(cell);
        
        const pos = this.gridManager.getCellPosition(cell);
        console.log(`Obstacle removed at x:${pos.x}, y:${pos.y}`);
        return true;
    }

    isObstacle(cell) {
        return cell.classList.contains('obstacle');
    }

    isStart(cell) {
        return cell === this.startCell;
    }

    isEnd(cell) {
        return cell === this.endCell;
    }

    getStartPosition() {
        if (!this.startCell) return null;
        return this.gridManager.getCellPosition(this.startCell);
    }

    getEndPosition() {
        if (!this.endCell) return null;
        return this.gridManager.getCellPosition(this.endCell);
    }

    getObstacles() {
        return Array.from(this.obstacleCells).map(cell => 
            this.gridManager.getCellPosition(cell)
        );
    }

    hasValidPath() {
        return this.startCell && this.endCell;
    }

    clearAll() {
        // Clear start cell
        if (this.startCell) {
            this.startCell.classList.remove('start');
            this.startCell = null;
        }

        // Clear end cell
        if (this.endCell) {
            this.endCell.classList.remove('end');
            this.endCell = null;
        }

        // Clear all obstacles
        this.obstacleCells.forEach(cell => {
            cell.classList.remove('obstacle');
        });
        this.obstacleCells.clear();

        console.log('All cells cleared');
    }

    setupGridResizeListener() {
        window.addEventListener('gridResized', () => {
            // Reset all cell references on grid resize
            this.startCell = null;
            this.endCell = null;
            this.obstacleCells.clear();
            console.log('Cell manager reset due to grid resize');
        });
    }
}
