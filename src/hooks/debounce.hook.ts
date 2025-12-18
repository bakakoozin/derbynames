import { createEffect, createSignal, Accessor } from "solid-js"

export function useDebounce<T>(value: T | Accessor<T>, delay: number = 500) {
  // Si c'est un accessor, on l'utilise directement, sinon on crée une fonction qui retourne la valeur
  const getValue: Accessor<T> = typeof value === 'function'
    ? (value as Accessor<T>)
    : () => value as T;

  const [debouncedValue, setDebouncedValue] = createSignal<T>(getValue())

  createEffect(() => {
    // Lire la valeur actuelle pour déclencher la réactivité
    const currentValue = getValue();
    const timer = setTimeout(() => setDebouncedValue(() => currentValue), delay)

    return () => {
      clearTimeout(timer)
    }
  })

  return debouncedValue
}