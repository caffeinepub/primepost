export const fr = {
  // Common
  common: {
    appName: 'PrimePost',
    loading: 'Chargement...',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    back: 'Retour',
    next: 'Suivant',
    submit: 'Soumettre',
    confirm: 'Confirmer',
    close: 'Fermer',
    search: 'Rechercher',
    filter: 'Filtrer',
    yes: 'Oui',
    no: 'Non',
    ok: 'OK',
    error: 'Erreur',
    success: 'Succès',
    warning: 'Avertissement',
  },

  // Roles
  roles: {
    customer: 'Client',
    storeOwner: 'Propriétaire de Magasin',
    superAdmin: 'Super Administrateur',
  },

  // Home Page
  home: {
    welcome: 'Bienvenue sur PrimePost',
    chooseRole: 'Choisissez votre rôle pour continuer',
    loginAsCustomer: 'Connexion en tant que Client',
    loginAsStoreOwner: 'Connexion en tant que Propriétaire',
    loginAsSuperAdmin: 'Connexion en tant que Super Admin',
    downloadApp: 'Télécharger l\'Application Android',
  },

  // Login
  login: {
    title: 'Connexion',
    customerTitle: 'Connexion Client',
    storeOwnerTitle: 'Connexion Propriétaire',
    superAdminTitle: 'Connexion Super Admin',
    customerDesc: 'Accédez à vos commandes, parcourez les magasins et achetez sur le marché',
    storeOwnerDesc: 'Gérez vos magasins, produits et commandes clients',
    superAdminDesc: 'Gérez l\'ensemble de la plateforme, les magasins et les utilisateurs',
    signIn: 'Se connecter avec Internet Identity',
    signingIn: 'Connexion en cours...',
    backToHome: 'Retour à l\'accueil',
    loadingProfile: 'Chargement de votre profil...',
  },

  // Profile Setup
  profileSetup: {
    title: 'Bienvenue sur PrimePost',
    subtitle: 'Complétez votre profil pour commencer',
    fullName: 'Nom Complet',
    phoneNumber: 'Numéro de Téléphone',
    email: 'Adresse Email',
    dateOfBirth: 'Date de Naissance',
    nationality: 'Nationalité',
    stateOfResidence: 'État de Résidence',
    selectRole: 'Sélectionnez Votre Rôle',
    acceptTerms: 'J\'accepte les Conditions Générales',
    acceptPrivacy: 'J\'accepte la Politique de Confidentialité',
    createProfile: 'Créer le Profil',
    creating: 'Création...',
    fillAllFields: 'Veuillez remplir tous les champs obligatoires',
    mustAcceptTerms: 'Vous devez accepter les Conditions Générales et la Politique de Confidentialité',
    profileCreated: 'Profil créé avec succès!',
  },

  // Settings
  settings: {
    title: 'Paramètres',
    profile: 'Profil',
    userId: 'ID Utilisateur',
    language: 'Langue',
    changePin: 'Changer le PIN',
    currentPin: 'PIN Actuel',
    newPin: 'Nouveau PIN',
    confirmPin: 'Confirmer le Nouveau PIN',
    updateProfile: 'Mettre à Jour le Profil',
    profileUpdated: 'Profil mis à jour avec succès!',
    pinChanged: 'PIN changé avec succès!',
  },

  // Navigation
  nav: {
    dashboard: 'Tableau de Bord',
    findStores: 'Trouver des Magasins',
    marketplace: 'Marché',
    cart: 'Panier',
    orders: 'Commandes',
    registerStore: 'Enregistrer un Magasin',
    settings: 'Paramètres',
    logout: 'Déconnexion',
    loggingOut: 'Déconnexion...',
  },

  // Customer Dashboard
  customerDashboard: {
    welcome: 'Bon retour!',
    enterStoreId: 'Entrer l\'ID du Magasin',
    searchStores: 'Rechercher des Magasins',
    browseMarketplace: 'Parcourir le Marché',
    viewCart: 'Voir le Panier',
    myOrders: 'Mes Commandes',
  },

  // Store Search
  storeSearch: {
    title: 'Trouver des Magasins',
    searchByName: 'Rechercher par nom...',
    category: 'Catégorie',
    allCategories: 'Toutes les Catégories',
    nearMe: 'Près de Moi',
    noStores: 'Aucun magasin trouvé',
    locationDenied: 'Accès à la localisation refusé. Veuillez activer la localisation pour utiliser "Près de Moi".',
    locationUnavailable: 'La localisation n\'est pas disponible sur cet appareil.',
  },

  // Store Detail
  storeDetail: {
    products: 'Produits',
    reviews: 'Avis',
    outOfStock: 'Rupture de Stock',
    inStock: 'En Stock',
    addToCart: 'Ajouter au Panier',
    storeBlocked: 'Ce magasin est actuellement bloqué et ne peut pas accepter de commandes.',
    noProducts: 'Aucun produit disponible',
  },

  // Cart
  cart: {
    title: 'Panier',
    empty: 'Votre panier est vide',
    total: 'Total',
    checkout: 'Passer la Commande',
    remove: 'Retirer',
    quantity: 'Quantité',
  },

  // Checkout
  checkout: {
    title: 'Passer la Commande',
    orderSummary: 'Résumé de la Commande',
    tableNumber: 'Numéro de Table (Optionnel)',
    specialInstructions: 'Instructions Spéciales (Optionnel)',
    paymentMethod: 'Méthode de Paiement',
    cash: 'Espèces',
    mobileMoney: 'Mobile Money',
    mobileMoneyNumber: 'Numéro Mobile Money',
    placeOrder: 'Passer la Commande',
    placingOrder: 'Commande en cours...',
    orderPlaced: 'Commande passée avec succès!',
    storeBlocked: 'Ce magasin est bloqué et ne peut pas accepter de commandes.',
  },

  // Orders
  orders: {
    title: 'Mes Commandes',
    active: 'Actives',
    completed: 'Terminées',
    noOrders: 'Aucune commande trouvée',
    orderDetails: 'Détails de la Commande',
    status: 'Statut',
    items: 'Articles',
    table: 'Table',
    notes: 'Notes',
    payment: 'Paiement',
    pending: 'En Attente',
    inProgress: 'En Cours',
    onTheWay: 'En Route',
    completedStatus: 'Terminée',
  },

  // Marketplace
  marketplace: {
    title: 'Marché',
    searchProducts: 'Rechercher des produits...',
    nearMe: 'Près de Moi',
    sortByPrice: 'Trier par Prix',
    discount: 'Réduction',
    noProducts: 'Aucun produit trouvé',
  },

  // Owner Dashboard
  ownerDashboard: {
    title: 'Mes Magasins',
    registerNewStore: 'Enregistrer un Nouveau Magasin',
    noStores: 'Vous n\'avez pas encore enregistré de magasins',
    manageInventory: 'Gérer l\'Inventaire',
    manageOrders: 'Gérer les Commandes',
    storeSettings: 'Paramètres du Magasin',
  },

  // Store Registration
  storeRegistration: {
    title: 'Enregistrer un Nouveau Magasin',
    storeName: 'Nom du Magasin',
    category: 'Catégorie',
    location: 'Emplacement',
    mobileMoneyNumber: 'Numéro Mobile Money',
    register: 'Enregistrer le Magasin',
    registering: 'Enregistrement...',
    storeRegistered: 'Magasin enregistré avec succès!',
    fillAllFields: 'Veuillez remplir tous les champs',
  },

  // Inventory
  inventory: {
    title: 'Inventaire',
    addProduct: 'Ajouter un Produit',
    productName: 'Nom du Produit',
    price: 'Prix',
    stock: 'Quantité en Stock',
    discount: 'Réduction (%)',
    marketplace: 'Afficher sur le Marché',
    outOfStock: 'Marquer comme Rupture de Stock',
    lowStock: 'Alerte Stock Faible',
    uploadImage: 'Télécharger une Image',
    saveProduct: 'Enregistrer le Produit',
    deleteProduct: 'Supprimer le Produit',
    noProducts: 'Aucun produit encore',
  },

  // Order Management
  orderManagement: {
    title: 'Gestion des Commandes',
    pending: 'En Attente',
    inProgress: 'En Cours',
    completed: 'Terminées',
    accept: 'Accepter',
    markInProgress: 'Marquer En Cours',
    markOnTheWay: 'Marquer En Route',
    markCompleted: 'Marquer Terminée',
    noOrders: 'Aucune commande',
  },

  // Admin Dashboard
  adminDashboard: {
    title: 'Tableau de Bord Admin',
    customers: 'Clients',
    stores: 'Magasins',
    orders: 'Commandes',
    analytics: 'Analytiques',
    manageTerms: 'Gérer les Conditions',
    totalRevenue: 'Revenu Total',
    totalOrders: 'Total des Commandes',
    activeStores: 'Magasins Actifs',
    suspend: 'Suspendre',
    unsuspend: 'Réactiver',
    block: 'Bloquer',
    unblock: 'Débloquer',
  },

  // Terms
  terms: {
    customerTerms: 'Conditions Générales Client',
    storeOwnerTerms: 'Conditions Générales Propriétaire',
    privacyPolicy: 'Politique de Confidentialité',
    accept: 'Accepter',
    decline: 'Refuser',
    mustAccept: 'Vous devez accepter les conditions pour continuer',
  },

  // Errors
  errors: {
    unauthorized: 'Accès non autorisé',
    notFound: 'Non trouvé',
    serverError: 'Erreur serveur',
    networkError: 'Erreur réseau',
    tryAgain: 'Veuillez réessayer',
  },

  // Footer
  footer: {
    builtWith: 'Construit avec',
    love: 'amour',
    using: 'en utilisant',
    allRightsReserved: 'Tous droits réservés',
  },
};
