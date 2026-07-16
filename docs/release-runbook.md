# Runbook release prod

## Objectif
Passer en prod sans interruption en separant la phase code et la phase base de donnees.

## Etape 1 - Preflight code
Lancer:

pnpm release:code-preflight

Ce script valide:
- build
- tests unitaires
- verification migration users/actions
- checks de coherence des actions pending

## Etape 2 - Validation UI pre-prod
Avant prod, verifier au minimum:
- soumission nouveau derbyname (joueur, arbitre, coach)
- changement de club sur derbyname existant
- confirmation du mail via lien de validation
- page historique (demande de lien puis consultation)
- liste clubs et filtres type

## Etape 3 - Cutover DB
Optionnel: configurer un backup auto:
- DB_BACKUP_COMMAND="votre commande de dump"

Puis lancer:

RELEASE_DB_CUTOVER=1 pnpm release:db-cutover

Ce script:
- relance le preflight code
- execute le backup si configure
- execute db:verify-actions
- applique db:push
- relance db:verify-actions

## Strategie de deploiement
1. Deployer le code applicatif.
2. Executer la validation UI pre-prod.
3. Executer le cutover DB.
4. Verifier les logs API de validation email pendant 30 minutes.

## Rollback
- Rollback code possible si le cutover DB n'est pas applique.
- Apres cutover DB, rollback code vers une version ancienne non compatible est interdit.
