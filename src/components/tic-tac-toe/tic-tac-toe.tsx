import { useState } from "react";
import styles from './tic-tac-toe.module.css'
import { defaultGrid } from './tic-tac-toe.utils';

import { TicTacToeHistory } from "./tic-tac-toe-history";
import { TicTacToeBoard } from "./tic-tac-toe-board";
import { TicTacToeRank } from "./tic-tac-toe-rank";

import type { SquareType } from './tic-tact-toe.type'

export function TicTacToe() {

  // === STATES ==============================================================
  const [history, setHistory] = useState<SquareType[][]>([defaultGrid]);
  const [currentMove, setCurrentMove] = useState(0)

  // === CONST ==============================================================
  const xIsNext = currentMove % 2 === 0
  const currentSquares = history[currentMove]

  // === HANDLERS ==============================================================
  const handlePlay = (nextSquares: SquareType[]) => {
    // give the next move
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares]
    setHistory([...history, nextSquares])
    setCurrentMove(nextHistory.length - 1)
  }

  const jumpTo = (nextMove: number) => {
    setCurrentMove(nextMove)
  }

  // === RENDER ==============================================================
  return (
    <div className={styles.container}>
      <div className={styles.board}>
        <TicTacToeBoard xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
        <TicTacToeRank squares={currentSquares} xIsNext={xIsNext} />
      </div>
      <TicTacToeHistory history={history} jumpTo={jumpTo} />
    </div>
  )
}


