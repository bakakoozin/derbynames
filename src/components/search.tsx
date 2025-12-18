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
    <div class="flex flex-row space-x-2">
      <label class="hidden" for="derby-name-search">Recherche</label>
      <input
        class="input"
        type="search"
        id="derby-name-search"
        name="derby-name-search"
        placeholder="Recherche"
        autofocus
        value={searchValue()}
        onInput={handleChange}
      />
    </div>
  );
}
