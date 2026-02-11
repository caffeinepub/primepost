import Map "mo:core/Map";

module {
  type OldTermsType = { #customerTerms; #storeOwnerTerms };
  type OldActor = { termsContent : Map.Map<OldTermsType, Text> };
  type NewActor = { termsContent : Map.Map<{ #customerTerms; #storeOwnerTerms; #privacyPolicy }, Text> };

  public func run(old : OldActor) : NewActor {
    { termsContent = Map.empty<{ #customerTerms; #storeOwnerTerms; #privacyPolicy }, Text>() };
  };
};
