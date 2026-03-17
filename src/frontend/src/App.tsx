import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";
import {
  CheckCircle,
  Globe,
  Leaf,
  Menu,
  Minus,
  Moon,
  Package,
  PawPrint,
  Plus,
  Recycle,
  ShoppingCart,
  Sprout,
  Star,
  Sun,
  Trash2,
  TreePine,
  Users,
  X,
  Zap,
} from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { SiInstagram, SiTiktok, SiX } from "react-icons/si";
import { toast } from "sonner";
import { useSubscribeNewsletter } from "./hooks/useQueries";

// ── Types ────────────────────────────────────────────────────────────────────
interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  priceNum: number;
  image: string;
  tag: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  image: string;
}

interface CartState {
  items: CartItem[];
  drawerOpen: boolean;
}

type CartAction =
  | { type: "ADD"; item: CartItem }
  | { type: "REMOVE"; id: string }
  | { type: "UPDATE_QTY"; id: string; qty: number }
  | { type: "CLEAR" }
  | { type: "SET_DRAWER"; open: boolean };

interface CartContextValue {
  state: CartState;
  addToCart: (item: Omit<CartItem, "qty">) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  totalItems: number;
  subtotal: number;
}

// ── Cart Reducer ──────────────────────────────────────────────────────────────
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const exists = state.items.find((i) => i.id === action.item.id);
      if (exists) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i,
          ),
        };
      }
      return { ...state, items: [...state.items, { ...action.item, qty: 1 }] };
    }
    case "REMOVE":
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case "UPDATE_QTY":
      if (action.qty <= 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.id !== action.id),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, qty: action.qty } : i,
        ),
      };
    case "CLEAR":
      return { ...state, items: [] };
    case "SET_DRAWER":
      return { ...state, drawerOpen: action.open };
    default:
      return state;
  }
}

// ── Cart Context ──────────────────────────────────────────────────────────────
const CartContext = createContext<CartContextValue | null>(null);

function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    drawerOpen: false,
  });

  const addToCart = useCallback((item: Omit<CartItem, "qty">) => {
    dispatch({ type: "ADD", item: { ...item, qty: 1 } });
  }, []);
  const removeFromCart = useCallback((id: string) => {
    dispatch({ type: "REMOVE", id });
  }, []);
  const updateQty = useCallback((id: string, qty: number) => {
    dispatch({ type: "UPDATE_QTY", id, qty });
  }, []);
  const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);
  const openDrawer = useCallback(
    () => dispatch({ type: "SET_DRAWER", open: true }),
    [],
  );
  const closeDrawer = useCallback(
    () => dispatch({ type: "SET_DRAWER", open: false }),
    [],
  );

  const totalItems = state.items.reduce((s, i) => s + i.qty, 0);
  const subtotal = state.items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        state,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        openDrawer,
        closeDrawer,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}

// ── Data ─────────────────────────────────────────────────────────────────────
const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Roasted Chili Chickpea Bites",
    description: "Bold, spicy, and packed with plant protein.",
    price: "$4.99",
    priceNum: 4.99,
    image: "/assets/generated/product-chickpea.dim_400x400.jpg",
    tag: "Best Seller",
  },
  {
    id: 2,
    name: "Sea Salt Crunch Bites",
    description: "Light, crispy, and perfectly salted.",
    price: "$3.99",
    priceNum: 3.99,
    image: "/assets/generated/product-crisps.dim_400x400.jpg",
    tag: "New",
  },
  {
    id: 3,
    name: "Smoky BBQ Protein Bites",
    description: "Smoky flavor with a protein punch.",
    price: "$5.49",
    priceNum: 5.49,
    image: "/assets/generated/product-bbq.dim_400x400.jpg",
    tag: "High Protein",
  },
  {
    id: 4,
    name: "Lemon Herb Veggie Crisps",
    description: "Zesty, fresh, and guilt-free crunch.",
    price: "$4.49",
    priceNum: 4.49,
    image: "/assets/generated/product-lemon.dim_400x400.jpg",
    tag: "Light",
  },
];

const TESTIMONIALS = [
  {
    text: "Finally a healthy snack that actually tastes amazing.",
    author: "Sarah",
    location: "Bangalore",
  },
  {
    text: "I love that I can snack guilt-free and it actually fills me up!",
    author: "Arjun",
    location: "Mumbai",
  },
  {
    text: "The chili chickpea bites are absolutely addictive. Can't stop!",
    author: "Priya",
    location: "Delhi",
  },
];

const SUSTAINABILITY = [
  {
    icon: <Sprout className="w-8 h-8" />,
    title: "Plant-Based Ingredients",
    description:
      "100% plant-derived, whole-food ingredients crafted with care.",
  },
  {
    icon: <PawPrint className="w-8 h-8" />,
    title: "Cruelty-Free Production",
    description: "No animal testing, no animal by-products. Ever.",
  },
  {
    icon: <Recycle className="w-8 h-8" />,
    title: "Sustainable Sourcing",
    description: "Responsibly sourced ingredients from ethical farms.",
  },
  {
    icon: <Globe className="w-8 h-8" />,
    title: "Future Compostable Packaging",
    description: "Transitioning to 100% compostable packaging by 2026.",
  },
];

const LIFESTYLE = [
  {
    icon: <Users className="w-10 h-10" />,
    label: "Friends Snacking",
    bg: "from-green-400 to-emerald-600",
  },
  {
    icon: <TreePine className="w-10 h-10" />,
    label: "Outdoor Picnic",
    bg: "from-lime-400 to-green-500",
  },
  {
    icon: <Zap className="w-10 h-10" />,
    label: "Gym Fuel",
    bg: "from-orange-400 to-amber-500",
  },
  {
    icon: <Leaf className="w-10 h-10" />,
    label: "Healthy Living",
    bg: "from-teal-400 to-cyan-500",
  },
];

// ── Hooks ─────────────────────────────────────────────────────────────────────
function useDarkMode() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("nubites-theme");
    return stored
      ? stored === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }
    localStorage.setItem("nubites-theme", dark ? "dark" : "light");
  }, [dark]);

  return [dark, setDark] as const;
}

function useScrollReveal() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        }
      },
      { threshold: 0.12 },
    );

    const elements = document.querySelectorAll(".reveal");
    for (const el of elements) {
      observerRef.current?.observe(el);
    }

    return () => observerRef.current?.disconnect();
  }, []);
}

// ── Sub-components ────────────────────────────────────────────────────────────
function StarRating({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].slice(0, count).map((n) => (
        <Star key={n} className="w-4 h-4 fill-current star-filled" />
      ))}
    </div>
  );
}

function EcoBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm border border-white/30 text-white animate-badge-pulse">
      <Leaf className="w-3 h-3" />
      {label}
    </span>
  );
}

// ── Cart Drawer ───────────────────────────────────────────────────────────────
function CartDrawer() {
  const {
    state,
    removeFromCart,
    updateQty,
    openDrawer: _open,
    closeDrawer,
    subtotal,
    totalItems,
  } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <>
      <Sheet
        open={state.drawerOpen}
        onOpenChange={(o) => (o ? _open() : closeDrawer())}
      >
        <SheetContent
          data-ocid="cart.sheet"
          side="right"
          className="w-full sm:max-w-md flex flex-col p-0"
        >
          <SheetHeader className="px-6 py-5 border-b border-border">
            <SheetTitle className="font-display font-bold text-xl flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Your Cart
              {totalItems > 0 && (
                <Badge className="bg-brand-orange text-white border-0 ml-1">
                  {totalItems}
                </Badge>
              )}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {state.items.length === 0 ? (
              <div
                data-ocid="cart.empty_state"
                className="flex flex-col items-center justify-center h-48 text-center"
              >
                <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground font-semibold">
                  Your cart is empty
                </p>
                <p className="text-muted-foreground/60 text-sm mt-1">
                  Add some plant-powered snacks!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {state.items.map((item, idx) => (
                  <div
                    key={item.id}
                    data-ocid={`cart.item.${idx + 1}`}
                    className="flex gap-3 bg-muted/40 rounded-2xl p-3"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-sm text-foreground leading-snug mb-1 truncate">
                        {item.name}
                      </p>
                      <p className="text-primary font-bold text-sm">
                        ${(item.price * item.qty).toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          data-ocid={`cart.item.${idx + 1}`}
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          className="w-6 h-6 rounded-full bg-border flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                          aria-label="Decrease"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-bold w-5 text-center">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          className="w-6 h-6 rounded-full bg-border flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                          aria-label="Increase"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      data-ocid={`cart.delete_button.${idx + 1}`}
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground flex-shrink-0"
                      aria-label="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {state.items.length > 0 && (
            <div className="px-6 py-5 border-t border-border space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">
                  Subtotal
                </span>
                <span className="font-display font-extrabold text-xl text-foreground">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <Button
                data-ocid="cart.primary_button"
                onClick={() => {
                  closeDrawer();
                  setCheckoutOpen(true);
                }}
                className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-bold rounded-full py-6 text-base shadow-orange transition-all hover:shadow-xl hover:-translate-y-0.5"
              >
                Proceed to Checkout →
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </>
  );
}

// ── Checkout Modal ────────────────────────────────────────────────────────────
interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface PaymentInfo {
  cardNumber: string;
  expiry: string;
  cvv: string;
}

function CheckoutModal({
  open,
  onClose,
}: { open: boolean; onClose: () => void }) {
  const { state, subtotal, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [orderNumber] = useState(
    () => `NB-${Math.floor(Math.random() * 90000) + 10000}`,
  );
  const [shipping, setShipping] = useState<ShippingInfo>({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
  });
  const [payment, setPayment] = useState<PaymentInfo>({
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const SHIPPING_COST = 5.99;
  const total = subtotal + SHIPPING_COST;

  const handleClose = () => {
    onClose();
    setTimeout(() => setStep(1), 300);
  };

  const handlePlaceOrder = () => {
    setStep(4);
    clearCart();
  };

  const stepLabels = ["Review", "Shipping", "Payment", "Confirmed"];
  const progressPct = ((step - 1) / 3) * 100;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        data-ocid="checkout.dialog"
        className="sm:max-w-lg rounded-3xl max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader className="pb-2">
          <DialogTitle className="font-display font-bold text-xl">
            {step < 4 ? "Checkout" : "Order Confirmed! 🎉"}
          </DialogTitle>
        </DialogHeader>

        {/* Progress */}
        {step < 4 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs font-semibold mb-2">
              {stepLabels.slice(0, 3).map((l, i) => (
                <span
                  key={l}
                  className={
                    i + 1 <= step ? "text-primary" : "text-muted-foreground"
                  }
                >
                  {i + 1}. {l}
                </span>
              ))}
            </div>
            <Progress
              data-ocid="checkout.loading_state"
              value={progressPct}
              className="h-2 rounded-full"
            />
          </div>
        )}

        {/* Step 1: Order Review */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {state.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.qty}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-primary">
                    ${(item.price * item.qty).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>${SHIPPING_COST.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-display font-extrabold text-base text-foreground pt-1">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
            <Button
              data-ocid="checkout.primary_button"
              onClick={() => setStep(2)}
              className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-bold rounded-full py-6"
            >
              Continue to Shipping →
            </Button>
          </div>
        )}

        {/* Step 2: Shipping Info */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="firstName" className="text-xs font-semibold">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  data-ocid="checkout.input"
                  value={shipping.firstName}
                  onChange={(e) =>
                    setShipping((s) => ({ ...s, firstName: e.target.value }))
                  }
                  placeholder="Jane"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName" className="text-xs font-semibold">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={shipping.lastName}
                  onChange={(e) =>
                    setShipping((s) => ({ ...s, lastName: e.target.value }))
                  }
                  placeholder="Doe"
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs font-semibold">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={shipping.email}
                onChange={(e) =>
                  setShipping((s) => ({ ...s, email: e.target.value }))
                }
                placeholder="jane@example.com"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="address" className="text-xs font-semibold">
                Address
              </Label>
              <Input
                id="address"
                value={shipping.address}
                onChange={(e) =>
                  setShipping((s) => ({ ...s, address: e.target.value }))
                }
                placeholder="123 Green St"
                className="rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="city" className="text-xs font-semibold">
                  City
                </Label>
                <Input
                  id="city"
                  value={shipping.city}
                  onChange={(e) =>
                    setShipping((s) => ({ ...s, city: e.target.value }))
                  }
                  placeholder="Mumbai"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="state" className="text-xs font-semibold">
                  State
                </Label>
                <Input
                  id="state"
                  value={shipping.state}
                  onChange={(e) =>
                    setShipping((s) => ({ ...s, state: e.target.value }))
                  }
                  placeholder="MH"
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="zip" className="text-xs font-semibold">
                  ZIP Code
                </Label>
                <Input
                  id="zip"
                  value={shipping.zip}
                  onChange={(e) =>
                    setShipping((s) => ({ ...s, zip: e.target.value }))
                  }
                  placeholder="400001"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="country" className="text-xs font-semibold">
                  Country
                </Label>
                <Input
                  id="country"
                  value={shipping.country}
                  onChange={(e) =>
                    setShipping((s) => ({ ...s, country: e.target.value }))
                  }
                  placeholder="India"
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                data-ocid="checkout.cancel_button"
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1 rounded-full"
              >
                ← Back
              </Button>
              <Button
                data-ocid="checkout.primary_button"
                onClick={() => setStep(3)}
                className="flex-1 bg-brand-orange hover:bg-brand-orange/90 text-white font-bold rounded-full"
              >
                Payment →
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Payment Info */}
        {step === 3 && (
          <div className="space-y-4">
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold"
              style={{ background: "rgba(46,204,113,0.1)", color: "#27AE60" }}
            >
              <CheckCircle className="w-4 h-4" />
              Secure checkout — demo mode, no real charges
            </div>
            <div className="space-y-1">
              <Label htmlFor="cardNumber" className="text-xs font-semibold">
                Card Number
              </Label>
              <Input
                id="cardNumber"
                data-ocid="checkout.input"
                value={payment.cardNumber}
                onChange={(e) =>
                  setPayment((p) => ({ ...p, cardNumber: e.target.value }))
                }
                placeholder="4242 4242 4242 4242"
                maxLength={19}
                className="rounded-xl font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="expiry" className="text-xs font-semibold">
                  Expiry
                </Label>
                <Input
                  id="expiry"
                  value={payment.expiry}
                  onChange={(e) =>
                    setPayment((p) => ({ ...p, expiry: e.target.value }))
                  }
                  placeholder="MM / YY"
                  maxLength={7}
                  className="rounded-xl font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cvv" className="text-xs font-semibold">
                  CVV
                </Label>
                <Input
                  id="cvv"
                  value={payment.cvv}
                  onChange={(e) =>
                    setPayment((p) => ({ ...p, cvv: e.target.value }))
                  }
                  placeholder="123"
                  maxLength={4}
                  className="rounded-xl font-mono"
                />
              </div>
            </div>
            <Separator />
            <div className="flex justify-between font-display font-extrabold text-base text-foreground">
              <span>Total Due</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                data-ocid="checkout.cancel_button"
                variant="outline"
                onClick={() => setStep(2)}
                className="flex-1 rounded-full"
              >
                ← Back
              </Button>
              <Button
                data-ocid="checkout.confirm_button"
                onClick={handlePlaceOrder}
                className="flex-1 bg-brand-orange hover:bg-brand-orange/90 text-white font-bold rounded-full"
              >
                Place Order 🌱
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div
            data-ocid="checkout.success_state"
            className="text-center py-6 space-y-4"
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto text-white text-4xl"
              style={{
                background: "linear-gradient(135deg, #2ECC71, #27AE60)",
              }}
            >
              🎉
            </div>
            <h3 className="font-display font-extrabold text-2xl text-foreground">
              Thank you for your order!
            </h3>
            <p className="text-muted-foreground">
              Your plant-powered snacks are on their way. 🌱
            </p>
            <div
              className="inline-block px-5 py-3 rounded-2xl font-mono font-bold text-sm"
              style={{ background: "rgba(46,204,113,0.1)", color: "#27AE60" }}
            >
              Order #{orderNumber}
            </div>
            <Button
              data-ocid="checkout.close_button"
              onClick={handleClose}
              className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-bold rounded-full py-6 mt-2"
            >
              Continue Shopping
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({
  dark,
  toggleDark,
}: {
  dark: boolean;
  toggleDark: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { openDrawer, totalItems } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Products", href: "#products" },
    { label: "Packaging", href: "#packaging" },
    { label: "Sustainability", href: "#sustainability" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "nav-glass shadow-sm" : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-2 flex-shrink-0">
            <img
              src="/assets/uploads/Screenshot-2026-02-16-113800-1.png"
              alt="NÚBITES"
              className="h-10 w-auto object-contain"
            />
          </a>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                data-ocid={`nav.link.${i + 1}`}
                className="text-sm font-semibold text-foreground/80 hover:text-primary transition-colors duration-200 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 rounded-full" />
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleDark}
              data-ocid="nav.toggle"
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              className="p-2 rounded-full hover:bg-muted transition-colors duration-200 text-foreground/70 hover:text-foreground"
            >
              {dark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Cart button with badge */}
            <button
              type="button"
              data-ocid="nav.open_modal_button"
              onClick={openDrawer}
              aria-label={`Open cart (${totalItems} items)`}
              className="relative p-2 rounded-full hover:bg-muted transition-colors duration-200 text-foreground/70 hover:text-foreground"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-orange text-white text-xs font-bold flex items-center justify-center">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </button>

            <a href="#products" className="hidden sm:block">
              <Button
                data-ocid="nav.primary_button"
                className="bg-brand-orange hover:bg-brand-orange/90 text-white font-bold px-5 py-2 rounded-full shadow-orange transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                Shop Now
              </Button>
            </a>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="lg:hidden p-2 rounded-md text-foreground/70 hover:text-foreground"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <div className="lg:hidden pb-4 border-t border-border/50 mt-1">
            <div className="flex flex-col gap-1 pt-3">
              {navLinks.map((link, i) => (
                <a
                  key={link.href}
                  href={link.href}
                  data-ocid={`nav.link.${i + 1}`}
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-2 text-sm font-semibold rounded-lg hover:bg-muted transition-colors text-foreground/80 hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
              <Button
                onClick={() => {
                  setMenuOpen(false);
                  window.location.hash = "#products";
                }}
                className="mt-2 w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-bold rounded-full"
              >
                Shop Now
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

// ── Hero Section ──────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden bg-brand-cream dark:bg-background"
    >
      {/* Animated blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-30 animate-blob"
          style={{ background: "radial-gradient(circle, #2ECC71, #27AE60)" }}
        />
        <div
          className="absolute top-1/4 -right-20 w-80 h-80 rounded-full opacity-25 animate-blob-delay"
          style={{ background: "radial-gradient(circle, #FF7A18, #FFB347)" }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full opacity-20 animate-blob-delay2"
          style={{ background: "radial-gradient(circle, #2ECC71, #FF7A18)" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-semibold text-sm mb-6 font-accent">
              <Leaf className="w-4 h-4" />
              100% Plant-Based · Cruelty-Free
            </div>

            <h1 className="font-display font-extrabold text-5xl lg:text-7xl text-foreground mb-6 leading-tight">
              Snack <span className="gradient-brand-text">Smart.</span>
              <br />
              Snack <span className="gradient-brand-text">Bold.</span>
              <br />
              <span className="text-3xl lg:text-4xl font-bold">
                Plant-Based.
              </span>
            </h1>

            <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-lg">
              NÚBITES brings together bold flavors and clean plant-based
              ingredients to create snacks that are delicious, sustainable, and
              made for modern lifestyles.
            </p>

            <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start mb-8">
              <a href="#products">
                <Button
                  data-ocid="hero.primary_button"
                  className="bg-brand-orange hover:bg-brand-orange/90 text-white font-bold px-8 py-6 rounded-full shadow-orange text-base transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Shop Now
                </Button>
              </a>
              <a href="#products">
                <Button
                  data-ocid="hero.secondary_button"
                  variant="outline"
                  className="px-8 py-6 rounded-full text-base font-bold border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all"
                >
                  Explore Flavors
                </Button>
              </a>
            </div>

            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <EcoBadge label="Vegan" />
              <EcoBadge label="Gluten-Free" />
              <EcoBadge label="No Preservatives" />
            </div>
          </div>

          {/* Hero image / mascot */}
          <div className="relative flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full opacity-20 blur-3xl"
              style={{
                background: "radial-gradient(circle, #2ECC71, #FF7A18)",
              }}
            />
            <div className="relative z-10 flex flex-col items-center">
              <img
                src="/assets/uploads/Screenshot-2026-02-16-113800-1.png"
                alt="NÚBITES Brand Logo"
                className="w-64 h-64 lg:w-80 lg:h-80 object-contain drop-shadow-2xl animate-float"
              />
              {/* Floating card */}
              <div className="mt-4 bg-white dark:bg-card rounded-2xl px-6 py-4 shadow-xl flex items-center gap-4">
                <span className="text-3xl">🌿</span>
                <div>
                  <p className="font-display font-bold text-sm text-foreground">
                    Nature, With a New Accent.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    100% Plant-Powered Snacks
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          aria-hidden="true"
          viewBox="0 0 1440 80"
          className="w-full fill-background"
        >
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </div>
    </section>
  );
}

// ── About Section ─────────────────────────────────────────────────────────────
function AboutSection() {
  return (
    <section id="about" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="reveal">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-4 font-accent">
              <Leaf className="w-4 h-4" />
              Our Story
            </div>
            <h2 className="font-display font-bold text-4xl lg:text-5xl text-foreground mb-6 leading-tight">
              A Little <span className="gradient-brand-text">About Us</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              NuBites is more than just a snack brand — it represents a fresh,
              fun, and modern way of eating. By combining bold flavors, clean
              plant-based ingredients, and a playful identity, NuBites makes
              healthy snacking exciting and accessible for everyone.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              We believe that great taste and good values can coexist on your
              snack shelf. Every bite is crafted with intention: for your body,
              for the planet, and for pure, unapologetic snacking joy.
            </p>
            <div className="grid grid-cols-3 gap-6">
              {[
                { value: "12+", label: "Flavors" },
                { value: "50K+", label: "Happy Snackers" },
                { value: "100%", label: "Plant-Based" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="text-center p-4 rounded-2xl bg-muted/50"
                >
                  <div className="font-display font-extrabold text-2xl gradient-brand-text mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground font-semibold">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="reveal reveal-delay-2 relative">
            <div
              className="absolute -inset-4 rounded-3xl opacity-30"
              style={{
                background: "linear-gradient(135deg, #2ECC71, #FF7A18)",
              }}
            />
            <div
              className="relative w-full aspect-video flex items-center justify-center rounded-3xl overflow-hidden shadow-2xl"
              style={{
                background:
                  "linear-gradient(135deg, #2ECC71 0%, #27AE60 50%, #FF7A18 100%)",
              }}
            >
              <div className="text-center text-white p-12">
                <div className="font-accent text-7xl font-bold mb-4">NÚ</div>
                <div className="font-display font-bold text-2xl mb-2">
                  BITES
                </div>
                <div className="text-base opacity-80">
                  Nature, With a New Accent.
                </div>
                <div className="flex justify-center gap-3 mt-6">
                  <EcoBadge label="Vegan" />
                  <EcoBadge label="Eco-Friendly" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Mission & Vision ──────────────────────────────────────────────────────────
function MissionVisionSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 reveal">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-4 font-accent">
            <Globe className="w-4 h-4" />
            Our Purpose
          </div>
          <h2 className="font-display font-bold text-4xl lg:text-5xl text-foreground">
            Mission &amp; <span className="gradient-brand-text">Vision</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div
            data-ocid="mission.card"
            className="reveal reveal-delay-1 bg-card rounded-3xl p-8 shadow-card card-hover border-l-4"
            style={{ borderLeftColor: "#2ECC71" }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 shadow-green"
              style={{
                background: "linear-gradient(135deg, #2ECC71, #27AE60)",
              }}
            >
              🎯
            </div>
            <h3 className="font-display font-bold text-2xl text-foreground mb-4">
              Our Mission
            </h3>
            <p className="text-muted-foreground text-base leading-relaxed">
              NÚBITES makes plant-based snacking enjoyable, accessible, and
              responsible for everyday life. We promote mindful choices that
              support personal health and the environment — one delicious bite
              at a time.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Accessible", "Responsible", "Mindful"].map((tag) => (
                <Badge
                  key={tag}
                  className="bg-primary/15 text-primary hover:bg-primary/20 border-0 font-semibold"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div
            data-ocid="vision.card"
            className="reveal reveal-delay-2 bg-card rounded-3xl p-8 shadow-card card-hover border-l-4"
            style={{ borderLeftColor: "#FF7A18" }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 shadow-orange"
              style={{
                background: "linear-gradient(135deg, #FF7A18, #FFB347)",
              }}
            >
              🌍
            </div>
            <h3 className="font-display font-bold text-2xl text-foreground mb-4">
              Our Vision
            </h3>
            <p className="text-muted-foreground text-base leading-relaxed">
              To eliminate single-use plastics from packaging and transition to
              compostable or reusable materials while reducing our carbon
              footprint through responsible sourcing and sustainable supply
              chains.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Zero Plastic", "Compostable", "Carbon-Neutral"].map((tag) => (
                <Badge
                  key={tag}
                  className="bg-accent/15 text-accent hover:bg-accent/20 border-0 font-semibold"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Products Section ──────────────────────────────────────────────────────────
function ProductsSection() {
  const { addToCart, openDrawer } = useCart();

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: String(product.id),
      name: product.name,
      price: product.priceNum,
      image: product.image,
    });
    toast.success("🛒 Added to cart!", {
      description: product.name,
      action: {
        label: "View Cart",
        onClick: openDrawer,
      },
    });
  };

  return (
    <section id="products" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 reveal">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-4 font-accent">
            <Leaf className="w-4 h-4" />
            Our Flavors
          </div>
          <h2 className="font-display font-bold text-4xl lg:text-5xl text-foreground mb-4">
            Snack the <span className="gradient-brand-text">Plant-Powered</span>{" "}
            Way
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Bold flavors, clean ingredients. Each snack crafted for taste AND
            purpose.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCTS.map((product, i) => (
            <div
              key={product.id}
              data-ocid={`products.item.${i + 1}`}
              className={`reveal reveal-delay-${i + 1} bg-card rounded-3xl overflow-hidden shadow-card card-hover group`}
            >
              <div className="relative overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-brand-orange text-white border-0 font-bold text-xs">
                    {product.tag}
                  </Badge>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-display font-bold text-base text-foreground mb-2 leading-snug">
                  {product.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-display font-extrabold text-xl text-primary">
                    {product.price}
                  </span>
                  <button
                    type="button"
                    data-ocid={`products.open_modal_button.${i + 1}`}
                    onClick={() => handleAddToCart(product)}
                    className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-full text-sm font-bold hover:bg-primary hover:text-white transition-all duration-200"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Packaging Section ─────────────────────────────────────────────────────────
function PackagingSection() {
  return (
    <section id="packaging" className="py-24 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 reveal">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-4 font-accent">
            <Package className="w-4 h-4" />
            Our Packaging
          </div>
          <h2 className="font-display font-bold text-4xl lg:text-5xl text-foreground mb-4">
            Wholesome Snack Bites —{" "}
            <span className="gradient-brand-text">Tasty. Natural. Happy.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our snacks come in eco-friendly packaging featuring our beloved
            mascots. Available in resealable bags and tube containers in
            multiple flavors.
          </p>
        </div>

        <div className="reveal reveal-delay-1">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl max-w-4xl mx-auto">
            {/* Decorative gradient border */}
            <div
              className="absolute -inset-1 rounded-3xl opacity-50"
              style={{
                background: "linear-gradient(135deg, #2ECC71, #FF7A18)",
              }}
            />
            <div className="relative rounded-3xl overflow-hidden bg-brand-cream dark:bg-card">
              <img
                src="/assets/uploads/package--2.jpeg"
                alt="NÚBITES Packaging — Wholesome Snack Bites"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Feature badges below image */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {[
              { icon: "♻️", label: "Eco-Friendly Material" },
              { icon: "🔒", label: "Resealable Bags" },
              { icon: "🌿", label: "Plant-Based Inks" },
              { icon: "📦", label: "Multiple Sizes" },
            ].map((feat) => (
              <div
                key={feat.label}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-card shadow-card border border-border font-semibold text-sm"
              >
                <span className="text-lg">{feat.icon}</span>
                <span className="text-foreground">{feat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Sustainability Section ────────────────────────────────────────────────────
function SustainabilitySection() {
  return (
    <section
      id="sustainability"
      className="py-24 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #1a6b3e 0%, #27AE60 50%, #2ECC71 100%)",
      }}
    >
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, white, transparent)" }}
      />
      <div
        className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, white, transparent)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 reveal">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white font-semibold text-sm mb-4 font-accent backdrop-blur-sm">
            <Leaf className="w-4 h-4" />
            Eco-Friendly Snacks
          </div>
          <h2 className="font-display font-bold text-4xl lg:text-5xl text-white mb-4">
            Snacking That Cares
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Every decision we make is driven by a commitment to the planet and
            future generations.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SUSTAINABILITY.map((item, i) => (
            <div
              key={item.title}
              className={`reveal reveal-delay-${i + 1} bg-white/95 dark:bg-card/95 backdrop-blur-sm rounded-3xl p-6 shadow-card card-hover text-center`}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-green"
                style={{
                  background: "linear-gradient(135deg, #2ECC71, #27AE60)",
                }}
              >
                {item.icon}
              </div>
              <h3 className="font-display font-bold text-base text-foreground mb-2">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Lifestyle Section ─────────────────────────────────────────────────────────
function LifestyleSection() {
  return (
    <section className="py-24 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 reveal">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent font-semibold text-sm mb-4 font-accent">
            <Zap className="w-4 h-4" />
            The NÚBITES Life
          </div>
          <h2 className="font-display font-bold text-4xl lg:text-5xl text-foreground">
            Fuel Your Day the{" "}
            <span className="gradient-brand-text">Plant-Powered Way</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {LIFESTYLE.map((item, i) => (
            <div
              key={item.label}
              className={`reveal reveal-delay-${i + 1} relative rounded-3xl overflow-hidden aspect-square flex flex-col items-center justify-center cursor-pointer group shadow-card card-hover bg-gradient-to-br ${item.bg}`}
            >
              <div className="text-white opacity-90 group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>
              <p className="mt-3 text-white font-display font-bold text-sm text-center px-4">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Testimonials Section ──────────────────────────────────────────────────────
function TestimonialsSection() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 reveal">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-4 font-accent">
            <Star className="w-4 h-4" />
            What Snackers Say
          </div>
          <h2 className="font-display font-bold text-4xl lg:text-5xl text-foreground">
            Loved by Plant-Powered{" "}
            <span className="gradient-brand-text">Fans</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.author}
              data-ocid={`testimonials.item.${i + 1}`}
              className={`reveal reveal-delay-${i + 1} bg-card rounded-3xl p-7 shadow-card card-hover`}
            >
              <StarRating />
              <p className="text-foreground text-base leading-relaxed mt-4 mb-6 italic">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{
                    background: "linear-gradient(135deg, #2ECC71, #FF7A18)",
                  }}
                >
                  {t.author[0]}
                </div>
                <div>
                  <p className="font-display font-bold text-sm text-foreground">
                    {t.author}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Newsletter Section ────────────────────────────────────────────────────────
function NewsletterSection() {
  const [email, setEmail] = useState("");
  const {
    mutate: subscribe,
    isPending,
    isSuccess,
    isError,
    reset,
  } = useSubscribeNewsletter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    subscribe(email);
  };

  return (
    <section
      id="contact"
      className="py-24 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #FF7A18 0%, #FFB347 50%, #FF7A18 100%)",
      }}
    >
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #FF7A18, transparent)" }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="reveal">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white font-semibold text-sm mb-6 font-accent backdrop-blur-sm">
            <Leaf className="w-4 h-4" />
            Join the Community
          </div>
          <h2 className="font-display font-bold text-4xl lg:text-5xl text-white mb-4">
            Join the NÚBITES Community
          </h2>
          <p className="text-white/85 text-lg mb-10 leading-relaxed">
            Get new flavor drops, discounts, and plant-based inspiration
            delivered to your inbox.
          </p>

          {isSuccess ? (
            <div
              data-ocid="newsletter.success_state"
              className="flex items-center justify-center gap-3 bg-white/20 backdrop-blur-sm text-white rounded-2xl px-8 py-5 text-lg font-semibold border border-white/30"
            >
              <CheckCircle className="w-6 h-6" />
              You&apos;re in! Welcome to the NÚBITES family. 🌱
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
            >
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (isError) reset();
                }}
                placeholder="Enter your email address"
                required
                data-ocid="newsletter.input"
                className="flex-1 bg-white/95 dark:bg-white border-0 text-brand-dark placeholder:text-gray-400 rounded-full px-6 py-6 text-base shadow-lg focus:ring-2 focus:ring-white/50"
              />
              <Button
                type="submit"
                disabled={isPending}
                data-ocid="newsletter.submit_button"
                className="bg-foreground hover:bg-foreground/90 text-background font-bold px-8 py-6 rounded-full whitespace-nowrap transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                    Subscribing...
                  </span>
                ) : (
                  "Subscribe →"
                )}
              </Button>
            </form>
          )}

          {isError && (
            <div
              data-ocid="newsletter.error_state"
              className="mt-3 text-white/90 text-sm bg-red-500/30 rounded-xl px-4 py-2 border border-red-400/30"
            >
              Something went wrong. Please try again.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const year = new Date().getFullYear();
  const footerLinks = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Products", href: "#products" },
    { label: "Packaging", href: "#packaging" },
    { label: "Sustainability", href: "#sustainability" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <footer className="bg-foreground text-background py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <img
              src="/assets/uploads/Screenshot-2026-02-16-113800-1.png"
              alt="NÚBITES"
              className="h-12 w-auto mb-4 object-contain"
              style={{ filter: "brightness(0) invert(1)" }}
            />
            <p className="text-background/60 text-sm leading-relaxed mb-4">
              Nature, With a New Accent. Plant-based snacks made for modern
              life.
            </p>
            <div className="flex gap-3">
              <a
                href="https://instagram.com"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-primary/80 transition-colors duration-200 text-background/70 hover:text-white"
              >
                <SiInstagram className="w-4 h-4" />
              </a>
              <a
                href="https://tiktok.com"
                aria-label="TikTok"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-primary/80 transition-colors duration-200 text-background/70 hover:text-white"
              >
                <SiTiktok className="w-4 h-4" />
              </a>
              <a
                href="https://x.com"
                aria-label="Twitter/X"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-primary/80 transition-colors duration-200 text-background/70 hover:text-white"
              >
                <SiX className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-bold text-base text-background mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {footerLinks.map((link, i) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    data-ocid={`footer.link.${i + 1}`}
                    className="text-background/60 hover:text-primary transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-base text-background mb-4">
              Get in Touch
            </h4>
            <a
              href="mailto:hello@nubites.com"
              className="text-primary hover:text-brand-green transition-colors duration-200 text-sm block mb-4"
            >
              hello@nubites.com
            </a>
            <p className="text-background/60 text-sm leading-relaxed">
              Made with 🌱 for the planet and for your taste buds.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["100% Vegan", "Cruelty-Free", "Eco-Friendly"].map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary"
                >
                  <Leaf className="w-3 h-3" />
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-background/50">
          <span>© {year} NÚBITES. All rights reserved.</span>
          <span>
            Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark] = useDarkMode();
  useScrollReveal();

  const toggleDark = useCallback(() => setDark((d) => !d), [setDark]);

  return (
    <CartProvider>
      <div className="min-h-screen">
        <Toaster richColors position="top-right" />
        <Navbar dark={dark} toggleDark={toggleDark} />
        <CartDrawer />
        <main>
          <HeroSection />
          <AboutSection />
          <MissionVisionSection />
          <ProductsSection />
          <PackagingSection />
          <SustainabilitySection />
          <LifestyleSection />
          <TestimonialsSection />
          <NewsletterSection />
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}
