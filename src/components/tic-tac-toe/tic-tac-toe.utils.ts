import type { SquareType, Winner } from "./tic-tact-toe.type";

export const defaultGrid: SquareType[] = Array.from({ length: 9 }, (_, index) => ({ index, value: null }))

export function calculateWinner(squares: SquareType[]): Winner {

  // Les combinaisons gagnantes
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ]

  // Si aucune combinaison gagnante n'est trouvée on retourne null
  return lines.reduce((acc: Winner, [a, b, c]) => {

    if (squares[a].value && squares[a].value === squares[b].value && squares[a].value === squares[c].value) {
      return squares[a].value
    }
    return acc
  }, null)

}