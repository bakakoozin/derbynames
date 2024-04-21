import styles from "./tic-tac-toe-square.module.css"
import type { SquareType } from "./tic-tact-toe.type";

type SquareProps = {
  value: SquareType;
  onSquareClick: () => void;
}

export function Square({ value, onSquareClick }: SquareProps){

  return (
    <button className={styles.container} onClick={onSquareClick}>
      {value?.value}
    </button>
  );
}