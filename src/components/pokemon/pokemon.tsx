import { useEffect, useState } from 'react'
import styles from './pokemon.module.css'
import { BASE_URL_POKE } from '../../utils/constants'
import type { Pokemon as TPokemon } from '../../types/pokemon.type'


type PokemonProps = {
    name: string
}

export function Pokemon({ name }: PokemonProps) {

    const [pokemon, setPokemon] = useState<TPokemon | undefined>()
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | undefined>()

    const handleFetch = async () => {
        if (!name) return
        setError(undefined)
        setLoading(true)
        try {
            const response = await fetch(BASE_URL_POKE + 'pokemon/' + name)
            const data = await response.json()
            setPokemon(data)
        } catch (error) {
            setError('POKEMON NOT FOUND')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        handleFetch()
    }, [name])

    if (loading) return <h1>Loading...</h1>
    if (error) return <h1>Error: {error}</h1>
    if (!pokemon) return <h1>No pokemon</h1>
    return (
        <div className='bg-300 p-8 border-solid border-2 border-100 rounded-xl max-w-72'>
            <h1 className='text-800'>{pokemon.name}</h1>
            <div className='text-800 font-bold'>poids: {pokemon.weight}</div>
            <div className='flex flex-row justify-center'>
            {pokemon.sprites.front_default && <div><img src={pokemon.sprites.front_default} /></div>}
            {pokemon.sprites.back_default && <div><img src={pokemon.sprites.back_default} /></div>}
            </div>
            <div className='text-800 font-bold'>Abilities</div>
            <div className='text-100 flex flex-col gap-16 border-solid border-2 border-700 bg-800 rounded-md p-4'>
                {pokemon?.abilities.map((ability) => (<div key={ability.slot}>
                    <div className={styles.abilityName}>{ability.ability.name}</div>
                </div>))}
            </div>

        </div>
    )

}