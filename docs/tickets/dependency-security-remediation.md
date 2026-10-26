# Correctifs disponibles des dépendances transitives

## Contexte

L'audit des dépendances signale des vulnérabilités transitives avec correctif
publié dans les chaînes Lighthouse et Vinxi. Les vulnérabilités sans version
corrective (`extract-zip` et `node-forge`) ne font pas partie de ce ticket.

## Périmètre

- Appliquer les versions corrigées de `basic-ftp`, `body-parser`, `zod`, `qs`
  et `serialize-javascript` au moyen des overrides pnpm.
- Régénérer le lockfile sans mettre à niveau les dépendances directes.
- Vérifier que l'audit ne remonte plus les avis corrigibles ciblés.

## Critères d'acceptation

1. Le lockfile résout les cinq paquets vers une version au moins égale à la
   version corrective publiée.
2. `pnpm audit` ne remonte plus `basic-ftp`, `body-parser`, `zod`, `qs` ni
   `serialize-javascript` parmi les vulnérabilités.
3. Le typecheck, la construction et les tests unitaires passent.
4. Les alertes `extract-zip` et `node-forge` sans correctif sont documentées
   comme dette de sécurité restante.

## Scénario Gherkin

```gherkin
Fonctionnalité: dépendances transitives corrigées
  Scénario: vérifier les dépendances après installation figée
    Étant donné le lockfile mis à jour
    Quand la CI installe les dépendances et lance l'audit
    Alors les versions corrigées de basic-ftp, body-parser, zod, qs et serialize-javascript sont résolues
    Et seules les alertes sans correctif publié restent à traiter
```

## Risques et rollback

`basic-ftp` change de version majeure mais n'est utilisé que par le tooling
Lighthouse. Les validations CI couvrent son installation et l'exécution du
build. Le rollback consiste à restaurer les deux fichiers pnpm de ce ticket ;
il réintroduit les vulnérabilités corrigibles.
