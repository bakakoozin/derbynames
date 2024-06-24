import {useState, useEffect} from "react"
import { Search } from "../components/search";

export function ListeDerbynames() {

    const [derbyNames, setDerbyNames] = useState([])
    const [loading, setLoading] = useState(false)

    async function getDerbyName(){

        setLoading(true)
        try{
            const response = await fetch(import.meta.env.VITE_BASE_URL_API + '/derbynames');
            setDerbyNames( await response.json())
        } catch(e){
            //TODO à gérer

        } finally{
            setLoading(false)
        }
    }

    useEffect(
        ()=>{
            getDerbyName()
        }
    ,[])

    if(loading) return <div>chargement...</div>

    return (
        <div>
            <div className="flex flex-col items-center">
                <div className="pt-5">
                    <Search />
                </div>
                <h1 className="opacity-70 pt-5">LISTE DES <span className="font-bold">DERBY NAMES</span></h1>
                {
                    derbyNames.map((dName)=> <div key={dName.name}>{dName.name} - {dName.numRoster}</div>)
                }
            </div>
        </div>
    );
}