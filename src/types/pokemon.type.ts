export type Pokemon = {
    id: number
    name: string
    weight: number
    abilities: PokemonAbility[]
    sprites: PokemonSprite
}

type PokemonAbility = {
    ability: {
    name: string
    url: string
    }
    is_hidden: boolean
    slot: number
}

type PokemonSprite = {
    back_default: string | null
    back_female: string | null
    back_shiny: string | null
    front_default: string | null
    front_female: string | null
    front_shiny: string | null
    front_shiny_female: string | null
}
