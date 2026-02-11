import Map "mo:core/Map";
import List "mo:core/List";
import Storage "blob-storage/Storage";

module {
  type StoreId = Text;
  type ProductId = Text;

  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
    stores : Map.Map<StoreId, Store>;
    products : Map.Map<ProductId, Product>;
    orders : List.List<Order>;
    termsContent : Map.Map<{ #customerTerms; #storeOwnerTerms; #privacyPolicy }, Text>;
    reviews : List.List<Review>;
    superAdminBootstrapped : Bool;
    nextOrderId : Nat;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
    stores : Map.Map<StoreId, Store>;
    products : Map.Map<ProductId, Product>;
    orders : List.List<Order>;
    termsContent : Map.Map<{ #customerTerms; #storeOwnerTerms; #privacyPolicy }, Text>;
    reviews : List.List<Review>;
    superAdminBootstrapped : Bool;
    nextOrderId : Nat;
    nextUserId : Nat;
  };

  type OldUserProfile = {
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

  type NewUserProfile = {
    userId : Text;
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

  type UserRole = {
    #customer;
    #storeOwner;
    #superAdmin;
  };

  public func run(old : OldActor) : NewActor {
    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_principal, oldUserProfile) {
        {
          oldUserProfile with userId = "unknown";
        };
      }
    );
    { old with userProfiles = newUserProfiles; nextUserId = 1 };
  };
};
