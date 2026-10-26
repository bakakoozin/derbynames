# Mise à jour de sécurité Node.js 22.23.4

## Contexte

La publication Node.js 22.23.4 du 21 octobre 2026 corrige plusieurs vulnérabilités,
dont des failles de sévérité élevée dans la résolution DNS, la validation TLS et le
décodeur Brotli. Le projet utilisait des tags majeurs flottants (`node:22-slim` et
`node-version: 22`) qui ne permettaient pas d'attester le patch exécuté.

## Périmètre

- Fixer l'image de construction et d'exécution à `node:22.23.4-slim`.
- Aligner les workflows GitHub Actions et la contrainte `engines` sur Node 22.23.4.
- Ne pas mettre à niveau les dépendances applicatives ni la version majeure de Node.

## Critères d'acceptation

1. Les deux étapes du Dockerfile utilisent `node:22.23.4-slim`.
2. Tous les workflows Node utilisent `22.23.4`.
3. `package.json` refuse les versions antérieures à 22.23.4 et les versions majeures
   ultérieures.
4. La vérification de type et la construction passent avec Node 22.23.4.

## Scénario Gherkin

```gherkin
Fonctionnalité: exécution sur une version Node corrigée
  Scénario: construire et vérifier l'application
    Étant donné une installation avec Node 22.23.4
    Quand la CI installe les dépendances avec le lockfile figé
    Alors l'image de construction utilise node:22.23.4-slim
    Et la vérification de type et la construction réussissent
```

## Risques et rollback

Le changement reste dans la même branche LTS majeure et ne requiert ni migration ni
changement de schéma. En cas de régression, restaurer le commit précédent puis
reconstruire l'image ; cela réintroduirait toutefois les correctifs de sécurité absents.
