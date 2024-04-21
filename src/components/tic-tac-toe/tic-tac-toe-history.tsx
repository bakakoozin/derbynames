import styles from './tic-tac-toe-history.module.css'
import type { SquareType } from './tic-tact-toe.type'


type TicTacToeHistoryProps = {
  history: SquareType[][]
  jumpTo: (move: number) => void
}

export function TicTacToeHistory({ history, jumpTo }: TicTacToeHistoryProps) {

  return <div className={styles.container}>
    {
      history.map((_, index: number) => {
        const description = index ? 'Go to move #' + index : 'Go to game start'
        return (
          <div key={index} className={styles.history}>
            <button onClick={() => jumpTo(index)}>{description}</button>
          </div>
        )
      })
    }
  </div>
}
