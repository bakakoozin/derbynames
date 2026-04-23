import { createEffect, createSignal } from "solid-js";
import { useLocation } from "@solidjs/router";
import { Loader } from "~/ui/loader";

type Row = {
  oldDerbyname: string;
  newDerbyname: string;
  numRoster: string | null;
  clubId: string | null;
  createdAt: string | null;
};

export default function HistoriquePage() {
  const location = useLocation();

  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [rows, setRows] = createSignal<Row[]>([]);
  const [emailSent, setEmailSent] = createSignal(false);

  const token = () => new URLSearchParams(location.search).get("token") ?? "";

  createEffect(() => {
    const t = token();
    if (!t) {
      setRows([]);
      setError(null);
      setLoading(false);
      return;
    }

    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/rename-history?token=${encodeURIComponent(t)}`);
        const data = await res.json().catch(() => null);
        const errPayload =
          data &&
          typeof data === "object" &&
          typeof (data as { error?: unknown }).error === "string"
            ? (data as { error: string }).error
            : null;

        if (!res.ok || errPayload || !Array.isArray((data as { items?: unknown })?.items)) {
          setError(errPayload || "Lien invalide ou expiré.");
          return;
        }

        setRows(((data as { items: Row[] }).items ?? []) as Row[]);
      } catch {
        setError("Impossible de charger l’historique.");
      } finally {
        setLoading(false);
      }
    })();
  });

  async function requestLink(form: Event) {
    form.preventDefault();
    const fd = new FormData(form.target as HTMLFormElement);
    const email = String(fd.get("email") || "").trim();
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/rename-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || "Demande impossible.");
        return;
      }
      setEmailSent(true);
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div class="grid h-full grid-rows-[auto_1fr] items-center p-3">
      <h1 class="text-dn-600 m-0 text-xl font-bold">
        Historique des derby names
      </h1>

      <div class="mt-4 max-w-lg mx-auto w-full flex flex-col gap-4">
        {!token() && (
          <form class="flex flex-col gap-2" onSubmit={requestLink}>
            <p class="text-sm text-dn-600">
              Entrez l’email utilisé pour vos derby names confirmés : nous vous enverrons un lien
              pour consulter l’historique des changements de nom.
            </p>
            <input class="input" type="email" name="email" required placeholder="vous@exemple.fr" />
            <button type="submit" class="btn" disabled={loading()}>
              Recevoir le lien
            </button>
            {emailSent() && (
              <p class="text-sm text-valid">Si un compte existe, un email a été envoyé.</p>
            )}
          </form>
        )}

        {token() && loading() && (
          <div class="flex justify-center py-8">
            <Loader />
          </div>
        )}

        {error() && (
          <div class="bg-dn-500 text-dn-100 p-3 rounded">{error()}</div>
        )}

        {token() && !loading() && !error() && (
          <div class="flex flex-col gap-2">
            {rows().length === 0 ? (
              <p class="text-dn-600">Aucun changement de derby name enregistré pour cet email.</p>
            ) : (
              <ul class="flex flex-col gap-2">
                {rows().map((r) => (
                  <li class="p-3 odd:bg-black/5 rounded border border-dn-500/20">
                    <div class="font-display text-dn-700">
                      {r.oldDerbyname} → {r.newDerbyname}
                    </div>
                    <div class="text-xs text-dn-500 mt-1">
                      #{r.numRoster ?? "—"}
                      {r.createdAt ? ` · ${new Date(r.createdAt).toLocaleString()}` : ""}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
