export interface Tile {
  id: string;
  row: number;
  col: number;
  value: number;
  isNew?: boolean;
  isMerged?: boolean; // 👈 Adicionado para detectar o impacto de fusão
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';