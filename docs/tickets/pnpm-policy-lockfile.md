# Réparer l'installation CapRover avec les politiques pnpm 11

Le lockfile généré par pnpm 10 incluait sept versions publiées depuis moins
de 24 heures, refusées par minimumReleaseAge avec pnpm 11.18.0 dans Docker.
Régénérer la résolution avec pnpm 11.18.0, sans désactiver cette protection,
et aligner packageManager et les workflows CI sur cette version.

## Critères d'acceptation

- L'installation figée avec pnpm 11.18.0 valide les politiques supply-chain.
- extract-zip reste absent et les correctifs de sécurité précédents sont conservés.
- Le typecheck, les tests et le build réussissent après réinstallation.

```gherkin
Fonctionnalité: installation reproductible sur CapRover
  Scénario: installer les dépendances avec les politiques de production
    Étant donné le lockfile généré avec pnpm 11.18.0
    Quand le build installe les dépendances avec le lockfile figé
    Alors la vérification des politiques réussit
    Et l'application peut être construite
```

La régénération peut actualiser les versions autorisées par les plages existantes.
Le rollback réintroduirait un lockfile rejeté par les politiques de déploiement.

La résolution fraîche nécessite de borner l'override h3 à <2 pour conserver
l'API attendue par Vinxi. Les correctifs node-forge 1.4.3 et follow-redirects
1.16.2 sont conservés et extract-zip reste absent. Installation pnpm 11 avec
politiques actives, typecheck, 105 tests unitaires et build validés localement
avec Node 25.2.1 ; le runtime Docker reste Node 22.23.4.
