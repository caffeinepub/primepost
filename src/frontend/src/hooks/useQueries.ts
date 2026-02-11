import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Store, Product, Order, Review, StoreId, ProductId, UserRole, Variant_mobileMoney_cash, Variant_pending_completed_onTheWay_inProgress, TermsType } from '../backend';
import { ExternalBlob } from '../backend';
import { Principal } from '@dfinity/principal';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useBootstrapSuperAdmin() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.bootstrapSuperAdmin();
    },
  });
}

export function useGetTermsContent(termsType: TermsType) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string | null>({
    queryKey: ['termsContent', termsType],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getTermsContent(termsType);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSaveTermsContent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ termsType, content }: { termsType: TermsType; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveTermsContent(termsType, content);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['termsContent', variables.termsType] });
    },
  });
}

export function useHasAcceptedTerms(termsType: TermsType) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['hasAcceptedTerms', termsType],
    queryFn: async () => {
      if (!actor) return false;
      return actor.hasAcceptedTerms({ termsType });
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useAcceptTerms() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ termsType }: { termsType: TermsType }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.acceptTerms({ termsType });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['hasAcceptedTerms', variables.termsType] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetStore(storeId: StoreId | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Store | null>({
    queryKey: ['store', storeId],
    queryFn: async () => {
      if (!actor || !storeId) return null;
      return actor.getStore(storeId);
    },
    enabled: !!actor && !actorFetching && !!storeId,
  });
}

export function useGetAllStores() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Store[]>({
    queryKey: ['allStores'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStores();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetMyStores() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Store[]>({
    queryKey: ['myStores'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyStores();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateStore() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; category: string; location: string; mobileMoneyNumber: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createStore(data.name, data.category, data.location, data.mobileMoneyNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myStores'] });
    },
  });
}

export function useUpdateStore() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: StoreId; name: string; category: string; location: string; mobileMoneyNumber: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateStore(data.id, data.name, data.category, data.location, data.mobileMoneyNumber);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['store', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['myStores'] });
    },
  });
}

export function useGetStoreProducts(storeId: StoreId | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['storeProducts', storeId],
    queryFn: async () => {
      if (!actor || !storeId) return [];
      return actor.getStoreProducts(storeId);
    },
    enabled: !!actor && !actorFetching && !!storeId,
  });
}

export function useCreateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { storeId: StoreId; name: string; imageRef: ExternalBlob; price: bigint; stockQty: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createProduct(data.storeId, data.name, data.imageRef, data.price, data.stockQty);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['storeProducts', variables.storeId] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: ProductId; storeId: StoreId; name: string; imageRef: ExternalBlob; price: bigint; stockQty: bigint; discount: bigint | null; marketplace: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProduct(data.id, data.name, data.imageRef, data.price, data.stockQty, data.discount, data.marketplace);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['storeProducts', variables.storeId] });
      queryClient.invalidateQueries({ queryKey: ['marketplaceProducts'] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: ProductId; storeId: StoreId }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteProduct(data.id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['storeProducts', variables.storeId] });
    },
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { storeId: StoreId; items: [ProductId, bigint][]; tableNumber: bigint | null; specialNote: string | null; paymentMethod: Variant_mobileMoney_cash }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.placeOrder(data.storeId, data.items, data.tableNumber, data.specialNote, data.paymentMethod);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
    },
  });
}

export function useGetMyOrders() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['myOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyOrders();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetStoreOrders(storeId: StoreId | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['storeOrders', storeId],
    queryFn: async () => {
      if (!actor || !storeId) return [];
      return actor.getStoreOrders(storeId);
    },
    enabled: !!actor && !actorFetching && !!storeId,
    refetchInterval: 5000,
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { orderId: bigint; storeId: StoreId; status: Variant_pending_completed_onTheWay_inProgress }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateOrderStatus(data.orderId, data.status);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['storeOrders', variables.storeId] });
    },
  });
}

export function useSubmitReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { storeId: StoreId; rating: bigint; text: string | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitReview(data.storeId, data.rating, data.text);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['storeReviews', variables.storeId] });
    },
  });
}

export function useGetStoreReviews(storeId: StoreId | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Review[]>({
    queryKey: ['storeReviews', storeId],
    queryFn: async () => {
      if (!actor || !storeId) return [];
      return actor.getStoreReviews(storeId);
    },
    enabled: !!actor && !actorFetching && !!storeId,
  });
}

export function useGetMarketplaceProducts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['marketplaceProducts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMarketplaceProducts();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllCustomers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['allCustomers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCustomers();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllOrders() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['allOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useBlockStore() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storeId: StoreId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.blockStore(storeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allStores'] });
    },
  });
}

export function useUnblockStore() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storeId: StoreId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unblockStore(storeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allStores'] });
    },
  });
}
