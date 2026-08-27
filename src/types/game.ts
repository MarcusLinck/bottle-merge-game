export interface Tile {
  id: string;
  row: number;
  col: number;
  value: number;
  isNew?: boolean;
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';