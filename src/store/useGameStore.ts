import { create } from 'zustand';
import { Tile, Direction } from '@/types/game';

interface GameState {
  tiles: Tile[];
  score: number;
  movesCount: number;
  gameOver: boolean;
  initGame: () => void;
  move: (direction: Direction) => void;
}

const GRID_SIZE = 4;

const generateId = () => `tile-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

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
      if (c < GRID_SIZE - 1 && current === grid[r][c + 1]) return false;
      if (r < GRID_SIZE - 1 && current === grid[r + 1][c]) return false;
    }
  }

  return true;
};

// Adiciona a nova garrafa marcando isNew = true
const spawnRandomTile = (currentTiles: Tile[]): Tile[] => {
  const emptyPositions = getEmptyPositions(currentTiles);
  if (emptyPositions.length === 0) return currentTiles;

  const randomPos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
  const newValue = Math.random() < 0.9 ? 1 : 2;

  // Remove a flag isNew e isMerged das garrafas anteriores
  const cleanedTiles = currentTiles.map((tile) => ({
    ...tile,
    isNew: false,
    isMerged: false, // 👈 Reseta a animação de fusão no próximo turno
  }));

  return [
    ...cleanedTiles,
    {
      id: generateId(),
      row: randomPos.row,
      col: randomPos.col,
      value: newValue,
      isNew: true,
      isMerged: false,
    },
  ];
};

export const useGameStore = create<GameState>((set, get) => ({
  tiles: [],
  score: 0,
  gameOver: false,
  movesCount: 0,

  initGame: () => {
    let initialTiles: Tile[] = [];
    initialTiles = spawnRandomTile(initialTiles);
    initialTiles = spawnRandomTile(initialTiles);
    set({ tiles: initialTiles, score: 0, movesCount: 0, gameOver: false });
  },

  move: (direction: Direction) => {
    const { tiles, score, movesCount, gameOver } = get();
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

          // 🔥 MANTÉM o id da peça original (current.id) em vez de gerar um novo!
          // Isso faz a garrafa deslizar até a posição final antes do impacto.
          result.push({
            id: current.id, 
            value: mergedValue,
            row: current.row,
            col: current.col,
            isNew: false,
            isMerged: true,
          });

          i++; // Pula a garrafa consumida
          moved = true;
        } else {
          result.push({ ...current, isMerged: false });
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
      set({ tiles: tilesWithNewOne, score: newScore, movesCount: movesCount + 1, gameOver: isOver });
    }
  },
}));