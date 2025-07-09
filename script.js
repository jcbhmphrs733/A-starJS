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
let selectedCell = null;

console.log(`Creating a grid of ${tilesAcross} tiles across and ${tilesDown} tiles down.`);

function createTiles(tilesAcross, tilesDown) {
    // Get cell size from CSS variable
    const rootStyles = getComputedStyle(document.documentElement);
    const cellSize = parseInt(rootStyles.getPropertyValue('--cell-size'));
    
    tileContainer.style.gridTemplateColumns = `repeat(${tilesAcross}, ${cellSize}px)`;
    tileContainer.style.gridTemplateRows = `repeat(${tilesDown}, ${cellSize}px)`;

    for (let i = 0; i < tilesAcross * tilesDown; i++) {
        const cell = document.createElement('div');
        cell.classList.add('tile-cell');
        cell.addEventListener('click', handleCellClick);
        tileContainer.appendChild(cell);
    }
}

function handleCellClick(e) {
    const cell = e.target;
    console.log(e);
    console.log(`Clicked on cell: ${cell}`);

    if (selectedCell) {
        selectedCell.classList.remove('selected');
    }
    
    if (cell == selectedCell) {
        selectedCell.classList.remove('selected');
    }
    else {
        cell.classList.add('selected');
        selectedCell = cell;
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
        selectedCell = null; // Reset selection after resize
    }
});