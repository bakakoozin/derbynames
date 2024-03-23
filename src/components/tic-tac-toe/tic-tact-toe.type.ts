export type SquareType = {
  index: number;
  value: 'X' |'O' | null;
}

export type Winner = 'X' | 'O' | null;

export type Board = {
  squares: SquareType[];
  xIsNext: boolean;
  winner: Winner
}