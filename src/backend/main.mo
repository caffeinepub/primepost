import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Text "mo:core/Text";



actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  var superAdminBootstrapped = false;

  // Types
  type StoreId = Text;
  type ProductId = Text;

  public type UserRole = {
    #customer;
    #storeOwner;
    #superAdmin;
  };

  public type UserProfile = {
    fullName : Text;
    phoneNumber : Text;
    email : Text;
    dateOfBirth : Text;
    nationality : Text;
    stateOfResidence : Text;
    role : UserRole;
    isSuspended : Bool;
    acceptedCustomerTerms : Bool;
    acceptedStoreOwnerTerms : Bool;
  };

  public type TermsType = {
    #customerTerms;
    #storeOwnerTerms;
    #privacyPolicy;
  };

  public type TermsContent = {
    customerTerms : Text;
    storeOwnerTerms : Text;
    privacyPolicy : Text;
  };

  type Store = {
    id : StoreId;
    name : Text;
    category : Text;
    location : Text;
    mobileMoneyNumber : Text;
    owner : Principal;
    isBlocked : Bool;
  };

  type Product = {
    id : ProductId;
    storeId : StoreId;
    name : Text;
    imageRef : Storage.ExternalBlob;
    price : Nat;
    stockQty : Nat;
    outOfStock : Bool;
    discount : ?Nat;
    marketplace : Bool;
  };

  type Order = {
    id : Nat;
    storeId : StoreId;
    customer : Principal;
    items : [(ProductId, Nat)];
    tableNumber : ?Nat;
    specialNote : ?Text;
    paymentMethod : { #cash; #mobileMoney };
    status : { #pending; #inProgress; #onTheWay; #completed };
  };

  type Review = {
    storeId : StoreId;
    customer : Principal;
    rating : Nat;
    text : ?Text;
    timestamp : Nat;
  };

  module TermsType {
    public func compare(a : TermsType, b : TermsType) : Order.Order {
      func typeToNat(t : TermsType) : Nat {
        switch (t) {
          case (#customerTerms) { 0 };
          case (#storeOwnerTerms) { 1 };
          case (#privacyPolicy) { 2 };
        };
      };
      Nat.compare(typeToNat(a), typeToNat(b));
    };
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let stores = Map.empty<StoreId, Store>();
  let products = Map.empty<ProductId, Product>();
  let orders = List.empty<Order>();
  let reviews = List.empty<Review>();

  let termsContent = Map.empty<TermsType, Text>();

  var nextOrderId = 0;

  // Helper functions
  private func isCustomer(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (?profile) { profile.role == #customer and not profile.isSuspended };
      case (null) { false };
    };
  };

  private func isStoreOwner(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (?profile) { profile.role == #storeOwner and not profile.isSuspended };
      case (null) { false };
    };
  };

  private func isSuperAdmin(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (?profile) { profile.role == #superAdmin and not profile.isSuspended };
      case (null) { false };
    };
  };

  private func isStoreOwnerOf(caller : Principal, storeId : StoreId) : Bool {
    switch (stores.get(storeId)) {
      case (?store) { store.owner == caller and isStoreOwner(caller) };
      case (null) { false };
    };
  };

  private func isProductOwner(caller : Principal, productId : ProductId) : Bool {
    switch (products.get(productId)) {
      case (?product) { isStoreOwnerOf(caller, product.storeId) };
      case (null) { false };
    };
  };

  private func isOrderOwner(caller : Principal, orderId : Nat) : Bool {
    let orderOpt = orders.find(func(o) { o.id == orderId });
    switch (orderOpt) {
      case (?order) { isStoreOwnerOf(caller, order.storeId) };
      case (null) { false };
    };
  };

  private func hasAcceptedRequiredTerms(caller : Principal, requiredRole : UserRole) : Bool {
    switch (userProfiles.get(caller)) {
      case (?profile) {
        switch (requiredRole) {
          case (#customer) { profile.acceptedCustomerTerms };
          case (#storeOwner) { profile.acceptedStoreOwnerTerms };
          case (#superAdmin) { true };
        };
      };
      case (null) { false };
    };
  };

  // Super Admin Bootstrap
  public shared ({ caller }) func bootstrapSuperAdmin() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can bootstrap");
    };

    if (superAdminBootstrapped) {
      Runtime.trap("SuperAdmin has already been bootstrapped");
    };

    AccessControl.assignRole(accessControlState, caller, caller, #admin);

    let superAdminProfile : UserProfile = {
      fullName = "";
      phoneNumber = "";
      email = "";
      dateOfBirth = "";
      nationality = "";
      stateOfResidence = "";
      role = #superAdmin;
      isSuspended = false;
      acceptedCustomerTerms = false;
      acceptedStoreOwnerTerms = false;
    };
    userProfiles.add(caller, superAdminProfile);

    superAdminBootstrapped := true;
  };

  // User Profile Operations
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not isSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile or be an admin");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can save profiles");
    };

    let existingProfile = userProfiles.get(caller);

    switch (existingProfile) {
      case (?existing) {
        if (existing.role == #superAdmin and profile.role != #superAdmin) {
          Runtime.trap("Unauthorized: Cannot change superAdmin role");
        };
        if (existing.role != #superAdmin and profile.role == #superAdmin) {
          Runtime.trap("Unauthorized: Cannot assign superAdmin role to yourself");
        };
      };
      case (null) {
        if (profile.role == #superAdmin) {
          Runtime.trap("Unauthorized: Cannot assign superAdmin role to yourself");
        };
      };
    };

    let finalProfile = switch (existingProfile) {
      case (?existing) {
        if (existing.role != profile.role) {
          Runtime.trap("Unauthorized: Cannot change your role after initial assignment");
        };
        profile;
      };
      case (null) {
        if (profile.role != #customer and profile.role != #storeOwner) {
          Runtime.trap("Unauthorized: Can only assign customer or storeOwner role");
        };
        profile;
      };
    };

    userProfiles.add(caller, finalProfile);
  };

  // Terms & Conditions Operations
  public shared ({ caller }) func saveTermsContent(termsType : TermsType, content : Text) : async () {
    if (not isSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only super admins can save terms content");
    };

    // Replace [App Name] placeholder with PrimePost
    let processedContent = content.replace(#text "[App Name]", "PrimePost");
    termsContent.add(termsType, processedContent);
  };

  public query ({ caller }) func getTermsContent(termsType : TermsType) : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view terms content");
    };
    termsContent.get(termsType);
  };

  public shared ({ caller }) func acceptTerms({ termsType : TermsType }) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can accept terms");
    };

    let callerProfile = switch (userProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("User profile not found") };
    };

    switch (termsType) {
      case (#customerTerms) {
        if (callerProfile.role != #customer) {
          Runtime.trap("Unauthorized: Only customers can accept customer terms");
        };
      };
      case (#storeOwnerTerms) {
        if (callerProfile.role != #storeOwner) {
          Runtime.trap("Unauthorized: Only store owners can accept store owner terms");
        };
      };
      case (#privacyPolicy) {
        Runtime.trap("Accepting privacy policy is not applicable");
      };
    };

    let updatedProfile : UserProfile = switch (termsType) {
      case (#customerTerms) {
        { callerProfile with acceptedCustomerTerms = true };
      };
      case (#storeOwnerTerms) {
        { callerProfile with acceptedStoreOwnerTerms = true };
      };
      case (#privacyPolicy) { callerProfile };
    };

    userProfiles.add(caller, updatedProfile);
  };

  public query ({ caller }) func hasAcceptedTerms({ termsType : TermsType }) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can check terms acceptance");
    };

    let callerProfile = switch (userProfiles.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("User profile not found") };
    };

    switch (termsType) {
      case (#customerTerms) { callerProfile.acceptedCustomerTerms };
      case (#storeOwnerTerms) { callerProfile.acceptedStoreOwnerTerms };
      case (#privacyPolicy) { false };
    };
  };

  // Store Operations
  public shared ({ caller }) func createStore(
    name : Text,
    category : Text,
    location : Text,
    mobileMoneyNumber : Text,
  ) : async StoreId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create stores");
    };

    if (not isStoreOwner(caller)) {
      Runtime.trap("Unauthorized: Only store owners can create stores");
    };

    if (not hasAcceptedRequiredTerms(caller, #storeOwner)) {
      Runtime.trap("Unauthorized: Must accept Store Owner Terms & Conditions before creating stores");
    };

    let id = name.concat("_").concat(mobileMoneyNumber : Text);
    let store : Store = {
      id;
      name;
      category;
      location;
      mobileMoneyNumber;
      owner = caller;
      isBlocked = false;
    };
    stores.add(id, store);
    id;
  };

  public query ({ caller }) func getStore(id : StoreId) : async ?Store {
    stores.get(id);
  };

  public shared ({ caller }) func updateStore(
    id : StoreId,
    name : Text,
    category : Text,
    location : Text,
    mobileMoneyNumber : Text,
  ) : async () {
    if (not isStoreOwnerOf(caller, id)) {
      Runtime.trap("Unauthorized: Only the store owner can update this store");
    };

    if (not hasAcceptedRequiredTerms(caller, #storeOwner)) {
      Runtime.trap("Unauthorized: Must accept Store Owner Terms & Conditions");
    };

    switch (stores.get(id)) {
      case (?store) {
        let updatedStore : Store = {
          id = store.id;
          name;
          category;
          location;
          mobileMoneyNumber;
          owner = store.owner;
          isBlocked = store.isBlocked;
        };
        stores.add(id, updatedStore);
      };
      case (null) {
        Runtime.trap("Store not found");
      };
    };
  };

  public query ({ caller }) func getMyStores() : async [Store] {
    if (not isStoreOwner(caller)) {
      Runtime.trap("Unauthorized: Only store owners can view their stores");
    };

    stores.values().toArray().filter(func(s) { s.owner == caller });
  };

  // Product Operations
  public shared ({ caller }) func createProduct(
    storeId : StoreId,
    name : Text,
    imageRef : Storage.ExternalBlob,
    price : Nat,
    stockQty : Nat,
  ) : async ProductId {
    if (not isStoreOwnerOf(caller, storeId)) {
      Runtime.trap("Unauthorized: Only the store owner can create products");
    };

    if (not hasAcceptedRequiredTerms(caller, #storeOwner)) {
      Runtime.trap("Unauthorized: Must accept Store Owner Terms & Conditions");
    };

    switch (stores.get(storeId)) {
      case (?store) {
        if (store.isBlocked) {
          Runtime.trap("Store is blocked");
        };
      };
      case (null) {
        Runtime.trap("Store not found");
      };
    };

    let id = name.concat("_").concat(storeId : Text);
    let product : Product = {
      id;
      storeId;
      name;
      imageRef;
      price;
      stockQty;
      outOfStock = stockQty == 0;
      discount = null;
      marketplace = false;
    };
    products.add(id, product);
    id;
  };

  public shared ({ caller }) func updateProduct(
    id : ProductId,
    name : Text,
    imageRef : Storage.ExternalBlob,
    price : Nat,
    stockQty : Nat,
    discount : ?Nat,
    marketplace : Bool,
  ) : async () {
    if (not isProductOwner(caller, id)) {
      Runtime.trap("Unauthorized: Only the product owner can update this product");
    };

    if (not hasAcceptedRequiredTerms(caller, #storeOwner)) {
      Runtime.trap("Unauthorized: Must accept Store Owner Terms & Conditions");
    };

    switch (products.get(id)) {
      case (?product) {
        let updatedProduct : Product = {
          id = product.id;
          storeId = product.storeId;
          name;
          imageRef;
          price;
          stockQty;
          outOfStock = stockQty == 0;
          discount;
          marketplace;
        };
        products.add(id, updatedProduct);
      };
      case (null) {
        Runtime.trap("Product not found");
      };
    };
  };

  public shared ({ caller }) func deleteProduct(id : ProductId) : async () {
    if (not isProductOwner(caller, id)) {
      Runtime.trap("Unauthorized: Only the product owner can delete this product");
    };

    if (not hasAcceptedRequiredTerms(caller, #storeOwner)) {
      Runtime.trap("Unauthorized: Must accept Store Owner Terms & Conditions");
    };

    products.remove(id);
  };

  public query ({ caller }) func getStoreProducts(storeId : StoreId) : async [Product] {
    products.values().toArray().filter(func(p) { p.storeId == storeId });
  };

  // Order Operations
  public shared ({ caller }) func placeOrder(
    storeId : StoreId,
    items : [(ProductId, Nat)],
    tableNumber : ?Nat,
    specialNote : ?Text,
    paymentMethod : { #cash; #mobileMoney },
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can place orders");
    };

    if (not isCustomer(caller)) {
      Runtime.trap("Unauthorized: Only customers can place orders");
    };

    if (not hasAcceptedRequiredTerms(caller, #customer)) {
      Runtime.trap("Unauthorized: Must accept Customer Terms & Conditions before placing orders");
    };

    switch (stores.get(storeId)) {
      case (?store) {
        if (store.isBlocked) {
          Runtime.trap("Store is blocked and cannot accept orders");
        };
      };
      case (null) {
        Runtime.trap("Store not found");
      };
    };

    let order : Order = {
      id = nextOrderId;
      storeId;
      customer = caller;
      items;
      tableNumber;
      specialNote;
      paymentMethod;
      status = #pending;
    };
    orders.add(order);
    nextOrderId += 1;
    order.id;
  };

  public query ({ caller }) func getMyOrders() : async [Order] {
    if (not isCustomer(caller)) {
      Runtime.trap("Unauthorized: Only customers can view their orders");
    };

    orders.filter<Order>(func(o) { o.customer == caller }).toArray();
  };

  public query ({ caller }) func getStoreOrders(storeId : StoreId) : async [Order] {
    if (not isStoreOwnerOf(caller, storeId)) {
      Runtime.trap("Unauthorized: Only the store owner can view store orders");
    };

    orders.filter<Order>(func(o) { o.storeId == storeId }).toArray();
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : { #pending; #inProgress; #onTheWay; #completed }) : async () {
    if (not isOrderOwner(caller, orderId)) {
      Runtime.trap("Unauthorized: Only the store owner can update order status");
    };

    if (not hasAcceptedRequiredTerms(caller, #storeOwner)) {
      Runtime.trap("Unauthorized: Must accept Store Owner Terms & Conditions");
    };

    let updatedOrders = orders.map<Order, Order>(func(o) {
      if (o.id == orderId) {
        {
          id = o.id;
          storeId = o.storeId;
          customer = o.customer;
          items = o.items;
          tableNumber = o.tableNumber;
          specialNote = o.specialNote;
          paymentMethod = o.paymentMethod;
          status;
        };
      } else {
        o;
      };
    });
    orders.clear();
    orders.addAll(updatedOrders.values());
  };

  // Review Operations
  public shared ({ caller }) func submitReview(storeId : StoreId, rating : Nat, text : ?Text) : async () {
    if (not isCustomer(caller)) {
      Runtime.trap("Unauthorized: Only customers can submit reviews");
    };

    if (not hasAcceptedRequiredTerms(caller, #customer)) {
      Runtime.trap("Unauthorized: Must accept Customer Terms & Conditions");
    };

    if (rating < 1 or rating > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };

    let hasCompletedOrder = orders.find(
      func(o) {
        o.customer == caller and o.storeId == storeId and o.status == #completed
      }
    );

    if (hasCompletedOrder == null) {
      Runtime.trap("Can only review stores where you have completed orders");
    };

    let review : Review = {
      storeId;
      customer = caller;
      rating;
      text;
      timestamp = 0;
    };
    reviews.add(review);
  };

  public query ({ caller }) func getStoreReviews(storeId : StoreId) : async [Review] {
    reviews.filter<Review>(func(r) { r.storeId == storeId }).toArray();
  };

  // Marketplace Operations
  public query ({ caller }) func getMarketplaceProducts() : async [Product] {
    products.values().toArray().filter(
      func(p) {
        p.marketplace and not p.outOfStock and
        (switch (stores.get(p.storeId)) {
          case (?store) { not store.isBlocked };
          case (null) { false };
        });
      }
    );
  };

  // Super Admin Operations
  public query ({ caller }) func getAllStores() : async [Store] {
    if (not isSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only super admins can view all stores");
    };

    stores.values().toArray();
  };

  public query ({ caller }) func getAllCustomers() : async [Principal] {
    if (not isSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only super admins can view all customers");
    };

    userProfiles.entries().toArray().filter(func((_, profile)) {
      profile.role == #customer;
    }).map(func((principal, _)) { principal });
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not isSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only super admins can view all orders");
    };

    orders.toArray();
  };

  public shared ({ caller }) func blockStore(storeId : StoreId) : async () {
    if (not isSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only super admins can block stores");
    };

    switch (stores.get(storeId)) {
      case (?store) {
        let updatedStore : Store = {
          id = store.id;
          name = store.name;
          category = store.category;
          location = store.location;
          mobileMoneyNumber = store.mobileMoneyNumber;
          owner = store.owner;
          isBlocked = true;
        };
        stores.add(storeId, updatedStore);
      };
      case (null) {
        Runtime.trap("Store not found");
      };
    };
  };

  public shared ({ caller }) func unblockStore(storeId : StoreId) : async () {
    if (not isSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only super admins can unblock stores");
    };

    switch (stores.get(storeId)) {
      case (?store) {
        let updatedStore : Store = {
          id = store.id;
          name = store.name;
          category = store.category;
          location = store.location;
          mobileMoneyNumber = store.mobileMoneyNumber;
          owner = store.owner;
          isBlocked = false;
        };
        stores.add(storeId, updatedStore);
      };
      case (null) {
        Runtime.trap("Store not found");
      };
    };
  };

  public shared ({ caller }) func suspendCustomer(customer : Principal) : async () {
    if (not isSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only super admins can suspend customers");
    };

    switch (userProfiles.get(customer)) {
      case (?profile) {
        if (profile.role != #customer) {
          Runtime.trap("Can only suspend customers");
        };
        let updatedProfile : UserProfile = {
          fullName = profile.fullName;
          phoneNumber = profile.phoneNumber;
          email = profile.email;
          dateOfBirth = profile.dateOfBirth;
          nationality = profile.nationality;
          stateOfResidence = profile.stateOfResidence;
          role = profile.role;
          isSuspended = true;
          acceptedCustomerTerms = profile.acceptedCustomerTerms;
          acceptedStoreOwnerTerms = profile.acceptedStoreOwnerTerms;
        };
        userProfiles.add(customer, updatedProfile);
      };
      case (null) {
        Runtime.trap("Customer not found");
      };
    };
  };

  public shared ({ caller }) func unsuspendCustomer(customer : Principal) : async () {
    if (not isSuperAdmin(caller)) {
      Runtime.trap("Unauthorized: Only super admins can unsuspend customers");
    };

    switch (userProfiles.get(customer)) {
      case (?profile) {
        let updatedProfile : UserProfile = {
          fullName = profile.fullName;
          phoneNumber = profile.phoneNumber;
          email = profile.email;
          dateOfBirth = profile.dateOfBirth;
          nationality = profile.nationality;
          stateOfResidence = profile.stateOfResidence;
          role = profile.role;
          isSuspended = false;
          acceptedCustomerTerms = profile.acceptedCustomerTerms;
          acceptedStoreOwnerTerms = profile.acceptedStoreOwnerTerms;
        };
        userProfiles.add(customer, updatedProfile);
      };
      case (null) {
        Runtime.trap("Customer not found");
      };
    };
  };
};

