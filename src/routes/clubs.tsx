import { For, createSignal, createEffect } from "solid-js";
import { Search, searchValue } from "~/components/search";
import { Loader } from "~/ui/loader";

type Club = {
  id: string;
  name: string;
  website?: string | null;
  department?: string | null;
  logoUrl?: string | null;
};

function departmentsFromClubs(list: Club[]): string[] {
  const depts = new Set<string>();
  for (const c of list) {
    const d = c.department?.trim();
    if (d) depts.add(d);
  }
  return [...depts].sort((a, b) => a.localeCompare(b));
}

export default function ClubsPage() {
  const [clubs, setClubs] = createSignal<Club[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [filterDept, setFilterDept] = createSignal<string>("all");

  createEffect(() => {
    fetch("/api/rpc", {
      method: "POST",
      body: JSON.stringify({
        method: "clubs.list",
        params: {},
      }),
    })
      .then((res) => res.json())
      .then((rpc: { result?: Club[]; error?: string }) => {
        if (!Array.isArray(rpc.result)) {
          throw new Error(rpc.error || "Erreur de chargement");
        }
        setClubs(rpc.result);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading clubs:", error);
        setLoading(false);
      });
  });

  const departments = (): string[] => departmentsFromClubs(clubs());

  const filteredClubs = (): Club[] => {
    let all = clubs();
    if (!all || all.length === 0) return [];

    const dept = filterDept();
    if (dept && dept !== "all") {
      all = all.filter((club) => (club.department?.trim() || "") === dept);
    }

    const search = searchValue().toLowerCase();
    if (!search) return all;

    return all.filter((club) =>
      club.name.toLowerCase().includes(search) ||
      club.id.toLowerCase().includes(search) ||
      (club.department && club.department.toLowerCase().includes(search)),
    );
  };

  return (
    <div class="grid h-full grid-rows-[auto_1fr] items-center">
      <div class="w-full flex flex-wrap justify-between items-end gap-2 p-3">
        <h1 class="text-dn-600 h-full flex items-center gap-1 m-0">
          Liste des
          <span class="font-bold"> CLUBS DE ROLLER DERBY</span>
        </h1>
        <div class="flex flex-wrap items-end gap-2">
          <label class="flex flex-col gap-1 text-xs text-dn-500">
            Département
            <select
              class="input cursor-pointer text-sm min-w-[8rem]"
              value={filterDept()}
              onChange={(e) => setFilterDept(e.currentTarget.value)}
            >
              <option value="all">Tous</option>
              <For each={departments()}>
                {(d) => (
                  <option value={d}>{d}</option>
                )}
              </For>
            </select>
          </label>
          <Search />
        </div>
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
                  <div class="p-2 odd:bg-[rgba(0,0,0,0.05)] flex gap-3 items-center flex-wrap">
                    <div class="bg-dn-500 text-dn-100 flex min-h-[3rem] min-w-[3rem] shrink-0 items-center justify-center px-2 py-3 text-center font-display text-xs tabular-nums md:text-sm">
                      {club.department?.trim() || "—"}
                    </div>
                    <div class="flex-1 flex flex-col gap-1 min-w-[12rem]">
                      <div class="font-display text-dn-600">
                        {club.name}
                      </div>
                      <div class="text-xs text-dn-500 flex flex-wrap gap-2">
                        {club.department && (
                          <span>Dép. {club.department}</span>
                        )}
                        {club.website && (
                          <a
                            href={club.website.startsWith("http") ? club.website : `https://${club.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="underline"
                          >
                            Site
                          </a>
                        )}
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
