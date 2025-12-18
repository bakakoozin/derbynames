import { For, createSignal, createEffect } from "solid-js";
import { Search, searchValue } from "~/components/search";
import { Loader } from "~/ui/loader";

type Derbyname = {
  derbyname: string;
  numRoster: string;
  clubName: string | null;
};

export default function Home() {
  const [derbyNames, setDerbyNames] = createSignal<Derbyname[]>([]);
  const [loading, setLoading] = createSignal(true);

  createEffect(() => {
    fetch("/api/derbynames")
      .then((res) => res.json())
      .then((names: Derbyname[]) => {
        setDerbyNames(names);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading derbynames:", error);
        setLoading(false);
      });
  });

  const filteredNames = (): Derbyname[] => {
    const names = derbyNames();

    if (!names || names.length === 0) return [];
    const search = searchValue().toLowerCase();

    if (!search) return names;
    return names.filter(
      (dName: Derbyname) =>
        dName.derbyname.toLowerCase().includes(search) ||
        dName.numRoster.toLowerCase().includes(search) ||
        (dName.clubName && dName.clubName.toLowerCase().includes(search))
    );
  };


  return (
    <div class="grid h-full grid-rows-[auto_1fr] items-center">
      <div class="w-full flex flex-wrap justify-between items-center gap-2 p-3">
        <h1 class="text-dn-600 h-full flex items-center gap-1 line-clamp-0 m-0"> Liste des <span class=" font-bold"> DERBY NAMES</span></h1><Search />
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
              <For each={filteredNames()}>
                {(dName: Derbyname) => (
                  <div class="p-2 odd:bg-[rgba(0,0,0,0.05)] flex gap-3 items-center">

                    <div class="bg-dn-500 text-dn-100 p-3 w-24 text-center">
                      {dName.numRoster}
                    </div>
                    <div class="flex w-full justify-between items-center gap-1">
                      <div class="font-display text-dn-600">{dName.derbyname}</div>
                      {dName.clubName && (
                        <div class="text-sm text-dn-500 italic">{dName.clubName}</div>
                      )}
                    </div>

                  </div>
                )}
              </For>
              {filteredNames().length === 0 && !loading() && (
                <div class="flex justify-center h-full items-center">
                  <div class="bg-dn-500 text-dn-100 p-3 text-lg">
                    Aucun derby name ne correspond à votre recherche
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
