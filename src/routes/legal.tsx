import { For } from "solid-js";

type SectionItem = {
  title: string;
  content: string;
  link?: {
    href: string;
    label: string;
  };
};

type Section = {
  title: string;
  content: SectionItem[];
};

const sections: Section[] = [
  {
    title: "Éditeur du site",
    content: [
      {
        title: "Nom",
        content: "Cyril Pebre",
      },
      {
        title: "Contact",
        content: "Formulaire de contact et email disponible ci-dessous",
        link: {
          href: "https://linktr.ee/bakadev",
          label: "Lien vers le formulaire de contact",
        },
      },
    ],
  },
  {
    title: "Hébergement",
    content: [
      {
        title: "Cloudflare",
        content: "",
        link: {
          href: "https://www.cloudflare.com/fr-fr/",
          label: "Lien vers le site de Cloudflare",
        },
      },
    ],
  },
  {
    title: "Nom de Domaine",
    content: [
      {
        title: "OVHCloud",
        content: "",
        link: {
          href: "https://www.ovh.com/fr/",
          label: "Lien vers le site d'OVH",
        },
      },
    ],
  },
  {
    title: "Propriété Intellectuelle",
    content: [
      {
        title: "Licence",
        content: "Libre et open source",
      },
    ],
  },
  {
    title: "Données Personnelles",
    content: [
      {
        title: "Cookies",
        content: "Aucun",
      },
      {
        title: "Adresse E-mail",
        content:
          "Collectée uniquement pour vérifier qu'il s'agit bien d'un humain et pour permettre la modification du derbyname",
      },
    ],
  },
  {
    title: "Activité du Site",
    content: [
      {
        title: "Activité",
        content: "Non professionnelle",
      },
      {
        title: "Vente",
        content: "Aucune",
      },
      {
        title: "Soutien",
        content: "",
        link: {
          href: "https://linktr.ee/bakadev",
          label: "Lien vers le Link.tree de Cyril Pebre",
        },
      },
    ],
  },
  {
    title: "Responsabilité",
    content: [
      {
        title: "Dommages",
        content:
          "L’éditeur ne peut être tenu responsable des dommages directs ou indirects résultant de l’utilisation du site",
      },
      {
        title: "Informations",
        content:
          "L’éditeur s’efforce de fournir des informations précises et à jour, mais ne peut garantir l’exactitude, la complétude ou l’actualité des informations présentes sur le site",
      },
    ],
  },
  {
    title: "Contact",
    content: [
      {
        title: "Question",
        content:
          "Pour toute question ou demande d'information, vous pouvez contacter Cyril Pebre via le formulaire de contact",
      },
    ],
  },
];

export default function Legal() {
  return (
    <div class="grid h-full grid-rows-[auto_1fr] items-center">
      <div class="w-full flex flex-wrap justify-between items-center gap-2 p-3">
        <h1 class="text-dn-600 h-full flex items-center gap-1 m-0">
          <span class="font-bold">Mentions légales</span>
        </h1>
      </div>

      <div class="h-full relative">
        <div class="absolute inset-0 overflow-y-auto p-4 flex justify-center">
          <div class="w-full max-w-180 flex flex-col gap-3">
            <For each={sections}>
              {(section) => (
                <section class="border border-dn-500/40 bg-white/60 p-4 shadow-sm">
                  <h2 class="text-lg font-bold text-dn-600 mb-2">
                    {section.title}
                  </h2>
                  <div class="flex flex-col gap-2 text-sm text-dn-600">
                    <For each={section.content}>
                      {(item) => (
                        <div>
                          <h3 class="font-semibold">{item.title}</h3>
                          {item.content && (
                            <p class="m-0">{item.content}</p>
                          )}
                          {item.link && (
                            <p class="m-0">
                              <a
                                href={item.link.href}
                                target="_blank"
                                rel="noreferrer"
                                class="text-dn-500 underline"
                              >
                                {item.link.label}
                              </a>
                            </p>
                          )}
                        </div>
                      )}
                    </For>
                  </div>
                </section>
              )}
            </For>
          </div>
        </div>
      </div>
    </div>
  );
}


