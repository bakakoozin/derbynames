import { useState, useEffect } from "react"
import { Search } from "../components/search";
import { toast } from 'react-toastify';
import { Loader } from "../ui/loader";
import { useSearchParams } from "react-router-dom";

export function Derbynames() {

    const [derbyNames, setDerbyNames] = useState<{ name: string, numRoster: string, club: string }[]>([])
    const [loading, setLoading] = useState(false)
    const [searchParams] = useSearchParams();
    const search = searchParams.get("search") || "";


    function dbNamefilter(dName: { name: string, numRoster: string }) {

        if (!search) return true

        const name = dName.name.toLowerCase().trim()
        const cleanSearch = search.toLowerCase().trim()


        return name.includes(cleanSearch)

    }

    async function getDerbyName() {

        setLoading(true)
        try {
            const response = await fetch(import.meta.env.VITE_BASE_URL_API + '/derbynames');
            setDerbyNames(await response.json())
            if (!response.ok) throw new Error("Erreur lors de la récupération des derby names")
        } catch (e) {
            toast.error("Erreur lors de la récupération des derby names")
        } finally {
            setLoading(false)
        }
    }

    useEffect(
        () => {
            getDerbyName()
        }
        , [])

    if (loading) return <div className="flex h-full items-center justify-center"><Loader /></div>

    return (
        <div className="grid h-full grid-rows-[auto_1fr] items-center">
            <div className="flex-1 w-full flex justify-between item-center gap-2 p-3 bg-[100]">
                <h1 className="opacity-70 pt-5">LISTE DES <span className="font-bold">DERBY NAMES</span></h1>
                <Search />
            </div>
            <div className="h-full relative">
                <div className="absolute inset-0 overflow-y-auto p-2 flex flex-col">
                    {
                        derbyNames
                            .filter(dbNamefilter)
                            .map((dName) => <div key={dName.name} className="p-2  odd:bg-[rgba(0,0,0,0.05)] flex gap-3 items-center justify-between">
                                <div className="flex gap-2 items-center">
                                    <div className="bg-500 text-100 p-3 w-24 text-center">
                                        {dName.numRoster}
                                    </div>

                                    <div className="text-lg font-bold">
                                        {dName.name}
                                    </div>
                                </div>

                                <div className="flex justify-end italic">
                                    {dName.club || '--'}
                                </div>
                            </div>
                            )
                    }

                    {
                        derbyNames.filter(dbNamefilter).length === 0 && <div className="flex justify-center h-full items-center">

                            <div className="bg-500 text-100 p-3 text-lg">Aucun derby name ne correspond à votre recherche</div>
                        </div>

                    }

                </div>
            </div>
        </div>
    );
}