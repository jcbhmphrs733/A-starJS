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

function createTiles(tilesAcross, tilesDown) {
    // Get cell size from CSS variable
    const rootStyles = getComputedStyle(document.documentElement);
    const cellSize = parseInt(rootStyles.getPropertyValue('--cell-size'));
    
    tileContainer.style.gridTemplateColumns = `repeat(${tilesAcross}, ${cellSize}px)`;
    tileContainer.style.gridTemplateRows = `repeat(${tilesDown}, ${cellSize}px)`;

    for (let i = 0; i < tilesAcross * tilesDown; i++) {
        const cell = document.createElement('div');
        cell.classList.add('tile-cell');
        cell.addEventListener('mousedown', handleCellClick); // Use mousedown to catch all buttons
        cell.addEventListener('contextmenu', (e) => e.preventDefault()); // Prevent context menu on cells
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