// PathfindingManager.js - Handles pathfinding algorithms and visualization
export class PathfindingManager {
    constructor(gridManager, cellManager, uiManager = null) {
        this.gridManager = gridManager;
        this.cellManager = cellManager;
        this.uiManager = uiManager;
        this.currentPath = [];
        this.exploredCells = [];
        this.algorithm = 'astar'; // Default algorithm
    }

    // Calculate animation delay based on grid size
    // Smaller grids get longer delays to make the search more visible
    calculateAnimationDelay() {
        const totalCells = this.gridManager.tilesAcross * this.gridManager.tilesDown;
        
        // Base delay calculation: smaller grids need more delay
        // For very small grids (< 100 cells): 60ms delay
        // For small grids (100-300 cells): 30ms delay
        // For medium grids (300-600 cells): 15ms delay
        // For large grids (600-1000 cells): 5ms delay
        // For very large grids (> 1000 cells): 1ms delay

        let delay;
        if (totalCells < 100) {
            delay = 60; // Slow for very small grids
        } else if (totalCells < 300) {
            delay = 30; // Medium-slow for small grids
        } else if (totalCells < 600) {
            delay = 15; // Medium for medium grids
        } else if (totalCells < 1000) {
            delay = 5; // Medium-fast for large grids
        } else {
            delay = 1; // Fast for very large grids
        }
        
        return delay;
    }

    // Get animation info for debugging/display
    getAnimationInfo() {
        const totalCells = this.gridManager.tilesAcross * this.gridManager.tilesDown;
        const delay = this.calculateAnimationDelay();
        return {
            gridSize: `${this.gridManager.tilesAcross}x${this.gridManager.tilesDown}`,
            totalCells: totalCells,
            animationDelay: delay + 'ms',
            updateFrequency: 'Every 5 nodes'
        };
    }

    // Set the pathfinding algorithm to use
    setAlgorithm(algorithm) {
        const supportedAlgorithms = ['astar', 'dijkstra', 'bfs', 'dfs'];
        if (supportedAlgorithms.includes(algorithm.toLowerCase())) {
            this.algorithm = algorithm.toLowerCase();
            console.log(`Pathfinding algorithm set to: ${this.algorithm}`);
        } else {
            console.warn(`Unsupported algorithm: ${algorithm}. Using A* instead.`);
            this.algorithm = 'astar';
        }
    }

    // Main pathfinding method
    async findPath() {
        if (!this.cellManager.hasValidPath()) {
            return { success: false, message: 'Start and end cells required' };
        }

        // Clear previous path
        this.clearPath();

        const startPos = this.cellManager.getStartPosition();
        const endPos = this.cellManager.getEndPosition();

        // Log pathfinding info including animation settings
        const animInfo = this.getAnimationInfo();
        console.log(`Finding path from (${startPos.x}, ${startPos.y}) to (${endPos.x}, ${endPos.y}) using ${this.algorithm}`);
        console.log(`Grid: ${animInfo.gridSize} (${animInfo.totalCells} cells), Animation: ${animInfo.animationDelay} delay, ${animInfo.updateFrequency}`);
        
        // Update UI with animation info if UIManager is available
        if (this.uiManager) {
            this.uiManager.updateAnimationInfo(animInfo);
        }

        let result;
        switch(this.algorithm) {
            case 'astar':
                result = await this.aStar(startPos, endPos);
                break;
            case 'dijkstra':
                result = await this.dijkstra(startPos, endPos);
                break;
            case 'bfs':
                result = await this.breadthFirstSearch(startPos, endPos);
                break;
            case 'dfs':
                result = await this.depthFirstSearch(startPos, endPos);
                break;
            default:
                result = await this.aStar(startPos, endPos);
        }

        if (result.success) {
            console.log('Pathfinding successful, calling visualizePath...');
            this.visualizePath(result.path);
            console.log('visualizePath called');
        } else {
            console.log('Pathfinding failed:', result.message);
        }

        return result;
    }

    // A* Algorithm implementation
    async aStar(start, end) {
        const openSet = [start];
        const closedSet = new Set();
        const gScore = new Map();
        const fScore = new Map();
        const cameFrom = new Map();

        // Initialize scores
        gScore.set(this.positionKey(start), 0);
        fScore.set(this.positionKey(start), this.heuristic(start, end));

        let nodesExplored = 0;

        while (openSet.length > 0) {
            // Find node in openSet with lowest fScore
            let current = openSet.reduce((lowest, node) => {
                const currentF = fScore.get(this.positionKey(node)) || Infinity;
                const lowestF = fScore.get(this.positionKey(lowest)) || Infinity;
                return currentF < lowestF ? node : lowest;
            });

            // Remove current from openSet
            openSet.splice(openSet.indexOf(current), 1);
            closedSet.add(this.positionKey(current));
            nodesExplored++;

            // Mark as explored for visualization
            if (!(current.x === start.x && current.y === start.y) && 
                !(current.x === end.x && current.y === end.y)) {
                const cell = this.gridManager.getCellAtPosition(current.x, current.y);
                if (cell) {
                    cell.classList.add('explored');
                    this.exploredCells.push(cell);
                }
            }

            // Check if we reached the goal
            if (current.x === end.x && current.y === end.y) {
                const path = this.reconstructPath(cameFrom, current);
                return { success: true, path, nodesExplored };
            }

            // Check all neighbors
            const neighbors = this.gridManager.getNeighbors(current.x, current.y);
            for (const neighbor of neighbors) {
                const neighborPos = { x: neighbor.x, y: neighbor.y };
                const neighborKey = this.positionKey(neighborPos);

                // Skip if neighbor is an obstacle or already processed
                if (this.cellManager.isObstacle(neighbor.cell) || closedSet.has(neighborKey)) {
                    continue;
                }

                const tentativeGScore = (gScore.get(this.positionKey(current)) || 0) + 1;

                if (!openSet.some(node => node.x === neighbor.x && node.y === neighbor.y)) {
                    openSet.push(neighborPos);
                }

                if (tentativeGScore >= (gScore.get(neighborKey) || Infinity)) {
                    continue;
                }

                // This path to neighbor is better than any previous one
                cameFrom.set(neighborKey, current);
                gScore.set(neighborKey, tentativeGScore);
                fScore.set(neighborKey, tentativeGScore + this.heuristic(neighborPos, end));
            }

            // Add delay for visualization based on grid size
            if (nodesExplored % 5 === 0) { // More frequent updates for better visual feedback
                await this.sleep(this.calculateAnimationDelay());
            }
        }

        return { success: false, message: 'No path found', nodesExplored };
    }

    // Dijkstra's Algorithm implementation
    async dijkstra(start, end) {
        const distances = new Map();
        const visited = new Set();
        const previous = new Map();
        const unvisited = [];

        // Initialize distances
        const dimensions = this.gridManager.getDimensions();
        for (let y = 0; y < dimensions.tilesDown; y++) {
            for (let x = 0; x < dimensions.tilesAcross; x++) {
                const pos = { x, y };
                const key = this.positionKey(pos);
                distances.set(key, Infinity);
                unvisited.push(pos);
            }
        }

        distances.set(this.positionKey(start), 0);
        let nodesExplored = 0;

        while (unvisited.length > 0) {
            // Find unvisited node with minimum distance
            let current = unvisited.reduce((min, node) => {
                const currentDist = distances.get(this.positionKey(node));
                const minDist = distances.get(this.positionKey(min));
                return currentDist < minDist ? node : min;
            });

            // Remove from unvisited
            unvisited.splice(unvisited.indexOf(current), 1);
            visited.add(this.positionKey(current));
            nodesExplored++;

            // Mark as explored for visualization
            if (!(current.x === start.x && current.y === start.y) && 
                !(current.x === end.x && current.y === end.y)) {
                const cell = this.gridManager.getCellAtPosition(current.x, current.y);
                if (cell) {
                    cell.classList.add('explored');
                    this.exploredCells.push(cell);
                }
            }

            // Check if we reached the goal
            if (current.x === end.x && current.y === end.y) {
                const path = this.reconstructPathDijkstra(previous, current);
                return { success: true, path, nodesExplored };
            }

            // Check all neighbors
            const neighbors = this.gridManager.getNeighbors(current.x, current.y);
            for (const neighbor of neighbors) {
                const neighborPos = { x: neighbor.x, y: neighbor.y };
                const neighborKey = this.positionKey(neighborPos);

                if (this.cellManager.isObstacle(neighbor.cell) || visited.has(neighborKey)) {
                    continue;
                }

                const alt = distances.get(this.positionKey(current)) + 1;
                if (alt < distances.get(neighborKey)) {
                    distances.set(neighborKey, alt);
                    previous.set(neighborKey, current);
                }
            }

            // Add delay for visualization based on grid size
            if (nodesExplored % 5 === 0) {
                await this.sleep(this.calculateAnimationDelay());
            }
        }

        return { success: false, message: 'No path found', nodesExplored };
    }

    // Breadth-First Search implementation
    async breadthFirstSearch(start, end) {
        const queue = [start];
        const visited = new Set();
        const parent = new Map();
        let nodesExplored = 0;

        visited.add(this.positionKey(start));

        while (queue.length > 0) {
            const current = queue.shift();
            nodesExplored++;

            // Mark as explored for visualization
            if (!(current.x === start.x && current.y === start.y) && 
                !(current.x === end.x && current.y === end.y)) {
                const cell = this.gridManager.getCellAtPosition(current.x, current.y);
                if (cell) {
                    cell.classList.add('explored');
                    this.exploredCells.push(cell);
                }
            }

            // Check if we reached the goal
            if (current.x === end.x && current.y === end.y) {
                const path = this.reconstructPathBFS(parent, current);
                return { success: true, path, nodesExplored };
            }

            // Check all neighbors
            const neighbors = this.gridManager.getNeighbors(current.x, current.y);
            for (const neighbor of neighbors) {
                const neighborPos = { x: neighbor.x, y: neighbor.y };
                const neighborKey = this.positionKey(neighborPos);

                if (this.cellManager.isObstacle(neighbor.cell) || visited.has(neighborKey)) {
                    continue;
                }

                visited.add(neighborKey);
                parent.set(neighborKey, current);
                queue.push(neighborPos);
            }

            // Add delay for visualization based on grid size
            if (nodesExplored % 5 === 0) {
                await this.sleep(this.calculateAnimationDelay());
            }
        }

        return { success: false, message: 'No path found', nodesExplored };
    }

    // Depth-First Search implementation
    async depthFirstSearch(start, end) {
        const stack = [start];
        const visited = new Set();
        const parent = new Map();
        let nodesExplored = 0;

        while (stack.length > 0) {
            const current = stack.pop();
            const currentKey = this.positionKey(current);

            if (visited.has(currentKey)) {
                continue;
            }

            visited.add(currentKey);
            nodesExplored++;

            // Mark as explored for visualization
            if (!(current.x === start.x && current.y === start.y) && 
                !(current.x === end.x && current.y === end.y)) {
                const cell = this.gridManager.getCellAtPosition(current.x, current.y);
                if (cell) {
                    cell.classList.add('explored');
                    this.exploredCells.push(cell);
                }
            }

            // Check if we reached the goal
            if (current.x === end.x && current.y === end.y) {
                const path = this.reconstructPathBFS(parent, current);
                return { success: true, path, nodesExplored };
            }

            // Check all neighbors
            const neighbors = this.gridManager.getNeighbors(current.x, current.y);
            for (const neighbor of neighbors) {
                const neighborPos = { x: neighbor.x, y: neighbor.y };
                const neighborKey = this.positionKey(neighborPos);

                if (this.cellManager.isObstacle(neighbor.cell) || visited.has(neighborKey)) {
                    continue;
                }

                parent.set(neighborKey, current);
                stack.push(neighborPos);
            }

            // Add delay for visualization based on grid size
            if (nodesExplored % 5 === 0) {
                await this.sleep(this.calculateAnimationDelay());
            }
        }

        return { success: false, message: 'No path found', nodesExplored };
    }

    // Helper methods
    heuristic(pos1, pos2) {
        // Manhattan distance
        return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
    }

    positionKey(pos) {
        return `${pos.x},${pos.y}`;
    }

    reconstructPath(cameFrom, current) {
        const path = [current];
        let currentKey = this.positionKey(current);

        while (cameFrom.has(currentKey)) {
            current = cameFrom.get(currentKey);
            path.unshift(current);
            currentKey = this.positionKey(current);
        }

        return path;
    }

    reconstructPathDijkstra(previous, current) {
        const path = [current];
        let currentKey = this.positionKey(current);

        while (previous.has(currentKey)) {
            current = previous.get(currentKey);
            path.unshift(current);
            currentKey = this.positionKey(current);
        }

        return path;
    }

    reconstructPathBFS(parent, current) {
        const path = [current];
        let currentKey = this.positionKey(current);

        while (parent.has(currentKey)) {
            current = parent.get(currentKey);
            path.unshift(current);
            currentKey = this.positionKey(current);
        }

        return path;
    }

    visualizePath(path) {
        console.log(`Visualizing path with ${path.length} nodes:`, path);
        this.currentPath = [];
        const startPos = this.cellManager.getStartPosition();
        const endPos = this.cellManager.getEndPosition();
        
        console.log('Start position:', startPos);
        console.log('End position:', endPos);
        
        path.forEach((pos, index) => {
            const cell = this.gridManager.getCellAtPosition(pos.x, pos.y);
            if (cell) {
                // Skip start and end positions, not the cell references
                const isStartPos = startPos && pos.x === startPos.x && pos.y === startPos.y;
                const isEndPos = endPos && pos.x === endPos.x && pos.y === endPos.y;
                
                console.log(`Path node ${index}: (${pos.x}, ${pos.y}) - isStart: ${isStartPos}, isEnd: ${isEndPos}`);
                
                if (!isStartPos && !isEndPos) {
                    console.log(`Adding path class to cell at (${pos.x}, ${pos.y})`);
                    // Ensure we remove any conflicting classes first
                    cell.classList.remove('explored');
                    cell.classList.add('path');
                    this.currentPath.push(cell);
                } else {
                    console.log(`Skipping path visualization for ${isStartPos ? 'start' : 'end'} cell at (${pos.x}, ${pos.y})`);
                }
            } else {
                console.log(`No cell found at position (${pos.x}, ${pos.y})`);
            }
        });
        
        console.log(`Added path class to ${this.currentPath.length} cells`);
    }

    clearPath() {
        // Clear path visualization
        this.currentPath.forEach(cell => {
            cell.classList.remove('path');
        });
        this.currentPath = [];

        // Clear explored cells visualization
        this.exploredCells.forEach(cell => {
            cell.classList.remove('explored');
        });
        this.exploredCells = [];
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Public API
    getCurrentAlgorithm() {
        return this.algorithm;
    }

    getAvailableAlgorithms() {
        return ['astar', 'dijkstra', 'bfs', 'dfs'];
    }

    hasPath() {
        return this.currentPath.length > 0;
    }
}
