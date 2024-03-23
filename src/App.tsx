import { useState } from 'react'
import './App.css'
import { Counter } from './components/counter/counter'
import { Pokemon } from './components/pokemon/pokemon'
import { useDebounce } from './hooks/debounce.hook'
import { TicTacToe } from './components/tic-tac-toe/tic-tac-toe'

function App() {
  const [name, setName] = useState('pikachu')
  const debouncedName = useDebounce<string>(name, 1000)
  return (
    <>
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
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
