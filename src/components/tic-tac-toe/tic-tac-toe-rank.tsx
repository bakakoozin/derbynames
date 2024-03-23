import styles from "./tic-tac-toe-rank.module.css"
import { calculateWinner } from "./tic-tac-toe.utils"
import type { SquareType } from "./tic-tact-toe.type"

type TicTacToeRankProps = {
  squares: SquareType[]
  xIsNext: boolean
}
export function TicTacToeRank({ squares, xIsNext }: TicTacToeRankProps) {

  const winner = calculateWinner(squares)

  if(!winner) return null

  return (
    <div className={styles.container}>
      {winner ? 'Winner: ' + winner : 'Next player: ' + (xIsNext ? 'X' : 'O')}
    </div>
  )
}



