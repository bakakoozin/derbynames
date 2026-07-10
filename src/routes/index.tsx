import { For, Show, createSignal, createEffect } from "solid-js";
import { Search, searchValue } from "~/components/search";
import { Loader } from "~/ui/loader";

type Derbyname = {
  derbyname: string;
  derbyType: string;
  numRoster: string | null;
  clubId: string | null;
  clubName: string | null;
  parentClubId: string | null;
  parentClubName: string | null;
  department: string | null;
};

function RefereeJerseyIcon(props: { uid: string }) {
  const cid = `jc-${props.uid}`;
  const shirtPath = "M12 2.5C11 3.5 9.5 4.2 8.5 4.6L3 6.5L4.5 10.5L7 9.5L7 21L17 21L17 9.5L19.5 10.5L21 6.5L15.5 4.6C14.5 4.2 13 3.5 12 2.5Z";
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="mx-auto size-6" aria-label="Arbitre">
      <defs>
        <clipPath id={cid}><path d={shirtPath} /></clipPath>
      </defs>
      <rect x="0" y="0" width="24" height="24" fill="currentColor" clip-path={`url(#${cid})`} opacity="0.25" />
      <rect x="7" y="0" width="3" height="24" fill="currentColor" clip-path={`url(#${cid})`} />
      <rect x="14" y="0" width="3" height="24" fill="currentColor" clip-path={`url(#${cid})`} />
      <path d={shirtPath} stroke="currentColor" stroke-width="1" stroke-linejoin="round" />
    </svg>
  );
}

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
    // si club parent sélectionné (il a des enfants), on ne filtre pas côté API
    // pour pouvoir inclure les collectifs ensuite en client-side
    const hasChildren = clubs().some((c) => c.parentClubId === cid);
    if (cid && cid !== "all" && !hasChildren) params.set("clubId", cid);
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
    let names = derbyNames();
    if (!names || names.length === 0) return [];

    // filtre club hiérarchique côté client (parent + ses collectifs)
    const cid = filterClubId();
    if (cid && cid !== "all") {
      const childIds = clubs()
        .filter((c) => c.parentClubId === cid)
        .map((c) => c.id);
      if (childIds.length > 0) {
        const allowed = new Set([cid, ...childIds]);
        names = names.filter((d) => d.clubId != null && allowed.has(d.clubId));
      }
    }

    const search = searchValue().toLowerCase();
    if (!search) return names;
    return names.filter(
      (dName: Derbyname) =>
        dName.derbyname.toLowerCase().includes(search) ||
        (dName.numRoster?.toLowerCase().includes(search) ?? false) ||
        (dName.clubName && dName.clubName.toLowerCase().includes(search)),
    );
  };

  // liste clubs ordonnée (parents puis leurs enfants indentés) pour le select
  const orderedClubsForFilter = (): Array<ClubOpt & { isChild: boolean }> => {
    const all = clubs();
    const parents = all.filter((c) => !c.parentClubId);
    const children = all.filter((c) => !!c.parentClubId);
    const result: Array<ClubOpt & { isChild: boolean }> = [];
    for (const p of parents) {
      result.push({ ...p, isChild: false });
      for (const ch of children.filter((c) => c.parentClubId === p.id)) {
        result.push({ ...ch, isChild: true });
      }
    }
    for (const ch of children) {
      if (!result.find((r) => r.id === ch.id)) result.push({ ...ch, isChild: true });
    }
    return result;
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
              <For each={orderedClubsForFilter()}>
                {(c) => (
                  <option value={c.id}>
                    {c.isChild
                      ? `↳ ${c.name}`
                      : c.department?.trim()
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
                {(dName: Derbyname, i) => (
                  <div class="p-2 odd:bg-[rgba(0,0,0,0.05)] flex gap-3 items-center">

                    <div class="bg-dn-500 text-dn-100 p-3 w-24 text-center flex items-center justify-center">
                      <Show
                        when={dName.derbyType === "referee"}
                        fallback={<span>{dName.numRoster}</span>}
                      >
                        <RefereeJerseyIcon uid={`${i()}`} />
                      </Show>
                    </div>
                    <div class="flex w-full justify-between items-center gap-1">
                      <div class="font-display text-dn-600 min-w-0 truncate text-left">
                        {dName.derbyname}
                      </div>
                      {dName.clubName && (
                        <div class="text-sm text-dn-500 italic text-right">
                          {dName.parentClubName ? (
                            <>
                              {dName.parentClubName} <span class="text-xs">›</span> {dName.clubName}
                            </>
                          ) : (
                            dName.clubName
                          )}
                        </div>
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
