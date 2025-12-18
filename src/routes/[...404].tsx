import { useParams } from "@solidjs/router";
import { createSignal, onMount } from "solid-js";

export default function NotFound() {


  return (
    <main class="text-center mx-auto text-gray-700 p-4">
      <div>
        N° Roster : <span class="font-bold">404</span>
      </div>
      <div>
        Nom du derby name : <span class="font-bold">Page non trouvée</span>
      </div>
    </main>
  );
}
