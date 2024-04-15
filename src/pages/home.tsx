import { Link } from 'react-router-dom'

export function Home() {
  return (
    <>
      <h1>TUTO APP</h1>
      <div>
        <div className='mt-10'><Link className='text-600' to="/pokemons">Pokemons</Link></div>
        <div className='mt-10'><Link className='text-600' to="/tictactoe">Tic Tac Toe</Link></div>
        <div className='mt-10'><Link className='text-600' to="/counter">Counter</Link></div>
      </div>
    </>
  )
}