//Bibliothèques externes
import { useEffect, useState } from "react"

export function useDebounce<T>(value: T, delay?: number): T {
    //State
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    //Effect
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay || 500)

        return () => {
            clearTimeout(timer)
        }
    }, [value, delay])
    
    return debouncedValue
}