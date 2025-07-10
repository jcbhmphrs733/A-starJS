const tileContainer = document.getElementById('tile-container');

// Calculate grid size based on container size and desired cell size
function calculateGridSize() {
    // Get values from CSS variables
    const rootStyles = getComputedStyle(document.documentElement);
    const cellSize = parseInt(rootStyles.getPropertyValue('--cell-size'));
    const gap = parseInt(rootStyles.getPropertyValue('--grid-gap'));
    const padding = parseInt(rootStyles.getPropertyValue('--grid-padding')) * 2; // Double for both sides
    
    // Use window dimensions minus padding for calculation
    const availableWidth = window.innerWidth - padding;
    const availableHeight = window.innerHeight - padding;
    
    // Calculate how many cells can fit, accounting for gaps
    const tilesAcross = Math.floor((availableWidth - gap) / (cellSize + gap));
    const tilesDown = Math.floor((availableHeight - gap) / (cellSize + gap));
    
    // Return actual dimensions instead of constraining to square
    return { tilesAcross: tilesAcross, tilesDown: tilesDown };
}

let { tilesAcross, tilesDown } = calculateGridSize();
let startCell = null;
let endCell = null;
let obstacleCells = [];

// Current hovered cell for keyboard placement
let hoveredCell = null;

// Key state tracking to prevent spam and enable drag
let keysPressed = {
    s: false,
    e: false,
    o: false
};

// Track the obstacle drag mode (add or remove)
let obstacleDragMode = null; // 'add' or 'remove'

function createTiles(tilesAcross, tilesDown) {
    // Get cell size from CSS variable
    const rootStyles = getComputedStyle(document.documentElement);
    const cellSize = parseInt(rootStyles.getPropertyValue('--cell-size'));
    
    tileContainer.style.gridTemplateColumns = `repeat(${tilesAcross}, ${cellSize}px)`;
    tileContainer.style.gridTemplateRows = `repeat(${tilesDown}, ${cellSize}px)`;

    for (let i = 0; i < tilesAcross * tilesDown; i++) {
        const cell = document.createElement('div');
        cell.classList.add('tile-cell');
        cell.addEventListener('mousedown', handleCellClick);
        cell.addEventListener('mouseenter', handleCellMouseEnter);
        cell.addEventListener('mouseleave', handleCellMouseLeave);
        cell.addEventListener('contextmenu', (e) => e.preventDefault());
        tileContainer.appendChild(cell);
    }
}

function handleCellClick(e) {
    const cell = e.target;
    const index = Array.from(tileContainer.children).indexOf(cell);
    const x = index % tilesAcross;
    const y = Math.floor(index / tilesAcross);
    
    // Clear any existing classes from this cell
    const clearCell = (cellElement) => {
        cellElement.classList.remove('start', 'end', 'obstacle');
    };
    
    switch(e.button) {
        case 0: // Left click - Start-cell
            
            // If clicking on the current start-cell, remove it
            if (cell === startCell) {
                cell.classList.remove('start');
                startCell = null;
                console.log(`Button ${e.button} clicked on cell x:${x}, y:${y} - Removing start-cell`);
            } 
            // If clicking on end or obstacle cell, clear it and set as start
            else if (cell.classList.contains('end') || cell.classList.contains('obstacle')) {
                clearCell(cell);
                if (cell === endCell) endCell = null;
                obstacleCells = obstacleCells.filter(obstacle => obstacle !== cell);
                
                // Remove previous start-cell if exists
                if (startCell) {
                    startCell.classList.remove('start');
                }
                cell.classList.add('start');
                startCell = cell;
                console.log(`Button ${e.button} clicked on cell x:${x}, y:${y} - Setting start-cell`);
            }
            // If clicking on empty cell, set as start
            else {
                // Remove previous start-cell if exists
                if (startCell) {
                    startCell.classList.remove('start');
                }
                cell.classList.add('start');
                startCell = cell;
                console.log(`Button ${e.button} clicked on cell x:${x}, y:${y} - Setting start-cell`);
            }
            break;
            
        case 1: // Middle click (wheel) - Obstacle cell
            console.log('Toggling obstacle cell');
            
            if (cell.classList.contains('obstacle')) {
                // Remove obstacle
                cell.classList.remove('obstacle');
                obstacleCells = obstacleCells.filter(obstacle => obstacle !== cell);
            } else {
                // Add obstacle (clear other classes first)
                clearCell(cell);
                if (cell === startCell) startCell = null;
                if (cell === endCell) endCell = null;
                cell.classList.add('obstacle');
                obstacleCells.push(cell);
            }
            break;
            
        case 2: // Right click - End-cell
            
            // If clicking on the current end-cell, remove it
            if (cell === endCell) {
                cell.classList.remove('end');
                endCell = null;
                console.log(`Button ${e.button} clicked on cell x:${x}, y:${y} - Removing end-cell`);
            }
            // If clicking on start or obstacle cell, clear it and set as end
            else if (cell.classList.contains('start') || cell.classList.contains('obstacle')) {
                clearCell(cell);
                if (cell === startCell) startCell = null;
                obstacleCells = obstacleCells.filter(obstacle => obstacle !== cell);
                
                // Remove previous end-cell if exists
                if (endCell) {
                    endCell.classList.remove('end');
                }
                cell.classList.add('end');
                endCell = cell;
                console.log(`Button ${e.button} clicked on cell x:${x}, y:${y} - Setting end-cell`);
            }
            // If clicking on empty cell, set as end
            else {
                // Remove previous end-cell if exists
                if (endCell) {
                    endCell.classList.remove('end');
                }
                cell.classList.add('end');
                endCell = cell;
                console.log(`Button ${e.button} clicked on cell x:${x}, y:${y} - Setting end-cell`);
            }
            break;
    }
}

function handleCellMouseEnter(e) {
    hoveredCell = e.target;
    
    // Check if any placement keys are held down for drag functionality
    const index = Array.from(tileContainer.children).indexOf(hoveredCell);
    const x = index % tilesAcross;
    const y = Math.floor(index / tilesAcross);
    
    if (keysPressed.s) {
        // S key held - place start cell
        if (hoveredCell !== startCell) {
            if (startCell) {
                startCell.classList.remove('start');
            }
            clearCell(hoveredCell);
            if (hoveredCell === endCell) endCell = null;
            obstacleCells = obstacleCells.filter(obstacle => obstacle !== hoveredCell);
            
            hoveredCell.classList.add('start');
            startCell = hoveredCell;
            console.log(`'S' key drag - Set start cell at x:${x}, y:${y}`);
        }
    } else if (keysPressed.e) {
        // E key held - place end cell
        if (hoveredCell !== endCell) {
            if (endCell) {
                endCell.classList.remove('end');
            }
            clearCell(hoveredCell);
            if (hoveredCell === startCell) startCell = null;
            obstacleCells = obstacleCells.filter(obstacle => obstacle !== hoveredCell);
            
            hoveredCell.classList.add('end');
            endCell = hoveredCell;
            console.log(`'E' key drag - Set end cell at x:${x}, y:${y}`);
        }
    } else if (keysPressed.o) {
        // O key held - add/remove obstacles based on drag mode
        if (hoveredCell !== startCell && hoveredCell !== endCell) {
            if (obstacleDragMode === 'remove') {
                // Remove mode - remove obstacles
                if (hoveredCell.classList.contains('obstacle')) {
                    hoveredCell.classList.remove('obstacle');
                    obstacleCells = obstacleCells.filter(obstacle => obstacle !== hoveredCell);
                    console.log(`'O' key drag - Removed obstacle at x:${x}, y:${y}`);
                }
            } else if (obstacleDragMode === 'add') {
                // Add mode - add obstacles
                if (!hoveredCell.classList.contains('obstacle')) {
                    hoveredCell.classList.add('obstacle');
                    obstacleCells.push(hoveredCell);
                    console.log(`'O' key drag - Added obstacle at x:${x}, y:${y}`);
                }
            }
        }
    }
}

function handleCellMouseLeave(e) {
    if (hoveredCell === e.target) {
        hoveredCell = null;
    }
}

// Clear any existing classes from a cell
function clearCell(cellElement) {
    cellElement.classList.remove('start', 'end', 'obstacle');
}

// Keyboard controls for placing cells
document.addEventListener('keydown', (e) => {
    if (!hoveredCell) return; // No cell is being hovered
    
    const key = e.key.toLowerCase();
    
    // Prevent repeated firing when key is held down for single placement
    const isFirstPress = !keysPressed[key];
    
    const index = Array.from(tileContainer.children).indexOf(hoveredCell);
    const x = index % tilesAcross;
    const y = Math.floor(index / tilesAcross);
    
    switch(key) {
        case 's': // Start cell
            e.preventDefault();
            keysPressed.s = true;
            
            if (isFirstPress) {
                // Remove previous start cell if exists
                if (startCell) {
                    startCell.classList.remove('start');
                }
                
                // If hovering over current start cell, remove it
                if (hoveredCell === startCell) {
                    startCell = null;
                    console.log(`'S' key - Removed start cell at x:${x}, y:${y}`);
                } else {
                    // Clear the hovered cell and set as start
                    clearCell(hoveredCell);
                    if (hoveredCell === endCell) endCell = null;
                    obstacleCells = obstacleCells.filter(obstacle => obstacle !== hoveredCell);
                    
                    hoveredCell.classList.add('start');
                    startCell = hoveredCell;
                    console.log(`'S' key - Set start cell at x:${x}, y:${y}`);
                }
            }
            break;
            
        case 'e': // End cell
            e.preventDefault();
            keysPressed.e = true;
            
            if (isFirstPress) {
                // Remove previous end cell if exists
                if (endCell) {
                    endCell.classList.remove('end');
                }
                
                // If hovering over current end cell, remove it
                if (hoveredCell === endCell) {
                    endCell = null;
                    console.log(`'E' key - Removed end cell at x:${x}, y:${y}`);
                } else {
                    // Clear the hovered cell and set as end
                    clearCell(hoveredCell);
                    if (hoveredCell === startCell) startCell = null;
                    obstacleCells = obstacleCells.filter(obstacle => obstacle !== hoveredCell);
                    
                    hoveredCell.classList.add('end');
                    endCell = hoveredCell;
                    console.log(`'E' key - Set end cell at x:${x}, y:${y}`);
                }
            }
            break;
            
        case 'o': // Obstacle cell
            e.preventDefault();
            keysPressed.o = true;
            
            if (isFirstPress) {
                if (hoveredCell.classList.contains('obstacle')) {
                    // Remove obstacle and set drag mode to remove
                    hoveredCell.classList.remove('obstacle');
                    obstacleCells = obstacleCells.filter(obstacle => obstacle !== hoveredCell);
                    obstacleDragMode = 'remove';
                    console.log(`'O' key - Removed obstacle at x:${x}, y:${y} (drag mode: remove)`);
                } else {
                    // Add obstacle and set drag mode to add
                    clearCell(hoveredCell);
                    if (hoveredCell === startCell) startCell = null;
                    if (hoveredCell === endCell) endCell = null;
                    hoveredCell.classList.add('obstacle');
                    obstacleCells.push(hoveredCell);
                    obstacleDragMode = 'add';
                    console.log(`'O' key - Added obstacle at x:${x}, y:${y} (drag mode: add)`);
                }
            }
            break;
    }
});

// Handle key release to disable drag functionality
document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (keysPressed[key]) {
        keysPressed[key] = false;
        if (key === 'o') {
            obstacleDragMode = null; // Reset obstacle drag mode
        }
        console.log(`'${key.toUpperCase()}' key released - drag mode disabled`);
    }
});

createTiles(tilesAcross, tilesDown);

window.addEventListener('contextmenu', (evt) => {
    evt.preventDefault();
});

window.addEventListener('resize', () => {
    const newGrid = calculateGridSize();
    
    if (newGrid.tilesAcross !== tilesAcross || newGrid.tilesDown !== tilesDown) {
        console.log(`Resizing grid to ${newGrid.tilesAcross} tiles across and ${newGrid.tilesDown} tiles down.`);
        tileContainer.innerHTML = ''; // Clear existing tiles
        tilesAcross = newGrid.tilesAcross;
        tilesDown = newGrid.tilesDown;
        createTiles(tilesAcross, tilesDown);
        startCell = null; // Reset start cell after resize
        endCell = null; // Reset end cell after resize
        obstacleCells = []; // Reset obstacle cells after resize
    }
});