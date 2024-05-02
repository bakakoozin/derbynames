import { useParams } from 'react-router-dom';
import { SearchDerbyname } from './pokemon/pokemon';


export function DerbynameResult() {
    const { name } = useParams()
    
    if (!name) return <h2>Ce derbyname n'est pas utilisé</h2>
    return <SearchDerbyname name={name} />
}