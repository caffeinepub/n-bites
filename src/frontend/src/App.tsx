import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import {
  CheckCircle,
  Globe,
  Leaf,
  Menu,
  Moon,
  PawPrint,
  Recycle,
  ShoppingCart,
  Sprout,
  Star,
  Sun,
  TreePine,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SiInstagram, SiTiktok, SiX } from "react-icons/si";
import { toast } from "sonner";
import { useAddToCart, useSubscribeNewsletter } from "./hooks/useQueries";

// ── Types ────────────────────────────────────────────────────────────────────
interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  tag: string;
}

interface QuickShopState {
  open: boolean;
  product: Product | null;
  qty: number;
}

// ── Data ─────────────────────────────────────────────────────────────────────
const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Roasted Chili Chickpea Bites",
    description: "Bold, spicy, and packed with plant protein.",
    price: "$4.99",
    image: "/assets/generated/product-chickpea.dim_400x400.jpg",
    tag: "Best Seller",
  },
  {
    id: 2,
    name: "Sea Salt Crunch Bites",
    description: "Light, crispy, and perfectly salted.",
    price: "$3.99",
    image: "/assets/generated/product-crisps.dim_400x400.jpg",
    tag: "New",
  },
  {
    id: 3,
    name: "Smoky BBQ Protein Bites",
    description: "Smoky flavor with a protein punch.",
    price: "$5.49",
    image: "/assets/generated/product-bbq.dim_400x400.jpg",
    tag: "High Protein",
  },
  {
    id: 4,
    name: "Lemon Herb Veggie Crisps",
    description: "Zesty, fresh, and guilt-free crunch.",
    price: "$4.49",
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

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({
  dark,
  toggleDark,
}: { dark: boolean; toggleDark: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Products", href: "#products" },
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
              src="/assets/generated/nubites-logo-transparent.dim_600x200.png"
              alt="NÚBITES"
              className="h-10 w-auto"
            />
          </a>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
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

            <a href="#products">
              <Button
                data-ocid="nav.primary_button"
                className="hidden sm:flex bg-brand-orange hover:bg-brand-orange/90 text-white font-bold px-5 py-2 rounded-full shadow-orange transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
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
        {/* Decorative dots */}
        <svg
          role="presentation"
          aria-hidden="true"
          className="absolute top-20 right-1/4 opacity-20"
          width="200"
          height="200"
          viewBox="0 0 200 200"
        >
          {[0, 1, 2, 3, 4].flatMap((row) =>
            [0, 1, 2, 3, 4].map((col) => (
              <circle
                key={`dot-green-${row}-${col}`}
                cx={col * 40 + 20}
                cy={row * 40 + 20}
                r="3"
                fill="#2ECC71"
              />
            )),
          )}
        </svg>
        <svg
          role="presentation"
          aria-hidden="true"
          className="absolute bottom-20 left-10 opacity-15"
          width="150"
          height="150"
          viewBox="0 0 150 150"
        >
          {[0, 1, 2, 3].flatMap((row) =>
            [0, 1, 2, 3].map((col) => (
              <circle
                key={`dot-orange-${row}-${col}`}
                cx={col * 40 + 20}
                cy={row * 40 + 20}
                r="3"
                fill="#FF7A18"
              />
            )),
          )}
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <div className="text-center lg:text-left">
            {/* Brand badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-semibold text-sm mb-6 font-accent">
              <Leaf className="w-4 h-4" />
              100% Plant-Based · Cruelty-Free
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-tight mb-6 text-foreground">
              Snack <span className="gradient-brand-text">Smart.</span> Snack{" "}
              <span className="gradient-brand-text">Bold.</span>
              <br />
              Snack Plant-Based.
            </h1>

            <p className="font-body text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              NÚBITES brings together bold flavors and clean plant-based
              ingredients to create snacks that are delicious, sustainable, and
              made for modern lifestyles.
            </p>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-10">
              <a href="#products">
                <Button
                  data-ocid="hero.primary_button"
                  size="lg"
                  className="bg-brand-orange hover:bg-brand-orange/90 text-white font-bold px-8 py-6 rounded-full text-lg shadow-orange hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Shop Now
                </Button>
              </a>
              <a href="#products">
                <Button
                  data-ocid="hero.secondary_button"
                  variant="outline"
                  size="lg"
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold px-8 py-6 rounded-full text-lg transition-all duration-300"
                >
                  <Leaf className="w-5 h-5 mr-2" />
                  Explore Flavors
                </Button>
              </a>
            </div>

            {/* Eco badges */}
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
              {["100% Vegan", "Cruelty-Free", "Plant-Based"].map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold bg-primary/15 text-primary border border-primary/25"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Hero image */}
          <div className="flex justify-center lg:justify-end relative">
            <div className="relative">
              {/* Blob background behind image */}
              <div
                className="absolute inset-0 blob-shape scale-110"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(46,204,113,0.25), rgba(255,122,24,0.2))",
                }}
              />
              <img
                src="/assets/generated/hero-snacks.dim_1200x700.jpg"
                alt="NÚBITES plant-based snacks"
                className="relative z-10 w-full max-w-xl rounded-3xl shadow-2xl animate-float object-cover"
                style={{ maxHeight: "480px" }}
              />
              {/* Floating badges on image */}
              <div
                className="absolute -top-4 -left-4 z-20 animate-float-slow"
                style={{ animationDelay: "1s" }}
              >
                <div className="bg-white dark:bg-card rounded-2xl px-4 py-2 shadow-card flex items-center gap-2">
                  <span className="text-2xl">🌱</span>
                  <div>
                    <p className="font-display font-bold text-sm text-foreground">
                      100% Vegan
                    </p>
                    <p className="text-xs text-muted-foreground">Certified</p>
                  </div>
                </div>
              </div>
              <div
                className="absolute -bottom-4 -right-4 z-20 animate-float-slow"
                style={{ animationDelay: "2s" }}
              >
                <div className="bg-brand-orange text-white rounded-2xl px-4 py-2 shadow-orange flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <p className="font-display font-bold text-sm">
                      Plant Protein
                    </p>
                    <p className="text-xs opacity-80">Per serving</p>
                  </div>
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
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="/assets/uploads/Screenshot-17--2.png"
                alt="NÚBITES brand overview"
                className="w-full h-auto object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div
                className="w-full aspect-video flex items-center justify-center rounded-3xl"
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
          {/* Mission */}
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

          {/* Vision */}
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
  const [quickShop, setQuickShop] = useState<QuickShopState>({
    open: false,
    product: null,
    qty: 1,
  });
  const { mutate: addToCart, isPending } = useAddToCart();

  const handleOpenQuickShop = (product: Product) => {
    setQuickShop({ open: true, product, qty: 1 });
  };

  const handleConfirmAdd = () => {
    if (!quickShop.product) return;
    addToCart(
      {
        productId: BigInt(quickShop.product.id),
        quantity: BigInt(quickShop.qty),
      },
      {
        onSuccess: () => {
          toast.success(
            `Added ${quickShop.qty}x ${quickShop.product?.name} to cart!`,
          );
          setQuickShop({ open: false, product: null, qty: 1 });
        },
        onError: () => {
          toast.error("Could not add to cart. Please try again.");
        },
      },
    );
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
                    onClick={() => handleOpenQuickShop(product)}
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

      {/* Quick Shop Dialog */}
      <Dialog
        open={quickShop.open}
        onOpenChange={(open) => setQuickShop((s) => ({ ...s, open }))}
      >
        <DialogContent
          data-ocid="quickshop.dialog"
          className="sm:max-w-md rounded-3xl"
        >
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-xl">
              {quickShop.product?.name}
            </DialogTitle>
          </DialogHeader>
          {quickShop.product && (
            <div className="space-y-5">
              <img
                src={quickShop.product.image}
                alt={quickShop.product.name}
                className="w-full h-48 object-cover rounded-2xl"
              />
              <p className="text-muted-foreground text-sm">
                {quickShop.product.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="font-display font-extrabold text-2xl text-primary">
                  {quickShop.product.price}
                </span>
                <div className="flex items-center gap-3 bg-muted rounded-full px-3 py-1">
                  <button
                    type="button"
                    onClick={() =>
                      setQuickShop((s) => ({
                        ...s,
                        qty: Math.max(1, s.qty - 1),
                      }))
                    }
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg hover:bg-border transition-colors"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="font-bold text-base w-6 text-center">
                    {quickShop.qty}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuickShop((s) => ({ ...s, qty: s.qty + 1 }))
                    }
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg hover:bg-border transition-colors"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  data-ocid="quickshop.confirm_button"
                  onClick={handleConfirmAdd}
                  disabled={isPending}
                  className="flex-1 bg-brand-orange hover:bg-brand-orange/90 text-white font-bold rounded-full py-6"
                >
                  {isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Adding...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </span>
                  )}
                </Button>
                <Button
                  data-ocid="quickshop.close_button"
                  variant="outline"
                  onClick={() =>
                    setQuickShop({ open: false, product: null, qty: 1 })
                  }
                  className="rounded-full py-6 px-6"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
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
      {/* Decorative circles */}
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
              <div className="text-white/70 group-hover:text-white transition-colors duration-300 mb-3">
                {item.icon}
              </div>
              <p className="font-display font-bold text-white text-sm text-center px-4 drop-shadow">
                {item.label}
              </p>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 rounded-3xl" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ──────────────────────────────────────────────────────────────
function TestimonialsSection() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 reveal">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-4 font-accent">
            <Star className="w-4 h-4" />
            Happy Snackers
          </div>
          <h2 className="font-display font-bold text-4xl lg:text-5xl text-foreground">
            What People <span className="gradient-brand-text">Are Saying</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.author}
              className={`reveal reveal-delay-${i + 1} bg-card rounded-3xl p-8 shadow-card card-hover border-t-4`}
              style={{ borderTopColor: i % 2 === 0 ? "#2ECC71" : "#FF7A18" }}
            >
              <div className="mb-4">
                <StarRating />
              </div>
              <p className="text-foreground text-lg leading-relaxed mb-6 font-body italic">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold font-display"
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
    if (!email) return;
    subscribe(email, {
      onSuccess: () => {
        setEmail("");
      },
    });
  };

  return (
    <section
      id="contact"
      className="py-24 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #2ECC71 0%, #27AE60 40%, #1a8a4a 100%)",
      }}
    >
      <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
        <div
          className="absolute top-10 right-20 w-64 h-64 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #FF7A18, transparent)",
          }}
        />
        <div
          className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, white, transparent)" }}
        />
      </div>

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
                className="bg-brand-orange hover:bg-brand-orange/90 text-white font-bold px-8 py-6 rounded-full shadow-orange whitespace-nowrap transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
              src="/assets/generated/nubites-logo-transparent.dim_600x200.png"
              alt="NÚBITES"
              className="h-10 w-auto mb-4 brightness-0 invert"
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
    <div className="min-h-screen">
      <Toaster richColors position="top-right" />
      <Navbar dark={dark} toggleDark={toggleDark} />
      <main>
        <HeroSection />
        <AboutSection />
        <MissionVisionSection />
        <ProductsSection />
        <SustainabilitySection />
        <LifestyleSection />
        <TestimonialsSection />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  );
}
