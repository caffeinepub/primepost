import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Product {
    id: ProductId;
    marketplace: boolean;
    stockQty: bigint;
    storeId: StoreId;
    name: string;
    outOfStock: boolean;
    imageRef: ExternalBlob;
    discount?: bigint;
    price: bigint;
}
export interface UserProfile {
    acceptedStoreOwnerTerms: boolean;
    dateOfBirth: string;
    userId: string;
    role: UserRole;
    stateOfResidence: string;
    fullName: string;
    nationality: string;
    email: string;
    isSuspended: boolean;
    acceptedCustomerTerms: boolean;
    phoneNumber: string;
}
export interface Order {
    id: bigint;
    status: Variant_pending_completed_onTheWay_inProgress;
    paymentMethod: Variant_mobileMoney_cash;
    customer: Principal;
    storeId: StoreId;
    tableNumber?: bigint;
    specialNote?: string;
    items: Array<[ProductId, bigint]>;
}
export type StoreId = string;
export type ProductId = string;
export interface Store {
    id: StoreId;
    mobileMoneyNumber: string;
    owner: Principal;
    isBlocked: boolean;
    name: string;
    category: string;
    location: string;
}
export interface Review {
    customer: Principal;
    storeId: StoreId;
    text?: string;
    timestamp: bigint;
    rating: bigint;
}
export enum TermsType {
    storeOwnerTerms = "storeOwnerTerms",
    privacyPolicy = "privacyPolicy",
    customerTerms = "customerTerms"
}
export enum UserRole {
    customer = "customer",
    storeOwner = "storeOwner",
    superAdmin = "superAdmin"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_mobileMoney_cash {
    mobileMoney = "mobileMoney",
    cash = "cash"
}
export enum Variant_pending_completed_onTheWay_inProgress {
    pending = "pending",
    completed = "completed",
    onTheWay = "onTheWay",
    inProgress = "inProgress"
}
export interface backendInterface {
    acceptTerms(arg0: {
        termsType: TermsType;
    }): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    blockStore(storeId: StoreId): Promise<void>;
    bootstrapSuperAdmin(): Promise<void>;
    clearSuperAdminBootstrapState(): Promise<void>;
    createProduct(storeId: StoreId, name: string, imageRef: ExternalBlob, price: bigint, stockQty: bigint): Promise<ProductId>;
    createStore(name: string, category: string, location: string, mobileMoneyNumber: string): Promise<StoreId>;
    deleteProduct(id: ProductId): Promise<void>;
    factoryReset(): Promise<void>;
    getAllCustomers(): Promise<Array<Principal>>;
    getAllOrders(): Promise<Array<Order>>;
    getAllStores(): Promise<Array<Store>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getMarketplaceProducts(): Promise<Array<Product>>;
    getMyOrders(): Promise<Array<Order>>;
    getMyStores(): Promise<Array<Store>>;
    getStore(id: StoreId): Promise<Store | null>;
    getStoreOrders(storeId: StoreId): Promise<Array<Order>>;
    getStoreProducts(storeId: StoreId): Promise<Array<Product>>;
    getStoreReviews(storeId: StoreId): Promise<Array<Review>>;
    getSuperAdminBootstrapped(): Promise<boolean>;
    getTermsContent(termsType: TermsType): Promise<string | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasAcceptedTerms(arg0: {
        termsType: TermsType;
    }): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(storeId: StoreId, items: Array<[ProductId, bigint]>, tableNumber: bigint | null, specialNote: string | null, paymentMethod: Variant_mobileMoney_cash): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveTermsContent(termsType: TermsType, content: string): Promise<void>;
    submitReview(storeId: StoreId, rating: bigint, text: string | null): Promise<void>;
    suspendCustomer(customer: Principal): Promise<void>;
    unblockStore(storeId: StoreId): Promise<void>;
    unsuspendCustomer(customer: Principal): Promise<void>;
    updateOrderStatus(orderId: bigint, status: Variant_pending_completed_onTheWay_inProgress): Promise<void>;
    updateProduct(id: ProductId, name: string, imageRef: ExternalBlob, price: bigint, stockQty: bigint, discount: bigint | null, marketplace: boolean): Promise<void>;
    updateStore(id: StoreId, name: string, category: string, location: string, mobileMoneyNumber: string): Promise<void>;
}
