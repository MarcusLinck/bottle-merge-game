export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Tile {
  id: string;
  row: number;
  col: number;
  value: number;
  isNew?: boolean;
  isMerged?: boolean;
  mergedIntoId?: string; // Para controlar a animação de deslizamento duplo
}