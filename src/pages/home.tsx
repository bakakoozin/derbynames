import { Link } from 'react-router-dom'

export function Home() {
  return (
    <>
      <div className='pb-10'>
        <div className='mt-10'><Link className='text-600 hover:text-300' to="/pokemons">Pokemons</Link></div>
        <div className='mt-10'><Link className='text-600 hover:text-300' to="/tictactoe">Tic Tac Toe</Link></div>
        <div className='mt-10'><Link className='text-600 hover:text-300' to="/counter">Counter</Link></div>
        <div className='mt-10'><Link className='text-600 hover:text-300' to="/api-test">Api-Test</Link></div>
      </div>
    </>
  )
}