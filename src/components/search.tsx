import { createSignal } from "solid-js";
import { useDebounce } from "~/hooks/debounce.hook";

export const [searchValue, setSearchValue] = createSignal("");

export function Search() {
  // Debounce de 300ms pour la valeur de recherche
  const debouncedSearch = useDebounce(searchValue, 300);

  function handleChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const newValue = target.value;
    setSearchValue(newValue);
  }

  return (
    <label class="flex flex-col gap-1 text-xs text-dn-500" for="derby-name-search">
      Recherche
      <input
        class="input text-sm min-w-[10rem]"
        type="search"
        id="derby-name-search"
        name="derby-name-search"
        placeholder="Filtrer la liste…"
        autofocus
        value={searchValue()}
        onInput={handleChange}
      />
    </label>
  );
}
