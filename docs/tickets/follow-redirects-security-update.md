# Correction follow-redirects — alerte Dependabot #140

## Problème et solution

Les tableaux sensitiveHeaders provenant d'un autre contexte JavaScript peuvent
être ignorés et laisser des identifiants personnalisés suivre les redirections.
Relever l'override follow-redirects à `>=1.16.2 <2` et actualiser le lockfile.

## Critères d'acceptation

- Toutes les résolutions follow-redirects utilisent une version >=1.16.2 et <2.
- L'installation figée, le typecheck, les tests unitaires et le build passent.
- L'audit ne signale plus GHSA-mrwp-f3q8-3g9p.

```gherkin
Fonctionnalité: dépendances HTTP corrigées
  Scénario: installer la correction de protection des identifiants
    Étant donné le lockfile du projet
    Quand les dépendances sont installées avec le lockfile figé
    Alors toutes les résolutions follow-redirects incluent le correctif 1.16.2
    Et la construction et les tests de l'application réussissent
```

## Risques et rollback

Mise à jour corrective dans la branche 1.x, sans migration de données.
Restaurer les fichiers pnpm précédents réintroduirait la vulnérabilité.
