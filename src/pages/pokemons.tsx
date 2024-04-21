import { useState } from 'react'
import { Pokemon } from '../components/pokemon/pokemon'
import { useDebounce } from '../hooks/debounce.hook'
import { Link } from 'react-router-dom'

export function Pokemons() {
    const [name, setName] = useState('pikachu')
    const debouncedName = useDebounce<string>(name, 1000)
    return (
        <>
            <div className='flex flex-col items-center'>
            <div><Link to="/test/ditto">Ditto</Link></div>
            <div><Link to="/test/pikachu">Pika</Link></div>
                <div>
                    <input
                        type="texte"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <Pokemon name={debouncedName} />
                </div>
            </div>
        </>
    )
}