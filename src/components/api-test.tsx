import { useEffect } from "react"

export function ApiTest() {

async function handleFetch() {
    const response = await fetch(import.meta.env.VITE_BASE_URL_API + '/todos')
    const data = await response.json()
    console.log (data)
}

useEffect(() => {handleFetch()},[])

    return (
        <div>
            <p className="text-600">{'voilà'}</p>
        </div>)
}
