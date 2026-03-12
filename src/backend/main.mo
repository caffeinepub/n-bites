import Text "mo:core/Text";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Order "mo:core/Order";

actor {
  public type Product = {
    name : Text;
    description : Text;
    price : Nat;
    category : Text;
  };

  public type CartItem = {
    productId : Nat;
    quantity : Nat;
  };

  public type Cart = {
    items : [CartItem];
  };

  public type Order = {
    id : Nat;
    customerName : Text;
    customerEmail : Text;
    items : [CartItem];
    totalPrice : Nat;
  };

  var nextProductId = 0;
  var nextOrderId = 0;
  let products = Map.empty<Nat, Product>();
  var newsletter : [Text] = [];
  var cart : [CartItem] = [];
  
  module CartItem {
    public func compareByProductId(a : CartItem, b : CartItem) : Order.Order {
      Nat.compare(a.productId, b.productId);
    };
  };

  module Product {
    public func compareByPrice(a : Product, b : Product) : Order.Order {
      Nat.compare(a.price, b.price);
    };
  };

  // Newsletter
  public shared ({ caller }) func subscribe(email : Text) : async () {
    if (newsletter.values().contains(email)) { Runtime.trap("Already subscribed") };
    newsletter := newsletter.concat([email]);
  };

  public query ({ caller }) func isSubscribed(email : Text) : async Bool {
    newsletter.values().contains(email);
  };

  // Products
  public shared ({ caller }) func addProduct(name : Text, description : Text, price : Nat, category : Text) : async Nat {
    let id = nextProductId;
    products.add(id, { name; description; price; category });
    nextProductId += 1;
    id;
  };

  public query ({ caller }) func getProduct(id : Nat) : async Product {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  public query ({ caller }) func getProductsByCategory(category : Text) : async [Product] {
    products.values().toArray().filter(func(p) { p.category == category });
  };

  public query ({ caller }) func getProductsByPrice() : async [Product] {
    products.values().toArray().sort(Product.compareByPrice);
  };

  // Cart
  public shared ({ caller }) func addToCart(productId : Nat, quantity : Nat) : async () {
    if (quantity == 0) { Runtime.trap("Quantity cannot be 0") };
    let current = cart.find(func(item) { item.productId == productId });
    switch (current) {
      case (?_) { Runtime.trap("Product already in cart, adjust quantity instead") };
      case (null) {
        cart := cart.concat([{ productId; quantity }]);
      };
    };
  };

  public query ({ caller }) func getCart() : async Cart {
    { items = cart.sort(CartItem.compareByProductId) };
  };

  public shared ({ caller }) func placeOrder(name : Text, email : Text) : async Nat {
    if (cart.size() == 0) { Runtime.trap("Cart is empty") };

    var totalPrice = 0;
    for (item in cart.values()) {
      let product = switch (products.get(item.productId)) {
        case (null) { Runtime.trap("Product not found in cart") };
        case (?product) { product };
      };
      totalPrice += product.price * item.quantity;
    };

    let order : Order = {
      id = nextOrderId;
      customerName = name;
      customerEmail = email;
      items = cart;
      totalPrice;
    };

    cart := [];
    nextOrderId += 1;
    order.id;
  };
};
