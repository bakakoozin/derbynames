# Correction glob — alerte Dependabot #141

## Problème et solution

Le contournement de l'annulation AbortSignal permet à glob de poursuivre une
traversée du système de fichiers après expiration du délai.
Remplacer glob 13.x, utilisé par Nitro/@vercel/nft et Lighthouse/Sentry,
par une version >=14.0.2 et <15 via un override ciblé.
Conserver glob 7 pour rimraf 3, qui utilise son ancienne API à callbacks.

## Critères d'acceptation

- Aucune résolution glob 13.x ne subsiste et l'audit ne signale plus l'avis ciblé.
- L'installation figée pnpm 11 valide ses politiques de sécurité.
- Le typecheck, les tests unitaires, le build Nitro et Lighthouse réussissent.

```gherkin
Fonctionnalité: traversée de fichiers avec annulation corrigée
  Scénario: installer les outils utilisant glob moderne
    Étant donné le lockfile avec glob corrigé
    Quand le projet est installé avec pnpm 11 et le lockfile figé
    Alors les outils Nitro et Sentry utilisent glob 14.0.2 ou supérieur
    Et le build et les contrôles Lighthouse réussissent
```

## Risques et rollback

Changement majeur de glob pour les consommateurs de l'API moderne, vérifié par
le build et Lighthouse. Un rollback de l'override et du lockfile réintroduit
la version affectée. Aucun changement de données ni d'interface utilisateur.
