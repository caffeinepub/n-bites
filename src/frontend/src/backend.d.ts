import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Cart {
    items: Array<CartItem>;
}
export interface CartItem {
    productId: bigint;
    quantity: bigint;
}
export interface Product {
    name: string;
    description: string;
    category: string;
    price: bigint;
}
export interface backendInterface {
    addProduct(name: string, description: string, price: bigint, category: string): Promise<bigint>;
    addToCart(productId: bigint, quantity: bigint): Promise<void>;
    getCart(): Promise<Cart>;
    getProduct(id: bigint): Promise<Product>;
    getProductsByCategory(category: string): Promise<Array<Product>>;
    getProductsByPrice(): Promise<Array<Product>>;
    isSubscribed(email: string): Promise<boolean>;
    placeOrder(name: string, email: string): Promise<bigint>;
    subscribe(email: string): Promise<void>;
}
