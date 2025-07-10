# Pathfinding Visualization App

A modular, interactive pathfinding visualization application that supports multiple algorithms and provides both mouse and keyboard controls.

## Features

- **Multiple Pathfinding Algorithms**: A*, Dijkstra, Breadth-First Search, Depth-First Search
- **Interactive Grid**: Click or use keyboard to set start, end, and obstacle cells
- **Drag Support**: Hold keys and drag to paint multiple cells
- **Visual Feedback**: Animated path and exploration visualization
- **Responsive Design**: Automatically adjusts grid size to window dimensions

## Controls

### Mouse Controls
- **Left Click**: Set start cell (green)
- **Right Click**: Set end cell (red)
- **Middle Click**: Toggle obstacle cell (black)

### Keyboard Controls
- **S**: Set start cell (hold and drag to move)
- **E**: Set end cell (hold and drag to move)
- **O**: Toggle obstacles (hold and drag to paint/remove)

### Pathfinding Controls
- **Space**: Run pathfinding algorithm
- **C**: Clear current path
- **R**: Reset entire grid
- **1**: Switch to A* algorithm
- **2**: Switch to Dijkstra algorithm
- **3**: Switch to Breadth-First Search
- **4**: Switch to Depth-First Search

### UI Controls
- **H**: Toggle help overlay

## Architecture

The application is built with a modular architecture for easy extension and maintenance:

### Core Modules

1. **GridManager** (`modules/GridManager.js`)
   - Handles grid creation, sizing, and DOM management
   - Calculates responsive grid dimensions
   - Manages cell positioning and neighbor queries
   - Handles window resize events

2. **CellManager** (`modules/CellManager.js`)
   - Manages cell states (start, end, obstacles)
   - Provides methods for setting/clearing cell types
   - Tracks obstacle positions
   - Validates pathfinding requirements

3. **InputManager** (`modules/InputManager.js`)
   - Handles all mouse and keyboard input
   - Manages drag operations and key state tracking
   - Coordinates between user input and cell management

4. **PathfindingManager** (`modules/PathfindingManager.js`)
   - Implements multiple pathfinding algorithms
   - Provides visual feedback during algorithm execution
   - Handles path reconstruction and visualization
   - Supports algorithm switching

5. **UIManager** (`modules/UIManager.js`)
   - Manages user interface overlays and messages
   - Displays controls and current algorithm
   - Provides user feedback and notifications

### Main Application

**main.js** serves as the application entry point, coordinating all modules and providing the public API.

## Algorithm Details

### A* (A-Star)
- **Type**: Informed search algorithm
- **Heuristic**: Manhattan distance
- **Optimal**: Yes (with admissible heuristic)
- **Time Complexity**: O(b^d) where b is branching factor and d is depth
- **Best for**: Finding optimal paths efficiently

### Dijkstra's Algorithm
- **Type**: Uniform-cost search
- **Heuristic**: None (explores uniformly)
- **Optimal**: Yes
- **Time Complexity**: O((V + E) log V)
- **Best for**: Guaranteed shortest path, weighted graphs

### Breadth-First Search (BFS)
- **Type**: Uninformed search
- **Strategy**: Explores level by level
- **Optimal**: Yes (for unweighted graphs)
- **Time Complexity**: O(V + E)
- **Best for**: Finding shortest path in unweighted graphs

### Depth-First Search (DFS)
- **Type**: Uninformed search
- **Strategy**: Explores as far as possible before backtracking
- **Optimal**: No
- **Time Complexity**: O(V + E)
- **Best for**: Finding any path (not necessarily shortest)

## Extending the Application

### Adding New Algorithms

1. Add your algorithm method to `PathfindingManager.js`
2. Update the `findPath()` method to include your algorithm
3. Add the algorithm name to `getAvailableAlgorithms()`
4. Update the UI to include a keyboard shortcut

### Adding New Features

The modular architecture makes it easy to add new features:

- **Grid Patterns**: Extend `CellManager` to support pre-defined patterns
- **Animation Speed**: Add controls to `PathfindingManager` for visualization speed
- **Save/Load**: Add functionality to save and load grid configurations
- **Different Heuristics**: Extend pathfinding algorithms with configurable heuristics

### Customizing Appearance

All visual styling is controlled through CSS variables in `styles.css`:

```css
:root {
  --cell-size: 30px;          /* Size of each grid cell */
  --grid-gap: 5px;            /* Gap between cells */
  --cell-start-color: #088b3b; /* Start cell color */
  --cell-end-color: #830707;   /* End cell color */
  --cell-path-color: #ffd700;  /* Path color */
  /* ... more variables */
}
```

## Technical Notes

- The application uses ES6 modules for clean dependency management
- All algorithms run asynchronously with visualization delays
- Grid automatically adapts to window size changes
- Event listeners are properly managed to prevent memory leaks
- CSS animations provide smooth visual feedback

## Browser Support

- Modern browsers with ES6 module support
- Chrome, Firefox, Safari, Edge (latest versions)
- No external dependencies required
