import { useState } from "react"

export function Counter() {
    const [count, setCount] = useState(0)

    const handleClick = () => {
        setCount((count) => count + 1)
    }

    return (
        <button className="mt-12 bg-900 hover:bg-800 font-medium text-xs-1rem px-5 py-2.75" onClick={handleClick}>
            count is {count}
        </button>
    )
}