export interface Tile {
  id: string; // Ex: "tile-1724712000000-1" (usado para o layoutId do Framer Motion)
  value: number; // 1, 2, 3, 4... (mapeia para bottle_01, bottle_02...)
  row: number; // 0 a 3
  col: number; // 0 a 3
  mergedInto?: string; // ID da garrafa onde esta vai se fundir
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';