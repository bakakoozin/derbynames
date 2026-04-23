import { For, createSignal, createEffect } from "solid-js";
import { A } from "@solidjs/router";
import { Search, searchValue } from "~/components/search";
import { Loader } from "~/ui/loader";

type Derbyname = {
  derbyname: string;
  numRoster: string;
  clubName: string | null;
  department: string | null;
};

type ClubOpt = { id: string; name: string; department?: string | null };

export default function Home() {
  const [derbyNames, setDerbyNames] = createSignal<Derbyname[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [clubs, setClubs] = createSignal<ClubOpt[]>([]);
  const [filterClubId, setFilterClubId] = createSignal<string>("all");
  const [filterDept, setFilterDept] = createSignal<string>("all");

  createEffect(() => {
    fetch("/api/clubs")
      .then((res) => res.json())
      .then((list: ClubOpt[]) => {
        setClubs(list.filter((c) => c.id !== "autre"));
      })
      .catch(() => setClubs([]));
  });

  createEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    const cid = filterClubId();
    const dept = filterDept();
    if (cid && cid !== "all") params.set("clubId", cid);
    if (dept && dept !== "all") params.set("department", dept);
    const qs = params.toString();

    fetch(`/api/derbynames${qs ? `?${qs}` : ""}`)
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

  const departments = (): string[] => {
    const depts = new Set<string>();
    for (const c of clubs()) {
      const d = c.department?.trim();
      if (d) depts.add(d);
    }
    derbyNames().forEach((d) => {
      const x = d.department?.trim();
      if (x) depts.add(x);
    });
    return [...depts].sort((a, b) => a.localeCompare(b));
  };

  const filteredNames = (): Derbyname[] => {
    const names = derbyNames();

    if (!names || names.length === 0) return [];
    const search = searchValue().toLowerCase();

    if (!search) return names;
    return names.filter(
      (dName: Derbyname) =>
        dName.derbyname.toLowerCase().includes(search) ||
        dName.numRoster.toLowerCase().includes(search) ||
        (dName.clubName && dName.clubName.toLowerCase().includes(search)),
    );
  };

  return (
    <div class="grid h-full grid-rows-[auto_1fr] items-center">
      <div class="w-full flex flex-wrap justify-between items-center gap-2 p-3">
        <h1 class="text-dn-600 h-full flex items-center gap-1 line-clamp-0 m-0">
          Liste des <span class=" font-bold"> DERBY NAMES</span>
        </h1>
        <div class="flex flex-wrap gap-2 items-end">
          <label class="flex flex-col gap-1 text-xs text-dn-500">
            Club
            <select
              class="input cursor-pointer text-sm min-w-[10rem]"
              value={filterClubId()}
              onChange={(e) => setFilterClubId(e.currentTarget.value)}
            >
              <option value="all">Tous</option>
              <For each={clubs()}>
                {(c) => (
                  <option value={c.id}>
                    {c.department?.trim()
                      ? `${c.department} — ${c.name}`
                      : c.name}
                  </option>
                )}
              </For>
            </select>
          </label>
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
                  <option value={d}>
                    {d}
                  </option>
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
              <For each={filteredNames()}>
                {(dName: Derbyname) => (
                  <div class="p-2 odd:bg-[rgba(0,0,0,0.05)] flex gap-3 items-center">

                    <div class="bg-dn-500 text-dn-100 p-3 w-24 text-center">
                      {dName.numRoster}
                    </div>
                    <div class="flex w-full justify-between items-center gap-1">
                      <A
                        href={`/historique?${new URLSearchParams({
                          derbyname: dName.derbyname,
                          numRoster: dName.numRoster,
                        }).toString()}`}
                        class="font-display text-dn-600 underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dn-500 cursor-pointer min-w-0 truncate text-left"
                        title="Voir l’historique des changements de nom"
                      >
                        {dName.derbyname}
                      </A>
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
