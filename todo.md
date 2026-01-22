# Liste des tâches - MVP Place de marché B2B

## Légende des difficultés
- **Facile** : Tâche simple, peu de complexité technique
- **Moyen** : Tâche nécessitant une attention particulière ou plusieurs composants
- **Difficile** : Tâche complexe nécessitant une architecture solide ou plusieurs intégrations

---

## 1. Configuration initiale et architecture

| # | Tâche | Difficulté | Éléments à modifier/créer |
|---|-------|------------|---------------------------|
| 1.1 | Initialiser le projet frontend avec Vite + React | Facile | Créer `Front/` avec structure Vite, configurer React, TypeScript |
| 1.2 | Initialiser le projet backend avec Node.js | Facile | Créer `Back/` avec Express/Fastify, structure de dossiers (routes, controllers, middleware) |
| 1.3 | Configurer Supabase (client, types, migrations) | Moyen | Créer fichiers de config Supabase, initialiser migrations, générer types TypeScript |
| 1.4 | Configurer l'environnement de développement (.env, variables) | Facile | Créer `.env.example`, configurer variables d'environnement frontend/backend |
| 1.5 | Mettre en place la structure de dossiers (frontend/backend) | Facile | Organiser dossiers : components, pages, services, hooks (frontend) ; routes, controllers, middleware, models (backend) |

---

## 2. Base de données et schéma Supabase

| # | Tâche | Difficulté | Éléments à modifier/créer |
|---|-------|------------|---------------------------|
| 2.1 | Créer la table `espaces` (id, nom, description, created_at, updated_at) | Facile | Migration Supabase : table `espaces` |
| 2.2 | Créer la table `users` étendue (id, email, siret, espace_id, role, statut_validation, created_at) | Moyen | Migration Supabase : table `users` avec foreign key vers `espaces`, relation avec auth.users |
| 2.3 | Créer la table `codes_parrainage` (id, code, espace_id, gestionnaire_id, utilisé, created_at) | Facile | Migration Supabase : table `codes_parrainage` |
| 2.4 | Créer la table `offres` (id, titre, description, prix, localisation, photo_url, categorie, date_expiration, statut, anonyme_entreprise, anonyme_email, user_id, espace_id, created_at, updated_at, deleted_at) | Moyen | Migration Supabase : table `offres` avec soft delete, statuts enum |
| 2.5 | Créer la table `historique_statuts_offres` (id, offre_id, ancien_statut, nouveau_statut, gestionnaire_id, created_at) | Facile | Migration Supabase : table d'historique |
| 2.6 | Créer la table `messages` (id, offre_id, expediteur_id, destinataire_id, contenu, lu, created_at) | Facile | Migration Supabase : table `messages` |
| 2.7 | Créer la table `categories` (id, nom, description) | Facile | Migration Supabase : table `categories` avec données de base |
| 2.8 | Configurer les Row Level Security (RLS) pour toutes les tables | Difficile | Policies RLS Supabase : règles par rôle (Admin, Gestionnaire, Client, Visiteur) |
| 2.9 | Créer les fonctions RPC nécessaires (validation offre, génération code parrainage, etc.) | Moyen | Fonctions SQL Supabase : RPC pour opérations métier |
| 2.10 | Configurer les triggers pour l'historique des statuts | Moyen | Triggers SQL Supabase : automatisation historique statuts offres |

---

## 3. Authentification et inscription

| # | Tâche | Difficulté | Éléments à modifier/créer |
|---|-------|------------|---------------------------|
| 3.1 | Créer la page d'inscription (email, mot de passe, SIRET, code parrainage) | Moyen | `Front/src/pages/InscriptionPage.tsx`, formulaire avec validation |
| 3.2 | Implémenter la logique d'inscription backend (vérification code parrainage, création compte) | Moyen | `Back/routes/auth.js`, `Back/controllers/authController.js` |
| 3.3 | Créer la page de connexion (email + mot de passe) | Facile | `Front/src/pages/LoginPage.tsx`, intégration Supabase Auth |
| 3.4 | Implémenter la gestion de session (connexion/déconnexion) | Facile | `Front/src/hooks/useAuth.tsx`, `Front/src/context/AuthContext.tsx` |
| 3.5 | Créer le middleware d'authentification backend | Moyen | `Back/middleware/authMiddleware.js`, vérification token Supabase |
| 3.6 | Gérer les états de validation (en attente, validé, refusé) | Moyen | Logique backend + affichage frontend selon statut utilisateur |

---

## 4. Gestion des rôles et permissions

| # | Tâche | Difficulté | Éléments à modifier/créer |
|---|-------|------------|---------------------------|
| 4.1 | Créer le système de rôles (Admin, Gestionnaire, Client, Visiteur) | Moyen | Enum/constantes rôles, middleware de vérification |
| 4.2 | Implémenter le middleware de vérification des rôles backend | Moyen | `Back/middleware/roleMiddleware.js`, vérification permissions par route |
| 4.3 | Créer les hooks React pour vérifier les rôles frontend | Facile | `Front/src/hooks/useRoles.tsx`, `Front/src/hooks/usePermissions.tsx` |
| 4.4 | Créer les composants de protection de routes (ProtectedRoute, RoleGuard) | Moyen | `Front/src/components/ProtectedRoute.tsx`, `Front/src/components/RoleGuard.tsx` |
| 4.5 | Implémenter la logique de permissions par rôle dans les composants | Moyen | Vérifications conditionnelles dans tous les composants sensibles |

---

## 5. Gestion des espaces

| # | Tâche | Difficulté | Éléments à modifier/créer |
|---|-------|------------|---------------------------|
| 5.1 | Créer l'interface d'administration des espaces (Admin uniquement) | Moyen | `Front/src/pages/admin/EspacesPage.tsx`, CRUD espaces |
| 5.2 | Implémenter les routes backend pour la gestion des espaces | Moyen | `Back/routes/espaces.js`, `Back/controllers/espacesController.js` |
| 5.3 | Créer l'interface d'affectation utilisateurs à un espace (Gestionnaire) | Moyen | `Front/src/pages/gestionnaire/AffectationEspacePage.tsx` |
| 5.4 | Implémenter la logique de filtrage par espace (offres, messages) | Difficile | RLS Supabase + logique backend pour filtrer par espace_id |
| 5.5 | Afficher l'espace actuel de l'utilisateur dans l'interface | Facile | Composant header/navbar avec affichage espace |

---

## 6. Système d'offres/annonces

| # | Tâche | Difficulté | Éléments à modifier/créer |
|---|-------|------------|---------------------------|
| 6.1 | Créer le formulaire de création d'offre (tous champs obligatoires + options anonymat) | Moyen | `Front/src/pages/offres/CreerOffrePage.tsx`, formulaire avec upload photo |
| 6.2 | Implémenter l'upload de photos (Supabase Storage) | Moyen | Configuration Supabase Storage, composant upload, backend route upload |
| 6.3 | Créer la logique de validation d'offre (statut : brouillon → en attente → publiée) | Moyen | Backend : changement statut, enregistrement historique |
| 6.4 | Créer l'interface de gestion des offres pour les clients (liste, modifier, supprimer) | Moyen | `Front/src/pages/offres/MesOffresPage.tsx`, actions CRUD |
| 6.5 | Créer l'interface de validation des offres pour les gestionnaires | Moyen | `Front/src/pages/gestionnaire/ValidationOffresPage.tsx`, liste avec actions valider/refuser |
| 6.6 | Implémenter le soft delete des offres | Facile | Backend : mise à jour `deleted_at`, filtrage dans les requêtes |
| 6.7 | Créer l'affichage des offres (liste et détail) avec respect de l'anonymat | Moyen | `Front/src/pages/offres/ListeOffresPage.tsx`, `Front/src/pages/offres/DetailOffrePage.tsx` |
| 6.8 | Implémenter l'historique des statuts (affichage pour gestionnaires) | Facile | Composant historique, requête avec jointure table historique |
| 6.9 | Gérer les dates d'expiration (masquer les offres expirées) | Facile | Filtre SQL/backend sur `date_expiration` |

---

## 7. Messagerie

| # | Tâche | Difficulté | Éléments à modifier/créer |
|---|-------|------------|---------------------------|
| 7.1 | Créer l'interface de messagerie (liste conversations, messages) | Moyen | `Front/src/pages/messagerie/ConversationsPage.tsx`, `Front/src/pages/messagerie/ConversationDetailPage.tsx` |
| 7.2 | Implémenter l'envoi de messages (respect de l'anonymat) | Moyen | Backend : relais messages si anonymat activé, masquage email/nom entreprise |
| 7.3 | Créer le système de notifications de nouveaux messages (frontend uniquement, pas d'email MVP) | Moyen | Badge compteur, polling ou WebSocket pour nouveaux messages |
| 7.4 | Implémenter la vue des conversations pour les gestionnaires | Facile | Filtre/affichage toutes conversations de l'espace |
| 7.5 | Créer le bouton "Contacter" sur les pages d'offres | Facile | Composant bouton, redirection vers messagerie avec pré-remplissage |

---

## 8. Recherche et navigation

| # | Tâche | Difficulté | Éléments à modifier/créer |
|---|-------|------------|---------------------------|
| 8.1 | Créer la page de recherche avec barre de recherche | Moyen | `Front/src/pages/RecherchePage.tsx`, input recherche |
| 8.2 | Implémenter les filtres avancés (catégorie, localisation, prix, date expiration) | Moyen | Composants filtres, logique backend de filtrage |
| 8.3 | Créer les routes backend pour la recherche avec filtres | Moyen | `Back/routes/recherche.js`, requête SQL avec WHERE dynamique |
| 8.4 | Implémenter le filtrage automatique par espace (offres visibles uniquement dans l'espace) | Difficile | RLS + logique backend pour garantir filtrage espace |
| 8.5 | Créer la navigation par catégories | Facile | Menu/liens catégories, page liste par catégorie |

---

## 9. Interface utilisateur

| # | Tâche | Difficulté | Éléments à modifier/créer |
|---|-------|------------|---------------------------|
| 9.1 | Créer le layout principal (header, sidebar, footer) | Facile | `Front/src/layouts/MainLayout.tsx`, composants Header, Sidebar, Footer |
| 9.2 | Créer la page d'accueil (dashboard selon rôle) | Moyen | `Front/src/pages/HomePage.tsx`, affichage conditionnel selon rôle |
| 9.3 | Créer le design sobre et corporate (CSS/styling) | Moyen | Thème CSS, variables, composants UI cohérents |
| 9.4 | Implémenter la navigation principale (menu selon rôle) | Moyen | Menu dynamique selon permissions utilisateur |
| 9.5 | Créer les composants UI réutilisables (boutons, formulaires, modales) | Moyen | `Front/src/components/ui/`, bibliothèque de composants |
| 9.6 | Ajouter la gestion des erreurs et messages de succès | Facile | Composants Toast/Alert, gestion erreurs API |
| 9.7 | Implémenter le responsive design (mobile, tablette, desktop) | Moyen | Media queries, adaptation layout mobile |

---

## 10. Gestion des codes de parrainage

| # | Tâche | Difficulté | Éléments à modifier/créer |
|---|-------|------------|---------------------------|
| 10.1 | Créer l'interface de génération de codes de parrainage (Gestionnaire) | Facile | `Front/src/pages/gestionnaire/CodesParrainagePage.tsx`, formulaire génération |
| 10.2 | Implémenter la logique de génération de codes backend | Facile | Backend : génération code unique, enregistrement en BDD |
| 10.3 | Créer l'interface de gestion des codes (Admin) | Facile | Liste codes, statistiques utilisation |
| 10.4 | Implémenter la validation du code à l'inscription | Facile | Vérification code existant et non utilisé lors inscription |

---

## 11. API et backend

| # | Tâche | Difficulté | Éléments à modifier/créer |
|---|-------|------------|---------------------------|
| 11.1 | Créer la structure des routes API REST | Moyen | `Back/routes/`, organisation par domaine (auth, offres, messages, etc.) |
| 11.2 | Implémenter les controllers pour chaque domaine | Moyen | `Back/controllers/`, logique métier séparée |
| 11.3 | Créer la gestion d'erreurs centralisée | Facile | Middleware erreurs, format réponse standardisé |
| 11.4 | Documenter l'API (Swagger/OpenAPI ou README) | Moyen | Documentation endpoints, paramètres, réponses |
| 11.5 | Implémenter la validation des données (Joi/Zod) | Moyen | Schémas validation, middleware validation requêtes |
| 11.6 | Configurer CORS et sécurité | Facile | Configuration CORS, headers sécurité |

---

## 12. RGPD et conformité

| # | Tâche | Difficulté | Éléments à modifier/créer |
|---|-------|------------|---------------------------|
| 12.1 | Créer le composant de consentement cookies | Facile | `Front/src/components/CookieConsent.tsx`, modal consentement |
| 12.2 | Implémenter le stockage du consentement | Facile | LocalStorage, gestion préférences cookies |
| 12.3 | Créer l'interface de demande de droit à l'oubli | Moyen | `Front/src/pages/ProfilPage.tsx`, bouton demande suppression |
| 12.4 | Implémenter la logique de suppression/anonymisation des données | Difficile | Backend : procédure suppression/anonymisation complète (offres, messages, compte) |
| 12.5 | Créer la page de politique de confidentialité | Facile | `Front/src/pages/PrivacyPolicyPage.tsx`, contenu RGPD |

---

## 13. Administration et gestion

| # | Tâche | Difficulté | Éléments à modifier/créer |
|---|-------|------------|---------------------------|
| 13.1 | Créer le dashboard Admin (vue d'ensemble plateforme) | Moyen | `Front/src/pages/admin/DashboardPage.tsx`, statistiques, graphiques |
| 13.2 | Créer l'interface de gestion des utilisateurs (Admin) | Moyen | `Front/src/pages/admin/UtilisateursPage.tsx`, liste, filtres, actions |
| 13.3 | Créer l'interface de validation des inscriptions (Gestionnaire) | Moyen | `Front/src/pages/gestionnaire/ValidationInscriptionsPage.tsx`, liste en attente, actions |
| 13.4 | Implémenter la désactivation de comptes (Gestionnaire) | Facile | Backend : changement statut utilisateur, désactivation |
| 13.5 | Créer l'interface de modification d'offres par gestionnaire | Moyen | Formulaire édition avec permissions gestionnaire |

---

## 14. Tests et qualité

| # | Tâche | Difficulté | Éléments à modifier/créer |
|---|-------|------------|---------------------------|
| 14.1 | Écrire les tests unitaires backend (routes, controllers) | Moyen | Tests Jest/Mocha, couverture routes principales |
| 14.2 | Écrire les tests d'intégration (flux complets) | Difficile | Tests end-to-end, scénarios utilisateur complets |
| 14.3 | Configurer le linting et formatage (ESLint, Prettier) | Facile | Configuration ESLint, Prettier, scripts npm |
| 14.4 | Vérifier la sécurité (injection SQL, XSS, CSRF) | Difficile | Audit sécurité, protection contre vulnérabilités communes |

---

## 15. Déploiement et documentation

| # | Tâche | Difficulté | Éléments à modifier/créer |
|---|-------|------------|---------------------------|
| 15.1 | Configurer le déploiement frontend (Vercel/Netlify) | Facile | Configuration déploiement, variables environnement |
| 15.2 | Configurer le déploiement backend (Railway/Render/Heroku) | Moyen | Configuration serveur, base de données production |
| 15.3 | Créer le README principal avec instructions d'installation | Facile | `README.md`, guide installation, prérequis |
| 15.4 | Documenter l'architecture du projet | Moyen | `ARCHITECTURE.md`, diagrammes, explications |
| 15.5 | Créer un guide utilisateur (pour testeurs) | Facile | `GUIDE_UTILISATEUR.md`, instructions utilisation par rôle |

---

## Résumé par difficulté

- **Facile** : 25 tâches
- **Moyen** : 35 tâches  
- **Difficile** : 5 tâches

**Total : 65 tâches**
