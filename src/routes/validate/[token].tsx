import { useParams } from "@solidjs/router";
import { createSignal, onMount } from "solid-js";
import { Loader } from "~/ui/loader";

type ValidateSuccess = {
  ok: true;
  derbyname: string;
  email: string;
  emailConfirmed: boolean;
};

type ValidateError = {
  error: string;
};

type ValidateResponse = ValidateSuccess | ValidateError;

type RpcValidateResponse = {
  result?: ValidateResponse;
  error?: string;
};

export default function Validate() {
  const { token } = useParams();
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [data, setData] = createSignal<ValidateSuccess | null>(null);

  const getValidate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/rpc", {
        method: "POST",
        body: JSON.stringify({
          method: "derbyname.confirmAction",
          params: { token },
        }),
      });
      const rpc = (await response.json().catch(() => null)) as RpcValidateResponse | null;
      const json = (rpc?.result ?? (rpc && rpc.error ? { error: rpc.error } : null)) as ValidateResponse | null;

      if (!response.ok || !json || "error" in json) {
        const message =
          (json && "error" in json && json.error) ||
          (response.status === 404
            ? "Ce lien de validation est invalide."
            : response.status === 400
              ? "Ce lien de validation a expiré."
              : "Une erreur est survenue lors de la validation.");

        setError(message);
        return;
      }

      if (json.ok) {
        setData(json);
      }
    } catch (err) {
      console.error("Error while validating token", err);
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  };

  onMount(() => {
    void getValidate();
  });

  return (
    <div class="grid h-full grid-rows-[auto_1fr] items-center">
      <div class="w-full flex flex-wrap justify-center items-center gap-2 p-3">
        <h1 class="text-dn-600 m-0 text-center">
          Validation de <span class="font-bold">votre derby name</span>
        </h1>
      </div>

      <div class="h-full relative">
        <div class="absolute inset-0 flex items-start justify-center p-4">
          {loading() && (
            <div class="flex flex-col items-center gap-4">
              <Loader />
              <p class="text-dn-500">Validation en cours...</p>
            </div>
          )}

          {!loading() && error() && (
            <div class="bg-dn-500 text-dn-100 p-4 max-w-md text-center space-y-2">
              <p class="text-lg font-bold">Oups...</p>
              <p>{error()}</p>
              <p class="mt-3 text-sm opacity-80">
                Si le problème persiste, demandez un nouveau lien de validation en recréant votre derby name.
              </p>
            </div>
          )}

          {!loading() && !error() && data() && (
            <div class="bg-dn-500 text-dn-100 p-4 max-w-md text-center space-y-2">
              <p class="text-lg font-bold">Derby name validé !</p>
              <p>
                <span class="opacity-80">Derby name :</span>{" "}
                <span class="font-display font-bold">{data()!.derbyname}</span>
              </p>
              <p>
                <span class="opacity-80">Email :</span>{" "}
                <span class="font-mono">{data()!.email}</span>
              </p>
              <p class="mt-3 text-sm">
                Tu peux maintenant utiliser ce derby name, il est réservé pour toi.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}