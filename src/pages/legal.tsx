
const sections = [
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
          href: 'https://linktr.ee/bakadev',
          label:  "Lien vers le formulaire de contact",
        }
      },
    ],
  },
   {
    title: "Hébergement",
    content: [
      {
        title: "Cloudflare",
        content: "",
        link:{
          href: 'https://www.cloudflare.com/fr-fr/',
          label:  "Lien vers le site de Cloudflare",
        }
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
          href: 'https://www.ovh.com/fr/',
          label:  "Lien vers le site d'OVH",
        }
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
        content: "Collectée uniquement pour vérifier qu'il s'agit bien d'un humain et pour permettre la modification du derbyname",
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
          href: 'https://ko-fi.com/bakadev',
          label:  "Lien vers le Link.tree de Cyril Pebre",
        }
      },
    ],
   },
   {
    title: "Responsabilité",
    content: [
      {
        title: "Dommages",
        content: "L’éditeur ne peut être tenu responsable des dommages directs ou indirects résultant de l’utilisation du site",
      },
      {
        title: "Informations",
        content: "L’éditeur s’efforce de fournir des informations précises et à jour, mais ne peut garantir l’exactitude, la complétude ou l’actualité des informations présentes sur le site",
      },
    ],
   },
   {
    title: "Contact",
    content: [
      {
        title: "Question",
        content: "Pour toute question ou demande d'information, vous pouvez contacter Cyril Pebre via le formulaire de contact",
      },
    ],
   },
]
export function Legal() {
  return (
    <div className="flex flex-col items-center p-4">
      <div className="max-w-[600px]">
      <h2>Mentions légales</h2>
      <div className="flex flex-col gap-3">
        {sections.map((section) => (
          <div key={section.title} className="border p-4">
            <h3>{section.title}</h3>
            <div className="flex flex-col gap-2">
              {section.content.map((content) => (
                <div key={content.title}>
                  <h4>{content.title}</h4>
                  <p>{content.content}</p>
                  {content.link && <p><a href={content.link.href} className="text-500 underline">{content.link.label}</a></p>}
                </div>
              ))}
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
