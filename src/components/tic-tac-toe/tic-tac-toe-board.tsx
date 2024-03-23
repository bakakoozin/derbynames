import styles from "./tic-tac-toe-board.module.css"
import { calculateWinner } from "./tic-tac-toe.utils";

import type { SquareType } from "./tic-tact-toe.type";
import { Square } from "./tic-tac-toe-square";

type TicTacToeBoardProps = {
  xIsNext: boolean
  squares: SquareType[]
  onPlay: (squares: SquareType[]) => void
}

export function TicTacToeBoard({ xIsNext, squares, onPlay }: TicTacToeBoardProps) {

  const handleClick = (i: number) => {
    if (calculateWinner(squares) || squares[i].value) return
    const nextSquares = squares.slice();
    nextSquares[i].value = xIsNext ? "X" : "O";
    onPlay(nextSquares)
  }

  return (
    <div className={styles.gameBoard}>
      <div className={styles.boardRow}>
        {squares.map((square: SquareType, index: number) => (<Square key={square.index} value={square} onSquareClick={() => handleClick(index)} />))}
      </div>
    </div>
  );
}
