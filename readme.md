# NumÉcoDiag
Ce projet est un fork du projet Numecodiag (sous licence EUPL v1.2).
Il a été modifié et amélioré par Onepoint.
La licence originale reste applicable.

Cette WebExtension développée et mise à disposition gratuitement par la [MiNumEco](https://ecoresponsable.numerique.gouv.fr/) facilite l’auto-diagnostic de l’écoconception d’un service numérique, conformément au [Référentiel Général d'Écoconception de Services Numériques](https://ecoresponsable.numerique.gouv.fr/publications/referentiel-general-ecoconception/) (RGESN).

Réalisation : [Pôle écoconception Temesis](https://www.temesis.com/).

## Code source

Cette extension est distribuée sous licence EUPL v1.2.

Le code source complet de cette extension est disponible sur GitHub :  
[https://github.com/onepoint-numerique-responsable/num-eco-diag](https://github.com/onepoint-numerique-responsable/num-eco-diag)

## Installation

- [Firefox](https://addons.mozilla.org/fr/firefox/addon/num%C3%A9codiag/)
- [Chrome](https://chrome.google.com/webstore/detail/num%C3%A9codiag/fhdeahmddgflanbgilcglipaeofmcabc)
- Edge (à venir, utiliser en attendant l'extension [Chrome](https://chrome.google.com/webstore/detail/num%C3%A9codiag/fhdeahmddgflanbgilcglipaeofmcabc))

## Installation manuelle

1. Installer [nodeJS](https://nodejs.org/fr/) (v16 minimum) et le gestionnaire de paquets NPM.
2. Dans un terminal, depuis le dossier téléchargé, lancer la commande `npm install` pour télécharger / installer les dépendances de développement du projet.
3. Dans le même terminal, lancer ensuite la commande `npm run build` pour construire l'application depuis les sources fournies.
4. Procédure d'installation spécifique
   - Sur Firefox : charger l'extension depuis l'adresse `about:debbuging` en sélectionnant le fichier `public/manifest.json`.
   - Sur Chrome :
     1. Charger l'extension depuis l'adresse `chrome://extensions/` en sélectionnant le dossier `public`.
     2. Activer le mode développeur et cliquer sur "Charger l'extension non empaquetée".
5. Pour utiliser l'extension, ouvrir les DevTools (F12) et naviguer vers l'onglet "NumEcoDiag".

## Licences

- Le RGESN est sous [licence ouverte Etalab v2](https://www.etalab.gouv.fr/licence-ouverte-open-licence).
- L'extension est sous [licence European Union Public License 1](https://joinup.ec.europa.eu/sites/default/files/inline-files/EUPL%20v1_2%20FR.txt)</a>.
