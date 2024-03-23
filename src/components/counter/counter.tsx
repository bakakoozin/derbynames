import styles from './counter.module.css';

import { useState } from "react"

export function Counter() {
    const [count, setCount] = useState(0)

    const handleClick = () => {
        setCount((count) => count + 1)
    }

    return (
        <button className={styles.container} onClick={handleClick}>
            count is {count}
        </button>
    )
}