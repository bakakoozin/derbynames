# language: fr
Fonctionnalité: Harnais qualité de Derby Names
  En tant que mainteneur
  Je veux automatiser les contrôles fonctionnels et non fonctionnels
  Afin de détecter les régressions avant la mise en production

  Scénario: La page publique reste utilisable sans base réelle
    Étant donné que le serveur SolidStart est lancé pour les tests
    Et que les API publiques sont remplacées par des réponses déterministes
    Quand un navigateur ouvre la page d'accueil
    Alors le titre principal est visible
    Et aucune violation d'accessibilité sérieuse ou critique n'est détectée

  Scénario: Les métadonnées SEO essentielles sont présentes
    Étant donné que la page d'accueil est servie
    Quand le harnais inspecte le document
    Alors le document possède un titre non vide
    Et les robots autorisent l'indexation
    Et la page possède une description

  Scénario: L'application expose les prérequis d'installation PWA
    Étant donné que la page d'accueil est servie
    Quand le harnais inspecte les métadonnées PWA
    Alors un manifeste web est déclaré
    Et le manifeste permet un affichage standalone
    Et les icônes installables 192 et 512 pixels sont disponibles
    Et un service worker est servi

  Scénario: Les budgets Lighthouse sont respectés
    Étant donné que le build de production est disponible
    Quand Lighthouse audite la page d'accueil
    Alors le score performance est au moins de 75
    Et les scores accessibilité et SEO sont au moins de 90

  Scénario: La chaîne de livraison contrôle la sécurité
    Étant donné une pull request ou une analyse planifiée
    Quand les workflows de sécurité sont exécutés
    Alors le code JavaScript et TypeScript est analysé par CodeQL
    Et les dépendances hautes ou critiques sont signalées
    Et les secrets accidentellement versionnés sont recherchés
