import { create } from "zustand";

const useCartStore = create((set) => ({
  cart: [],

  // 메뉴 담기 (이미 있으면 수량 +1)
  addToCart: (menu) =>
    set((state) => {
      const existing = state.cart.find((item) => item.id === menu.id);
      if (existing) {
        return {
          cart: state.cart.map((item) =>
            item.id === menu.id ? { ...item, count: item.count + 1 } : item
          ),
        };
      }
      return { cart: [...state.cart, { ...menu, count: 1 }] };
    }),

  // 수량 감소 (0이 되면 삭제)
  removeFromCart: (menuId) =>
    set((state) => ({
      cart: state.cart
        .map((item) =>
          item.id === menuId ? { ...item, count: item.count - 1 } : item
        )
        .filter((item) => item.count > 0),
    })),

  clearCart: () => set({ cart: [] }),
}));

export default useCartStore;
