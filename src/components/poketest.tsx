import { useParams } from 'react-router-dom';
import { Pokemon } from './pokemon/pokemon';


export function Poke() {
    const { name } = useParams()
    
    if (!name) return null
    return <Pokemon name={name} />
}