import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  type StoreId = Text;
  type ProductId = Text;

  type OldUserProfile = {
    name : Text;
    role : { #customer; #storeOwner; #superAdmin };
    isSuspended : Bool;
  };

  type OldStore = {
    id : StoreId;
    name : Text;
    category : Text;
    location : Text;
    mobileMoneyNumber : Text;
    owner : Principal;
    isBlocked : Bool;
  };

  type OldProduct = {
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

  type OldOrder = {
    id : Nat;
    storeId : StoreId;
    customer : Principal;
    items : [(ProductId, Nat)];
    tableNumber : ?Nat;
    specialNote : ?Text;
    paymentMethod : { #cash; #mobileMoney };
    status : { #pending; #inProgress; #onTheWay; #completed };
  };

  type OldReview = {
    storeId : StoreId;
    customer : Principal;
    rating : Nat;
    text : ?Text;
    timestamp : Nat;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
    stores : Map.Map<StoreId, OldStore>;
    products : Map.Map<ProductId, OldProduct>;
    orders : List.List<OldOrder>;
    reviews : List.List<OldReview>;
  };

  type NewUserRole = {
    #customer;
    #storeOwner;
    #superAdmin;
  };

  type NewUserProfile = {
    fullName : Text;
    phoneNumber : Text;
    email : Text;
    dateOfBirth : Text;
    nationality : Text;
    stateOfResidence : Text;
    role : NewUserRole;
    isSuspended : Bool;
    acceptedCustomerTerms : Bool;
    acceptedStoreOwnerTerms : Bool;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
    stores : Map.Map<StoreId, OldStore>;
    products : Map.Map<ProductId, OldProduct>;
    orders : List.List<OldOrder>;
    reviews : List.List<OldReview>;
    termsContent : Map.Map<{ #customerTerms; #storeOwnerTerms }, Text>;
  };

  public func run(old : OldActor) : NewActor {
    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_principal, oldProfile) {
        {
          fullName = oldProfile.name;
          phoneNumber = "";
          email = "";
          dateOfBirth = "";
          nationality = "";
          stateOfResidence = "";
          role = oldProfile.role;
          isSuspended = oldProfile.isSuspended;
          acceptedCustomerTerms = false;
          acceptedStoreOwnerTerms = false;
        };
      }
    );

    {
      userProfiles = newUserProfiles;
      stores = old.stores;
      products = old.products;
      orders = old.orders;
      reviews = old.reviews;
      termsContent = Map.empty<{ #customerTerms; #storeOwnerTerms }, Text>();
    };
  };
};

