Tu es un développeur full-stack senior chargé de concevoir un MVP de place de marché B2B, similaire à Leboncoin, mais réservée aux professionnels, avec gestion d’espaces fermés.

1. Stack technique imposée

Frontend : Vite + framework moderne (React recommandé)

Backend : Node.js

Base de données & Auth : Supabase

Langue : Français uniquement

Design : Sobre, corporate, orienté B2B

Objectif : MVP fonctionnel, clair et maintenable

2. Concept général

La plateforme est une place de marché par espaces fermés :

Chaque espace regroupe plusieurs entreprises

Les offres sont visibles uniquement dans l’espace

Un utilisateur appartient à un seul espace

3. Authentification & inscription

Inscription via :

Email

Mot de passe

SIRET

Code de parrainage (obligatoire, uniquement à l’inscription)

Aucune vérification automatique du SIRET

Validation manuelle obligatoire par un gestionnaire

Authentification email + mot de passe (Supabase Auth)

4. Rôles & permissions
Rôles disponibles :

Admin

Gestionnaire

Client

Visiteur

Droits :

Admin

Accès total à la plateforme

Gère les espaces

Gère les utilisateurs

Gère les codes de parrainage

Gestionnaire

Associé à un ou plusieurs espaces

Accède uniquement aux espaces auxquels il est rattaché

Valide / refuse :

Inscriptions

Offres

Peut :

Modifier une offre

Soft delete une offre

Désactiver un compte

Générer des codes de parrainage

Voir toutes les conversations

Affecter clients ou visiteurs à un espace

Client

Peut créer des offres

Les offres passent par le statut :

Brouillon

En attente de validation

Publiée

Désactivée (soft delete)

Peut envoyer et recevoir des messages

Visiteur

Peut consulter les offres de son espace

Peut contacter les posteurs

Ne peut pas créer d’offre

5. Offres (annonces)
Champs obligatoires :

Titre

Description

Prix

Localisation

Photo

Catégorie

Date d’expiration (optionnelle)

Règles :

Toute offre créée par un client doit être validée par un gestionnaire

Historique des statuts conservé

Soft delete uniquement (pas de suppression définitive)

Anonymat :

Lors de la création d’une offre, le client peut choisir :

Masquer le nom de l’entreprise

Masquer l’email

Les messages sont relayés via la plateforme

6. Messagerie

Messagerie interne

Toute personne peut contacter le posteur d’une offre

L’anonymat est respecté si activé

Pas de notifications email (MVP)

7. Recherche & navigation

Recherche avec filtres avancés :

Catégorie

Localisation

Prix

Date d’expiration

Offres visibles uniquement dans l’espace de l’utilisateur

8. RGPD & conformité

Consentement cookies

Droit à l’oubli (suppression / anonymisation des données)

Pas de journal d’audit (hors périmètre MVP)

9. Attendus techniques

Schéma de base de données Supabase (tables, relations, rôles)

Middleware de gestion des rôles

Séparation claire frontend / backend

Composants UI simples et propres

API REST ou RPC documentée

Donne :

L’architecture du projet

Les modèles de données

Les principales routes backend

Les écrans frontend essentiels

💡 Objectif final : un MVP fonctionnel permettant de tester rapidement le concept avec de vrais utilisateurs professionnels.