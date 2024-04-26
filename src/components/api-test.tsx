import { useEffect } from "react"

export function ApiTest() {

async function handleFetch() {
    const response = await fetch(import.meta.env.VITE_BASE_URL_API + '/todos')
    const data = await response.json()
    console.log (data)
}

useEffect(() => {handleFetch()},[])

    return (
        <div className='bg-300 p-8 border-solid border-2 border-100 rounded-xl max-w-72'>
            <h1 className='text-800'>{'voilà'}</h1>
        </div>)
}
