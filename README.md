# MiniStages EREA — version de démarrage

Application web responsive en français pour organiser des mini-stages : formations, créneaux, inscriptions, statuts, profils et export CSV compatible avec Excel.

## Important : gratuit et accessible sur Internet

Il est impossible d'avoir une application accessible depuis Internet à plusieurs collèges et familles **sans aucun hébergement ni service en ligne**. Cette version peut être publiée sans abonnement payant avec :

- **GitHub Pages** pour les fichiers de l'application (site statique) ;
- **Supabase** pour l'authentification et la base de données, avec son offre gratuite (sous réserve des limites et conditions en vigueur).

Ces services hébergent bien des composants, mais il n'est pas nécessaire de louer un serveur ni de payer un abonnement pour démarrer. Les offres gratuites peuvent évoluer et ne garantissent pas une disponibilité professionnelle.

## 1. Tester tout de suite

1. Décompressez le ZIP.
2. Ouvrez `index.html` dans Chrome ou Edge.
3. Cliquez sur **Découvrir la démonstration**.

Le mode démo utilise des données fictives conservées dans le navigateur courant. Il ne synchronise pas les données avec les autres ordinateurs et ne doit jamais contenir de données réelles d'élèves.

## 2. Mettre en place la base en ligne gratuite

1. Créez un compte sur Supabase et un nouveau projet.
2. Dans le projet, ouvrez **SQL Editor**.
3. Ouvrez le fichier `supabase/schema.sql`, copiez tout son contenu dans une nouvelle requête SQL et exécutez-le.
4. Dans **Project Settings / API** (ou la page équivalente de votre interface), copiez l'URL du projet et la clé publique `anon` / publishable. **N'utilisez jamais la clé `service_role` dans l'application.**
5. Ouvrez `config.js` et renseignez :

```js
window.MINISTAGES_CONFIG = {
  SUPABASE_URL: 'https://VOTRE-PROJET.supabase.co',
  SUPABASE_ANON_KEY: 'VOTRE_CLE_PUBLIQUE_ANON'
};
```

6. Dans Supabase **Authentication**, créez les comptes utilisateurs autorisés (désactivez l'inscription publique si elle n'est pas nécessaire).
7. Pour créer le profil du premier administrateur, récupérez l'UUID de son compte dans **Authentication / Users**, puis exécutez dans SQL Editor (remplacez les valeurs) :

```sql
insert into public.profiles (id, full_name, email, role, organization, active)
values (
  'UUID-DU-COMPTE-AUTH',
  'Administrateur EREA',
  'adresse.admin@exemple.fr',
  'admin',
  'EREA de Muret',
  true
);
```

8. Ajoutez ensuite un profil pour chaque compte autorisé avec son UUID et son rôle (`admin`, `teacher`, `college` ou `family`). Les rôles `admin` et `teacher` peuvent gérer le catalogue, les créneaux et les inscriptions ; les rôles `college` et `family` peuvent créer une demande.
9. Ajoutez des formations et des créneaux depuis l'application après connexion.

## 3. Publier gratuitement sur Internet avec GitHub Pages

1. Créez un dépôt GitHub privé ou public selon les règles de votre établissement et de votre académie. Attention : les fichiers d'un site GitHub Pages sont publics si le dépôt / l'offre ne permet pas de garder la publication privée. Le fichier `config.js` contient uniquement l'URL et la clé publique Supabase, jamais un secret.
2. Importez `index.html`, `styles.css`, `app.js`, `config.js` et le dossier `supabase`.
3. Dans les paramètres du dépôt, ouvrez **Pages** et choisissez la branche et le dossier à publier.
4. Utilisez l'URL fournie par GitHub Pages pour accéder au portail depuis les collèges et les familles.
5. Dans Supabase Authentication, configurez les URL autorisées / Site URL avec l'URL exacte du site publié.

Le portail n'est pas prêt à être utilisé avec de vrais élèves tant que l'établissement n'a pas validé les accès, les politiques de sécurité, la conformité RGPD et la conservation des données avec son DPD / DPO.

## Annuaire des établissements à la création de compte

Le formulaire de création de compte interroge l’annuaire officiel de l’Éducation nationale (`fr-en-annuaire-education`, portail data.education.gouv.fr) pour proposer les établissements ouverts de l’académie de Toulouse. La recherche porte sur le nom, la commune et le code UAI. Après sélection, le nom officiel est renseigné et l’adresse e-mail n’est préremplie que si elle est fournie par le référentiel ; elle reste modifiable. Si l’annuaire est temporairement indisponible, la saisie manuelle du nom est exceptionnellement autorisée et aucune adresse e-mail n’est générée.

## Fonctionnalités présentes dans cette version

- Interface responsive pour ordinateur, tablette et téléphone.
- Tableau de bord et compteurs d'activité.
- Catalogue de formations avec code, description et statut.
- Création et modification de créneaux avec horaires, capacité, lieu et fermeture/ouverture.
- Création d'inscriptions et gestion des statuts (à traiter, confirmée, refusée, annulée, réalisée).
- Recherche et filtrage des inscriptions.
- Export des inscriptions en CSV lisible dans Excel.
- Authentification Supabase et profils avec rôles.
- Mode démonstration autonome avec données fictives.
- Schéma SQL avec règles RLS de départ.

## Limites à connaître avant de l'utiliser en production

Cette livraison est une **première version fonctionnelle de base**, pas un clone complet de mini-stage.fr. Elle ne comprend pas encore :

- l'envoi de courriels automatiques de confirmation / refus ;
- la génération de conventions PDF personnalisées ;
- une gestion complète des comptes depuis l'interface (les comptes Auth doivent être créés dans Supabase) ;
- un formulaire public sans compte pour les familles ;
- un système de validation par étapes, des listes d'attente ou une gestion avancée des quotas par collège ;
- des tests de sécurité indépendants ni une validation institutionnelle.

Le schéma de base bloque les accès anonymes aux données des élèves. Ne supprimez pas ces protections pour faciliter les inscriptions : une ouverture publique pourrait exposer les données personnelles de mineurs.

## Fichiers

- `index.html` : structure de l'application
- `styles.css` : interface et adaptation mobile
- `app.js` : logique de l'application
- `config.js` : configuration publique Supabase
- `supabase/schema.sql` : tables, index et règles de sécurité


### Annuaire officiel des collèges et lycées de Haute-Garonne

Dans le formulaire d’inscription, la liste des établissements est chargée depuis l’API publique de l’Annuaire de l’Éducation nationale. Le choix d’un établissement préremplit son nom, sa ville, son adresse, son téléphone et son courriel. Les champs restent modifiables. Une connexion Internet est nécessaire pour charger cette liste ; en cas d’indisponibilité de l’annuaire, les informations peuvent être saisies manuellement.

Source : https://data.education.gouv.fr/explore/dataset/fr-en-annuaire-education/

## Dernières corrections du formulaire
- Adresse de l’établissement sur toute la largeur et téléphone sur une largeur réduite.
- Classe de l’élève dans une liste déroulante : 3ème générale, 3ème SEGPA, 3ème Prépa métiers, 3ème Ulis, Autre.
- Un seul responsable légal, avec nom, prénom, téléphone et e-mail.
- Le champ de prise en charge du repas apparaît uniquement si « Repas à l’EREA » vaut « Oui ».
- Les créneaux proposés sont filtrés en fonction de la formation sélectionnée.
- Le statut n’est modifiable que par l’administrateur ; une protection est également ajoutée dans le schéma SQL.
- Après l’enregistrement, le logiciel prépare un courriel prérempli avec le nom et prénom de l’élève, la formation, la date et les horaires. Il ouvre le logiciel de messagerie de l’utilisateur : l’envoi automatique sans action humaine nécessite une fonction serveur d’envoi de courriels (non configurée dans cette version).

**Mise à jour d’une base Supabase existante :** réexécutez les instructions d’extension et le déclencheur ajoutés à la fin de `supabase/schema.sql` dans l’éditeur SQL de Supabase avant d’utiliser le formulaire en ligne.


## Créneaux et affectation des professeurs
- La capacité d’un créneau est de 1 élève par défaut et peut être réglée à 2 au maximum.
- Chaque créneau peut être affecté à un professeur via une liste déroulante.
- Les professeurs sont les profils actifs ayant le rôle « Équipe pédagogique ». En mode démonstration, deux profils fictifs sont fournis. En ligne, l’administrateur doit créer les comptes/profils des professeurs dans Supabase et leur attribuer le rôle `teacher`.
- Le calendrier affiche le professeur attribué et les noms des élèves dont l’inscription est confirmée.
- Pour une base Supabase existante, exécutez les nouvelles commandes de migration à la fin de `supabase/schema.sql`.


## Suivi du stage et compte rendu professeur
- Une colonne **Stage** apparaît entre le statut de l’inscription et les actions.
- Pour une inscription confirmée, l’équipe pédagogique peut sélectionner « Stage effectué » ou « Élève absent ».
- Lorsque « Stage effectué » est choisi, un formulaire de compte rendu est accessible. Il reprend les rubriques du modèle EREA : savoir-être, aptitudes professionnelles, tâches confiées, observations et avis favorable/réservé.
- Chaque critère s’évalue en TS, S, M, I ou TI. Le compte rendu est enregistré dans la fiche d’inscription.
- Le bouton « Exporter en PDF / Imprimer » ouvre la boîte d’impression du navigateur : choisissez **Enregistrer au format PDF** pour obtenir le PDF.
- Pour une base Supabase déjà existante, exécutez également les deux instructions de migration ajoutées à la fin de `supabase/schema.sql`.

## Compte rendu PDF, archivage et envoi au collège
- Le formulaire de compte rendu se termine par les boutons **Fermer** et **Enregistrer**.
- **Enregistrer** horodate le compte rendu, génère un véritable PDF et conserve le contenu PDF encodé dans le compte rendu de l'inscription. Le PDF apparaît ensuite dans **Actions** via le bouton `PDF`.
- L'icône d'enveloppe dans **Actions** est verte si l'envoi a réussi et rouge si l'envoi a échoué. Un clic sur cette icône permet de retenter l'envoi.
- Le PDF est créé avec jsPDF chargé depuis un CDN : une connexion Internet est nécessaire pour cette fonctionnalité.

### Configuration obligatoire de l'envoi d'e-mail en ligne
L'envoi automatique ne fonctionne pas en mode démonstration. Il faut déployer la fonction Supabase Edge Function fournie dans `supabase/functions/send-stage-report/index.ts` et utiliser un compte Resend avec une adresse d'expéditeur vérifiée.

1. Installez/ouvrez la CLI Supabase et connectez-vous au projet.
2. Déployez la fonction : `supabase functions deploy send-stage-report`.
3. Ajoutez les secrets (ne jamais les placer dans `app.js` ou `config.js`) :
   - `supabase secrets set RESEND_API_KEY=re_votre_cle`
   - `supabase secrets set STAGE_REPORT_FROM='MiniStages EREA <adresse-verifiee@votre-domaine.fr>'`
4. Vérifiez le domaine ou l'adresse d'expéditeur dans Resend et testez l'envoi vers une adresse du collège.
5. Pour les appels depuis l'application authentifiée, configurez la fonction pour exiger un JWT valide selon la configuration de votre projet Supabase.

Le document PDF est stocké dans le champ JSON `applications.stage_report` de Supabase (et localement dans le navigateur en mode démo), pas dans un bucket séparé. Cette solution convient à un prototype mais augmente la taille des enregistrements ; pour une mise en production avec beaucoup de dossiers, préférez Supabase Storage privé et des règles d'accès dédiées. L'établissement doit valider le traitement des données de mineurs et la conformité RGPD avec son DPD avant toute utilisation réelle.

## Création de compte établissement et réinitialisation du mot de passe

La page de connexion propose maintenant **Créer un compte établissement**. L’établissement d’origine (collège ou lycée) renseigne le nom de son établissement, son adresse e-mail officielle et un mot de passe respectant les règles suivantes : au moins 10 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial. Le compte est créé avec le rôle technique `college` (affiché dans l’application comme « Collège / Lycée »). Selon les réglages Supabase Auth, l’utilisateur doit confirmer son adresse e-mail avant de se connecter.

Pour activer cette fonctionnalité dans le projet en ligne :

1. Exécutez la section ajoutée à la fin de `supabase/schema.sql` dans **Supabase → SQL Editor**. Elle crée automatiquement un profil de rôle technique `college` (affiché comme « Collège / Lycée ») à la création d’un compte Auth.
2. Dans **Supabase → Authentication → URL Configuration**, ajoutez l’URL du site publié à la liste des URL de redirection autorisées. La même URL sert au lien de confirmation et au lien de réinitialisation.
3. Configurez les paramètres de confirmation e-mail et le fournisseur d’e-mail de Supabase pour votre usage réel.
4. Testez la création d’un compte avec une adresse de collège dédiée avant la mise en service.

Dans **Administration → Utilisateurs**, l’administrateur peut voir les adresses e-mail qui servent d’identifiants et cliquer sur **Réinitialiser le mot de passe**. Un lien sécurisé est envoyé à cette adresse ; l’utilisateur choisit alors lui-même son nouveau mot de passe. Le formulaire de retour permet de saisir et confirmer ce nouveau mot de passe.

**Sécurité importante :** un mot de passe existant ne peut pas être affiché en clair, ni par l’administrateur. Supabase ne conserve pas de mot de passe lisible. Aucun mot de passe n’est stocké dans la table `profiles`. La réinitialisation par lien est la méthode sécurisée prévue à cet effet. En mode démonstration, la création de compte et l’envoi des liens ne sont pas réels.


## Mise à jour du libellé du rôle établissement

Le rôle établissement est désormais affiché partout dans l’interface de gestion des utilisateurs sous le libellé **« Collège / Lycée »**. Pour préserver les comptes existants, les autorisations et les règles Supabase, sa valeur technique reste `college`. Aucun changement de base de données ni migration n’est nécessaire : les comptes existants gardent leurs accès et les nouveaux comptes utilisent la même valeur technique.


## Mise à jour : convention PDF et tableau de bord établissement (octobre 2026)

- Bouton Convention PDF : génération locale d’un PDF A4 portrait **de deux pages**, recto-verso (impression recto-verso à sélectionner dans le lecteur PDF).
- Page 1 : cinq encadrés et emplacements de signatures. Page 2 : six articles du modèle fourni « Convention mini stage VIERGEpdf.pdf ».
- Le logo peut être configuré via `CONVENTION_LOGO_DATA_URL` dans `window.MINISTAGES_CONFIG` (image PNG encodée en data URL). Aucun logo officiel n’a été fourni dans les ressources : l’application ne le fabrique pas.
- Les signatures ne sont **pas** générées à partir d’une simple validation de réservation. Un circuit de signature authentifié et autorisé doit être développé et validé avant toute signature automatique.
- Les comptes Collège / Lycée et Famille disposent d’un tableau « Mes réservations » avec statut, convention et compte rendu si disponible. L’interface n’affiche pas de signatures prétendument réalisées.
- Exécuter `supabase/migration_secure_reservations.sql` pour corriger la politique d’insertion des demandes. Les dossiers anciens dont `created_by` est vide nécessitent une attribution administrative contrôlée pour être visibles par leur auteur.
- **Limite** : les étapes de signature numérique, de finalisation des conventions et d’archivage du PDF signé ne sont pas encore mises en œuvre. Le suivi de convention affiche donc un état provisoire « à signer ».
- La génération PDF utilise la bibliothèque jsPDF chargée depuis un CDN : une connexion réseau est nécessaire.
- Tester le rendu de PDF avec des données longues avant diffusion, et valider le texte juridique avec l’établissement.

## Suivi des réservations et signatures (migration octobre 2026)
Exécuter `supabase/migration_convention_tracking.sql` dans SQL Editor avant utilisation du suivi.
Le tableau des établissements présente la réservation, la validation administrative, le suivi de réalisation, les signatures indépendantes et le compte rendu PDF. Un bouton « Détails » ouvre la fiche.
La confirmation du stage **ne crée aucune signature**. Les anciennes réservations restent à la version 1 et sans signature enregistrée. Le suivi des signatures est en lecture seule : l’enregistrement sécurisé et vérifiable des signatures sera livré séparément.
Les règles RLS ne permettent de lire les signatures que si la réservation est visible par son créateur ou par le personnel autorisé. Les comptes non gestionnaires ne voient que leurs propres réservations.

## Signature manuscrite du responsable légal

Exécuter `supabase/migration_convention_tracking.sql`, puis `supabase/migration_guardian_signature.sql` dans Supabase SQL Editor. Le bouton « Signer la convention » n'est proposé qu'à un **compte personnel du responsable légal**, authentifié avec une adresse e-mail vérifiée identique à `contact_email` de la réservation confirmée. Le compte de l'établissement ne peut pas signer à sa place. La signature PNG transparente est conservée dans `convention_signatures.evidence_reference`, avec l'UUID du signataire, la date et la version de convention ; elle est réinjectée dans le PDF lors de sa génération. Une signature existante ne peut pas être remplacée depuis l'application. Ne pas traiter ce tracé comme une signature électronique qualifiée. La procédure de création/validation des comptes personnels des responsables légaux et le cadre juridique doivent être validés avant utilisation réelle.

## Convention PDF définitive (migration supplémentaire)

Exécuter `supabase/migration_final_convention.sql` après les deux migrations de suivi/signature.
Lorsque les signatures `host` et `guardian` existent pour la version courante, le responsable légal peut déclencher la génération et l'archivage du PDF privé dans Supabase Storage. Le bouton de téléchargement utilise le fichier archivé, non un PDF régénéré.

**Limites de sécurité importantes avant production :** la génération PDF est encore réalisée côté navigateur. La fonction SQL contrôle l'existence du fichier PDF, sa version et les signatures, mais **ne vérifie pas cryptographiquement le contenu du PDF**. Pour un document probant, déplacer la génération et l'archivage vers une fonction serveur de confiance, vérifier les signatures et produire une empreinte SHA-256. La signature du chef d'établissement n'est pas créée par cette migration. La création d'une nouvelle version et le verrouillage serveur des champs de convention après signature doivent être implémentés et testés avant utilisation réelle. Les politiques de mise à jour existantes doivent être auditées afin d'empêcher un client de modifier les colonnes de finalisation directement.

## Comptes rendus : brouillon et validation (mise à jour)

Exécuter `supabase/migration_stage_report_validation.sql` dans Supabase SQL Editor après les migrations précédentes. Le compte rendu ne peut être rédigé que par un administrateur après un stage confirmé et effectué. « Enregistrer le brouillon » sauvegarde les champs dans `applications.stage_report` sans produire de PDF final. « Valider et générer le PDF » produit le PDF, mémorise la date et l'identifiant du validateur et verrouille la modification. Le tableau de bord et les détails ne proposent le PDF qu'après validation. Les anciens comptes rendus disposant d'un PDF mais sans `validated_at` restent non validés : ils nécessitent une vérification et une validation explicite.

**Limites de sécurité avant production** : le PDF est actuellement généré dans le navigateur et stocké en base au format base64. Le contrôle SQL empêche les modifications ultérieures par les comptes applicatifs, mais ne garantit pas cryptographiquement l'authenticité du PDF. Pour une exploitation institutionnelle, privilégier une génération serveur et un stockage privé avec politique de conservation validée. Tester les accès aux comptes rendus avec plusieurs comptes distincts et faire valider le dispositif par le DPD.

## Renforcement de sécurité et intégrité (migration additive)

Après les migrations précédentes, exécuter `supabase/migration_security_integrity.sql` dans SQL Editor, **d'abord sur un projet de test**. Cette migration ajoute des contrôles serveur sur l'identité et les droits des profils, la cohérence créneau/formation, les doublons d'inscription au même créneau, le verrouillage des informations après signature et les conditions de finalisation. Elle ne supprime aucun compte ni dossier. Les anciens dossiers ne sont pas modifiés ; leurs incohérences éventuelles doivent être auditées séparément.

**Limites non résolues :** le PDF de convention est encore généré et téléversé depuis le navigateur, ce qui ne permet pas au serveur de prouver que son contenu correspond aux signatures ; l'enregistrement du compte rendu reste en JSON/Base64 plutôt que dans un espace documentaire privé immuable. La vérification du statut réel de la signature du chef d'établissement et le versionnement complet des conventions nécessitent un service serveur dédié. Avant usage avec des mineurs, réaliser un audit RLS/Storage et des tests d'accès croisés, ainsi qu'une validation RGPD et juridique par l'établissement.


## Logo et signature de l’établissement (administration)

Exécutez `supabase/migration_institution_branding.sql` après les migrations de suivi/signature. Dans **Paramètres**, importez un logo JPEG et une signature JPEG (650 Ko maximum). Le logo est visible en haut à droite des conventions. La signature d’accueil n’est apposée sur une convention qu’au moment de sa **nouvelle confirmation par l’administrateur**, sous réserve d’une autorisation explicite du signataire. Les anciennes conventions et les PDF finalisés ne sont pas modifiés. L’import n’a pas d’effet rétroactif.

**Attention :** la signature est une image manuscrite numérisée et ne constitue pas une signature électronique qualifiée. Les images de signature sont accessibles uniquement aux administrateurs dans la table `institution_assets`; la copie associée à une convention est visible par les personnes autorisées à consulter cette convention. Ne pas partager des liens publics vers ces données. Avant toute utilisation réelle, faire valider ce procédé par l’établissement.

**Limite :** la signature d’accueil est automatiquement associée aux nouvelles confirmations réalisées depuis cette version de l’application, pas aux réservations déjà confirmées. Si une convention doit être modifiée après signature, créer un nouveau processus de versionnement (non automatisé).


## Mise à jour du modèle de convention — 16 octobre 2026

- Page 1 : encart logo de 32 × 24 mm en haut à droite. Le logo importé dans Administration → Paramètres est utilisé lorsqu’il est disponible.
- Bas de page : trois encadrés de signature : établissement d’accueil, établissement d’origine, responsable légal.
- Signature d’accueil : utilise la signature autorisée enregistrée pour cette réservation et cette version lors de la confirmation, issue du fichier JPEG importé dans Paramètres.
- Signature du responsable légal : utilise le tracé enregistré pour cette convention.
- Signature d’origine : encadré disponible. Elle n’est insérée que si une signature `origin` est déjà enregistrée pour cette version ; le parcours de collecte de cette signature n’est **pas encore implémenté**.
- Page 2 : les six articles existants sont conservés sans changement.
- Si les informations sont trop longues pour tenir au-dessus des signatures, la génération est refusée plutôt que d’écraser les blocs.
- Aucun changement SQL requis pour cette seule modification de mise en page. La logique de finalisation existante vérifie toujours accueil + responsable légal ; elle **ne vérifie pas encore** la signature d’origine. Ne pas considérer cette version comme un circuit de signature à trois signataires finalisé.

## Correctifs du 16 octobre 2026 — compte rendu et convention

- Réintégration des neuf critères de la grille d'évaluation de l'EREA de Muret : correction de l'erreur JavaScript qui empêchait l'ouverture de la saisie du compte rendu.
- Prise en charge des stages au statut `completed` en plus de `confirmed` pour l'accès au compte rendu.
- Déplacement du logo configuré en administration dans l'encart en haut **à gauche** de la première page de la convention.
- Le bouton « Imprimer la convention » ouvre désormais le PDF dans un nouvel onglet (avec téléchargement de secours si les fenêtres contextuelles sont bloquées).
- Les trois encarts de signature restent : établissement d'accueil, établissement d'origine, responsable légal.

**Déploiement** : remplacer `app.js` et, si souhaité, `README.md` sur GitHub. Conserver le `config.js` de votre site. Aucune migration Supabase supplémentaire pour ces correctifs ; ne pas rejouer les migrations déjà exécutées. Tester en préproduction avec un dossier fictif. La syntaxe JavaScript est vérifiée, mais les parcours Supabase et l'impression réelle restent à valider sur le site déployé.

## Mise à jour du 17 octobre 2026 — comptes rendus définitifs

- Administration > Inscriptions : boutons de confirmation/refus retirés de la colonne Actions (les données et statuts historiques sont conservés).
- Le bouton « Enregistrer définitivement et envoyer le PDF » valide le compte rendu, fige son contenu et crée le PDF. Le document peut être ouvert avec l'icône 📄 dans Actions. Aucun bouton d'édition n'est affiché après validation.
- L'application tente automatiquement l'envoi du PDF à `college_email` de l'établissement d'origine. Une icône d'envoi permet de relancer l'envoi en cas d'échec. Un e-mail envoyé ne doit être considéré comme tel que lorsque l'icône indique la réussite.
- Dans Supabase SQL Editor, exécuter **une seule fois** `supabase/migration_stage_report_email_lock.sql` après les migrations précédentes. Elle permet la mise à jour des métadonnées d'envoi sans déverrouiller le PDF validé.
- Dans Supabase Edge Functions, redéployer `supabase/functions/send-stage-report/index.ts`. Configurer les secrets `RESEND_API_KEY` et `STAGE_REPORT_FROM` (expéditeur vérifié auprès de Resend). L'envoi ne fonctionne pas en mode démonstration.
- Conserver le `config.js` déployé et ne jamais publier de clé service_role.
- Contrôles effectués hors ligne : syntaxe JavaScript et intégrité ZIP. Tests réels Supabase et distribution e-mail non effectués.
