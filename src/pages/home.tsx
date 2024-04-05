import { useState } from 'react'
import { Counter } from '../components/counter/counter'
import { Pokemon } from '../components/pokemon/pokemon'
import { useDebounce } from '../hooks/debounce.hook'
import { TicTacToe } from '../components/tic-tac-toe/tic-tac-toe'
import { Link } from 'react-router-dom'

export function Home() {
  const [name, setName] = useState('pikachu')
  const debouncedName = useDebounce<string>(name, 1000)
  return (
    <>
    <Link to="/test/ditto">Test</Link>
    <Link to="/test/pikachu">Pika</Link>
      <h1>TUTO APP</h1>
        <TicTacToe />
      <div className="card">
        <input 
        type="texte" 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        />
        <Pokemon name={debouncedName}/>
        <Counter />
        <p className='text-600 mt-10'>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
    </>
  )
}