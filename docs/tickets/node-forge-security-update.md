# Correction node-forge — alerte Dependabot #120

## Problème et solution

Le lockfile résout node-forge 1.4.0 via Vinxi et Solid Start. Cette version est
affectée par CVE-2026-85393 (vérification RSA PKCS#1 v1.5).
Relever l'override à `>=1.4.3 <2` et régénérer le lockfile pour inclure le correctif
publié en 1.4.1 et les corrections supplémentaires de 1.4.3.

Source : https://github.com/digitalbazaar/forge/blob/v1.4.3/CHANGELOG.md

## Critères d'acceptation

- Toutes les résolutions node-forge utilisent une version >=1.4.3 et <2.
- L'installation figée, le typecheck, les tests unitaires et le build passent.
- L'audit ne signale plus CVE-2026-85393 sur le lockfile.

```gherkin
Fonctionnalité: vérification cryptographique corrigée
  Scénario: installer les dépendances corrigées
    Étant donné le lockfile du projet
    Quand les dépendances sont installées avec le lockfile figé
    Alors chaque dépendance transitive node-forge utilise une version corrigée
    Et l'application peut être construite et ses tests réussissent
```

## Risques et rollback

Mise à jour dans la branche 1.x, sans migration de données ni changement d'interface.
Le rollback des fichiers pnpm réintroduirait la version vulnérable.
