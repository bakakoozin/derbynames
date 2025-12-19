import { For, createSignal, createEffect } from "solid-js";
import { Search, searchValue } from "~/components/search";
import { Loader } from "~/ui/loader";

type Club = {
  id: string;
  name: string;
};

export default function ClubsPage() {
  const [clubs, setClubs] = createSignal<Club[]>([]);
  const [loading, setLoading] = createSignal(true);

  createEffect(() => {
    fetch("/api/clubs")
      .then((res) => res.json())
      .then((data: Club[]) => {
        setClubs(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading clubs:", error);
        setLoading(false);
      });
  });

  const filteredClubs = (): Club[] => {
    const all = clubs();
    if (!all || all.length === 0) return [];

    const search = searchValue().toLowerCase();
    if (!search) return all;

    return all.filter((club) =>
      club.name.toLowerCase().includes(search) ||
      club.id.toLowerCase().includes(search)
    );
  };

  return (
    <div class="grid h-full grid-rows-[auto_1fr] items-center">
      <div class="w-full flex flex-wrap justify-between items-center gap-2 p-3">
        <h1 class="text-dn-600 h-full flex items-center gap-1 m-0">
          Liste des
          <span class="font-bold"> CLUBS DE ROLLER DERBY</span>
        </h1>
        <Search />
      </div>

      <div class="h-full relative">
        <div class="absolute inset-0 overflow-y-auto p-2 flex flex-col">
          {loading() && (
            <div class="flex h-full items-center justify-center">
              <Loader />
            </div>
          )}

          {!loading() && (
            <div class="flex flex-col gap-2">
              <For each={filteredClubs()}>
                {(club) => (
                  <div class="p-2 odd:bg-[rgba(0,0,0,0.05)] flex gap-3 items-center">
                    <div class="bg-dn-500 text-dn-100 p-3 w-32 text-center text-xs md:text-sm uppercase tracking-wide">
                      {club.id}
                    </div>
                    <div class="flex-1 flex items-center">
                      <div class="font-display text-dn-600">
                        {club.name}
                      </div>
                    </div>
                  </div>
                )}
              </For>

              {filteredClubs().length === 0 && !loading() && (
                <div class="flex justify-center h-full items-center">
                  <div class="bg-dn-500 text-dn-100 p-3 text-lg">
                    Aucun club ne correspond à votre recherche
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


