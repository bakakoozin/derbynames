# Suppression extract-zip — alertes Dependabot #100 et #104

## Problème et solution

extract-zip 2.0.1, introduit par Lighthouse CI 0.15.1, présente deux failles
liées aux liens symboliques (CVE-2026-56876 et CVE-2026-19693), sans patch publié.
Mettre Lighthouse CI à 0.16.0 pour utiliser sa nouvelle chaîne Puppeteer et
supprimer extract-zip du graphe de dépendances.

## Critères d'acceptation

- extract-zip est absent du lockfile et de l'audit.
- L'installation figée et la construction réussissent.
- Lighthouse CI 0.16.0 peut collecter les rapports et vérifier les budgets existants.

```gherkin
Fonctionnalité: audit de qualité sans extract-zip vulnérable
  Scénario: installer et exécuter Lighthouse CI
    Étant donné Lighthouse CI 0.16.0 et le lockfile actualisé
    Quand les dépendances sont installées avec le lockfile figé
    Alors extract-zip ne fait plus partie des dépendances
    Et Lighthouse peut collecter les rapports et vérifier les budgets configurés
```

## Risques et rollback

Lighthouse passe à la version majeure 13 : ses mesures peuvent différer.
Le rollback de package.json et du lockfile réintroduirait extract-zip vulnérable.

## Validation locale

Installation figée, typecheck et 105 tests unitaires réussis. Lighthouse CI a
collecté trois rapports et validé les budgets configurés. L'audit ne contient
plus extract-zip. Vérifications réalisées avec Node 25.2.1 localement.
pnpm signale un peer proxy-agent >=8.0.1 attendu par @puppeteer/browsers alors
que Lighthouse CI fournit 6.5.0 ; l'exécution locale de Lighthouse réussit malgré
cet avertissement. L'utilisation d'un proxy n'a pas été testée.
