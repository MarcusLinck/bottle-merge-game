import { create } from 'zustand';
import { Tile, Direction } from '@/types/game';

interface GameState {
  tiles: Tile[];
  score: number;
  movesCount: number;
  gameOver: boolean;
  isMoving: boolean;
  initGame: () => void;
  move: (direction: Direction) => void;
}

const GRID_SIZE = 4;

const generateId = () => `tile-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const getEmptyPositions = (tiles: Tile[]) => {
  const empty: { row: number; col: number }[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!tiles.some((t) => t.row === r && t.col === c && !t.mergedIntoId)) {
        empty.push({ row: r, col: c });
      }
    }
  }
  return empty;
};

const checkGameOver = (tiles: Tile[]): boolean => {
  const activeTiles = tiles.filter((t) => !t.mergedIntoId);
  if (activeTiles.length < GRID_SIZE * GRID_SIZE) return false;

  const grid: (number | null)[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
  activeTiles.forEach((t) => (grid[t.row][t.col] = t.value));

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

const spawnRandomTile = (currentTiles: Tile[]): Tile[] => {
  const emptyPositions = getEmptyPositions(currentTiles);
  if (emptyPositions.length === 0) return currentTiles;

  const randomPos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
  const newValue = Math.random() < 0.9 ? 1 : 2;

  const updatedTiles = currentTiles.map((tile) => ({
    ...tile,
    isNew: false,
  }));

  return [
    ...updatedTiles,
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
  isMoving: false,

  initGame: () => {
    let initialTiles: Tile[] = [];
    initialTiles = spawnRandomTile(initialTiles);
    initialTiles = spawnRandomTile(initialTiles);
    set({ tiles: initialTiles, score: 0, movesCount: 0, gameOver: false, isMoving: false });
  },

  move: (direction: Direction) => {
    const { score, movesCount, gameOver, isMoving } = get();
    if (gameOver || isMoving) return;

    // Limpa estado anterior (filtra tiles deletados no merge anterior)
    const cleanedTiles = get().tiles
      .filter((t) => !t.mergedIntoId)
      .map((tile) => ({
        ...tile,
        isMerged: false,
        isNew: false,
      }));

    let moved = false;
    let addedScore = 0;

    const grid: (Tile | null)[][] = Array.from({ length: GRID_SIZE }, () =>
      Array(GRID_SIZE).fill(null)
    );
    cleanedTiles.forEach((t) => (grid[t.row][t.col] = { ...t }));

    const intermediateTiles: Tile[] = [];
    const finalTiles: Tile[] = [];

    for (let i = 0; i < GRID_SIZE; i++) {
      const line: (Tile | null)[] = [];

      for (let j = 0; j < GRID_SIZE; j++) {
        if (direction === 'LEFT') line.push(grid[i][j]);
        if (direction === 'RIGHT') line.push(grid[i][GRID_SIZE - 1 - j]);
        if (direction === 'UP') line.push(grid[j][i]);
        if (direction === 'DOWN') line.push(grid[GRID_SIZE - 1 - j][i]);
      }

      const nonNull = line
        .map((tile, idx) => ({ tile, originalIndex: idx }))
        .filter((item): item is { tile: Tile; originalIndex: number } => item.tile !== null);

      let targetIdx = 0;

      for (let k = 0; k < nonNull.length; k++) {
        const current = nonNull[k];
        const next = nonNull[k + 1];

        const getTargetPos = (index: number) => {
          let r = i, c = index;
          if (direction === 'LEFT') { r = i; c = index; }
          if (direction === 'RIGHT') { r = i; c = GRID_SIZE - 1 - index; }
          if (direction === 'UP') { r = index; c = i; }
          if (direction === 'DOWN') { r = GRID_SIZE - 1 - index; c = i; }
          return { row: r, col: c };
        };

        const targetPos = getTargetPos(targetIdx);

        if (next && current.tile.value === next.tile.value) {
          const mergedValue = current.tile.value + 1;
          addedScore += mergedValue * 10;
          moved = true;

          const mergedId = generateId();

          // Ambas as peças deslizam até a célula de fusão
          intermediateTiles.push({
            ...current.tile,
            row: targetPos.row,
            col: targetPos.col,
            mergedIntoId: mergedId,
          });

          intermediateTiles.push({
            ...next.tile,
            row: targetPos.row,
            col: targetPos.col,
            mergedIntoId: mergedId,
          });

          // Peça final que assume a vaga no término do deslizamento
          finalTiles.push({
            id: mergedId,
            value: mergedValue,
            row: targetPos.row,
            col: targetPos.col,
            isNew: false,
            isMerged: true,
          });

          k++;
          targetIdx++;
        } else {
          if (current.tile.row !== targetPos.row || current.tile.col !== targetPos.col) {
            moved = true;
          }

          const updatedTile = {
            ...current.tile,
            row: targetPos.row,
            col: targetPos.col,
            isMerged: false,
          };

          intermediateTiles.push(updatedTile);
          finalTiles.push(updatedTile);

          targetIdx++;
        }
      }
    }

    if (moved) {
      // ETAPA 1: Renderiza o deslizamento das garrafas até o destino
      set({ tiles: intermediateTiles, isMoving: true });

      // ETAPA 2: Após o término do deslizamento (150ms), completa a fusão
      setTimeout(() => {
        const currentScore = get().score + addedScore;
        const tilesWithNew = spawnRandomTile(finalTiles);
        const isOver = checkGameOver(tilesWithNew);

        set({
          tiles: tilesWithNew,
          score: currentScore,
          movesCount: movesCount + 1,
          gameOver: isOver,
          isMoving: false,
        });
      }, 150);
    }
  },
}));