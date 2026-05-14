export default function BadgeInfo() {
  return (
    <div class="p-4 max-w-lg mx-auto flex flex-col gap-3">
      <h1 class="text-dn-600 font-bold text-xl">Badge derby (premium)</h1>
      <p class="text-sm text-dn-600">
        Les badges graphiques sont activés lorsque{" "}
        <code class="bg-black/10 px-1 rounded">FEATURE_PREMIUM_BADGES</code> est défini pour l’API.
      </p>
      <p class="text-sm text-dn-600">
        URL technique (SVG) :{" "}
        <code class="break-all bg-black/10 px-1 rounded">
          /api/badge/&lt;votre-derbyname-en-minuscules&gt;
        </code>
      </p>
      <p class="text-xs italic text-dn-500">
        Accès réservé aux joueurs avec abonnement premium club lié à leur email (voir équipe).
      </p>
    </div>
  );
}
