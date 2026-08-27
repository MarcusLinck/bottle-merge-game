import { create } from 'zustand';
import { Tile, Direction } from '@/types/game';

interface GameState {
  tiles: Tile[];
  score: number;
  gameOver: boolean;
  initGame: () => void;
  move: (direction: Direction) => void;
}

const GRID_SIZE = 4;

const createTile = (row: number, col: number, value = 1): Tile => ({
  id: `tile-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
  value,
  row,
  col,
});

const getEmptyPositions = (tiles: Tile[]) => {
  const empty: { row: number; col: number }[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!tiles.some((t) => t.row === r && t.col === c)) {
        empty.push({ row: r, col: c });
      }
    }
  }
  return empty;
};

const checkGameOver = (tiles: Tile[]): boolean => {
  if (tiles.length < GRID_SIZE * GRID_SIZE) return false;

  const grid: (number | null)[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
  tiles.forEach((t) => (grid[t.row][t.col] = t.value));

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const current = grid[r][c];
      if (current === null) return false;
      // Checa vizinho à direita
      if (c < GRID_SIZE - 1 && current === grid[r][c + 1]) return false;
      // Checa vizinho abaixo
      if (r < GRID_SIZE - 1 && current === grid[r + 1][c]) return false;
    }
  }

  return true;
};

const spawnRandomTile = (currentTiles: Tile[]): Tile[] => {
  const emptyPositions = getEmptyPositions(currentTiles);
  if (emptyPositions.length === 0) return currentTiles;

  const randomPos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
  return [...currentTiles, createTile(randomPos.row, randomPos.col, 1)];
};

export const useGameStore = create<GameState>((set, get) => ({
  tiles: [],
  score: 0,
  gameOver: false,

  initGame: () => {
    let initialTiles: Tile[] = [];
    initialTiles = spawnRandomTile(initialTiles);
    initialTiles = spawnRandomTile(initialTiles);
    set({ tiles: initialTiles, score: 0, gameOver: false });
  },

  move: (direction: Direction) => {
    const { tiles, score, gameOver } = get();
    if (gameOver) return;

    let moved = false;
    let newScore = score;

    const grid: (Tile | null)[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
    tiles.forEach((t) => (grid[t.row][t.col] = { ...t }));

    const newTiles: Tile[] = [];

    const processVector = (line: (Tile | null)[]) => {
      const filtered = line.filter((t): t is Tile => t !== null);
      const result: Tile[] = [];

      for (let i = 0; i < filtered.length; i++) {
        const current = filtered[i];
        const next = filtered[i + 1];

        if (next && current.value === next.value) {
          const mergedValue = current.value + 1;
          newScore += mergedValue * 10;
          result.push({ ...current, value: mergedValue });
          i++;
          moved = true;
        } else {
          result.push(current);
        }
      }
      return result;
    };

    for (let i = 0; i < GRID_SIZE; i++) {
      let line: (Tile | null)[] = [];

      for (let j = 0; j < GRID_SIZE; j++) {
        if (direction === 'LEFT') line.push(grid[i][j]);
        if (direction === 'RIGHT') line.push(grid[i][GRID_SIZE - 1 - j]);
        if (direction === 'UP') line.push(grid[j][i]);
        if (direction === 'DOWN') line.push(grid[GRID_SIZE - 1 - j][i]);
      }

      const processed = processVector(line);

      for (let j = 0; j < GRID_SIZE; j++) {
        const targetTile = processed[j];
        if (targetTile) {
          let newRow = i;
          let newCol = j;

          if (direction === 'LEFT') { newRow = i; newCol = j; }
          if (direction === 'RIGHT') { newRow = i; newCol = GRID_SIZE - 1 - j; }
          if (direction === 'UP') { newRow = j; newCol = i; }
          if (direction === 'DOWN') { newRow = GRID_SIZE - 1 - j; newCol = i; }

          if (targetTile.row !== newRow || targetTile.col !== newCol) {
            moved = true;
          }

          newTiles.push({ ...targetTile, row: newRow, col: newCol });
        }
      }
    }

    if (moved) {
      const tilesWithNewOne = spawnRandomTile(newTiles);
      const isOver = checkGameOver(tilesWithNewOne);
      set({ tiles: tilesWithNewOne, score: newScore, gameOver: isOver });
    }
  },
}));