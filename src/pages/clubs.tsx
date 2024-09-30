import {useState, useEffect} from "react"
import { toast } from "react-toastify";

export function Clubs() {

    const [clubs, setClubs] = useState<{id:string,titre:string}[]>([])
    const [loading, setLoading] = useState(false)

    async function getClub(){
        setLoading(true)
        try{
            const response = await fetch(import.meta.env.VITE_DERBY_FRANCE_URL_API + 'clubs');
            setClubs( await response.json())
        } catch(e){
            toast.error("Erreur lors de la récupération des clubs")
        } finally{
            setLoading(false)
        }
    }

    useEffect(()=>{
        getClub()
    },[])

    if(loading) return <div>chargement...</div>

    return (
        <div className="grid h-full grid-rows-[auto_1fr] items-center">
            <div className="flex-1 w-full flex justify-between item-center gap-2 p-3 bg-[100]">
                <h1 className="opacity-70 pt-5">LISTE DES <span className="font-bold">CLUBS</span></h1>
            </div>
            <div className="h-full relative">
                <div className="absolute inset-0 overflow-y-auto p-2 flex flex-col">
                    {clubs.map(club=><div key={club.id}  className="p-2  odd:bg-[rgba(0,0,0,0.05)]">{club.titre}</div>)}
                </div>
            </div>
        </div>
    );
}