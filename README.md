1. Principes et architecture du projet

Architecture Clean Architecture / Hexagonale Le projet suit une architecture en couches inspiree de la Clean Architecture avec separation claire des responsabilites :

src/
├── core/                    # Couche Domaine (coeur metier)
│   ├── config/             # Configuration centralisee
│   └── domain/
│       ├── entities/       # Entites metier (User, Listing, Message)
│       └── services/       # Services domaine (AuthService, ListingService)
│
├── application/            # Couche Application (use cases)
│   └── use-cases/         # AuthUseCases, ListingUseCases, MessageUseCases
│
├── infrastructure/         # Couche Infrastructure
│   ├── database/          # Client Supabase
│   └── repositories/      # Implementations des repos (AuthRepository, ListingRepository, MessageRepository)
│
├── presentation/          # Couche Presentation
│   ├── components/        # Composants React reutilisables
│   └── hooks/             # Hooks React (useAuthState, useListingOperations, etc.)
│
├── pages/                 # Pages de l'application
├── components/            # Composants UI partages
└── hooks/                 # Hooks utilitaires

Technologies utilisees :

    Frontend : React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
    Backend : Supabase (PostgreSQL, Auth, Storage, Edge Functions)
    State Management : React Query (@tanstack/react-query)
    Routing : React Router DOM

2. Fonctionnalites du projet

2.1. Gestion des utilisateurs et authentification

    Inscription avec code affilié (rattachement automatique a une entreprise)
    Connexion/deconnexion avec gestion de session
    Systeme de roles (admin, backoffice, client, visitor)
    Impersonation d'utilisateurs (admin uniquement)
    Verification des comptes (is_verified)

2.2. Gestion des annonces (Listings)

    Creation/modification/suppression d'annonces
    Upload d'images (Supabase Storage)
    Categories et conditions
    Visibilite publique/privee et anonymat
    Suivi des vues (totales et uniques)
    Soft delete avec raison

2.3. Systeme de messagerie

    Envoi de messages entre utilisateurs
    Historique des conversations par annonce
    Marquage lu/non-lu
    Restriction par entreprise

2.4. Gestion des entreprises (Business)

    Code affilié unique par entreprise
    Isolation des donnees par entreprise (RLS)
    Page entreprise avec listings associes

2.5. Administration

    Gestion des utilisateurs (admin)
    Gestion des annonces (admin + backoffice)
    Desactivation d'annonces avec raison
    Creation/suppression d'utilisateurs via Edge Functions

3. Schema de la base de donnees

Tables principales :
Table	Description
businesses	Entreprises avec codes affilies
profiles	Profils utilisateurs lies a auth.users
user_roles	Roles des utilisateurs (enum: admin, backoffice, client, visitor)
listings	Annonces avec statut, visibilite, etc.
categories	Categories d'annonces
conditions	Etats des produits
messages	Messages entre utilisateurs
listing_views	Suivi des vues par annonce

Diagramme ER (Mermaid) :

erDiagram
    auth_users ||--|| profiles : "1:1"
    auth_users ||--o{ user_roles : "1:N"
    businesses ||--o{ profiles : "1:N"
    profiles ||--o{ listings : "1:N"
    categories ||--o{ listings : "1:N"
    conditions ||--o{ listings : "1:N"
    listings ||--o{ listing_views : "1:N"
    listings ||--o{ messages : "1:N"
    profiles ||--o{ messages : "sender"
    profiles ||--o{ messages : "recipient"

4. Flux d'interaction utilisateur

4.1. Inscription :

    Saisie des informations + code affilié
    Validation du code (function validate_affiliate_code)
    Creation utilisateur via Supabase Auth
    Trigger handle_new_user cree le profil avec business_id

4.2. Connexion et navigation :

    Login via Supabase Auth
    Recuperation session + profil + roles
    Navigation conditionnelle selon roles
    RLS filtre automatiquement les donnees par entreprise

4.3. Creation d'annonce :

    Formulaire en 3 etapes
    Upload images vers Supabase Storage
    Insertion en base avec user_id
    RLS verifie les permissions

5. Securite et RLS

Politiques RLS par table :

    businesses : Admin peut tout, utilisateurs voient leur entreprise
    profiles : Lecture par meme entreprise, modification propre profil
    listings : Lecture par entreprise/public, modification par proprietaire/admin
    messages : Acces aux participants uniquement
    user_roles : Admin uniquement

Fonctions de securite :

    has_role(user_id, role) : Verifie un role
    is_admin(uid) : Verifie si admin
    current_business_id() : Retourne l'ID entreprise de l'utilisateur

6. Edge Functions
Fonction	Description
create-user	Creation utilisateur par admin
delete-user	Suppression utilisateur par admin
send-contact-email	Envoi d'emails via Resend
7. Fichier de sortie

Le document Markdown final inclura :

    Description complete de l'architecture
    Liste des fonctionnalites avec flux detailles
    Schema complet de la base de donnees avec types
    Diagramme ER en Mermaid
    Exemples de requetes SQL
    Politiques RLS documentees
    Instructions de reproduction sous autre technologie

Actions a realiser

    Creer le fichier DOCUMENTATION_TECHNIQUE.md a la racine du projet
    Inclure tous les elements decrits ci-dessus
    Formater avec des tableaux, diagrammes Mermaid, et exemples de code
    Ajouter des sections pour faciliter la migration vers une autre stack

