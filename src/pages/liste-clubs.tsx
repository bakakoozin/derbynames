import {useState, useEffect} from "react"

export function ListeClubs() {

    const [clubs, setClubs] = useState([])
    const [loading, setLoading] = useState(false)

    async function getClub(){

        setLoading(true)
        try{
            const response = await fetch(import.meta.env.VITE_DERBY_FRANCE_URL_API + 'clubs');
            setClubs( await response.json())
        } catch(e){
            //TODO à gérer

        } finally{
            setLoading(false)
        }
    }
console.log(clubs)
    useEffect(
        ()=>{
            getClub()
        }
    ,[])

    if(loading) return <div>chargement...</div>

    return (
        <div>
            <div className="flex flex-col items-center">
            <h1 className="opacity-70 pt-5">LES CLUBS DE <span className="font-bold">ROLLER DERBY</span> EN FRANCE</h1>
                {
                    clubs.map(club=><div key={club.id}>{club.titre}</div>)                
                    }
            </div>
        </div>
    );
}