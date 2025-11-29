import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { QrCode, Smartphone, TrendingUp, Zap, CheckCircle2, ChefHat } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold">PratoDigital</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-smooth">
              Features
            </a>
            <a href="#pricing" className="text-sm font-medium hover:text-primary transition-smooth">
              Pricing
            </a>
            <Link to="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="gradient-primary shadow-glow">Get Started</Button>
            </Link>
          </nav>
          <div className="md:hidden">
            <Link to="/register">
              <Button size="sm" className="gradient-primary">Start Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                <span className="text-sm font-medium text-primary">🚀 Transform Your Restaurant</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                Digital Menus,{" "}
                <span className="gradient-hero bg-clip-text text-transparent">
                  Zero Hassle
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Create stunning digital menus, generate QR codes for tables, and receive orders directly from customers. 
                Manage everything from one powerful dashboard.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button size="lg" className="gradient-primary shadow-glow text-lg px-8 w-full sm:w-auto">
                    Start Free Trial
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="text-lg px-8 w-full sm:w-auto">
                  View Demo
                </Button>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  <span className="text-sm text-muted-foreground">No credit card</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  <span className="text-sm text-muted-foreground">14-day trial</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-border">
                <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center">
                  <div className="text-center space-y-4 p-8">
                    <Smartphone className="h-24 w-24 text-primary mx-auto animate-pulse" />
                    <p className="text-lg font-semibold">Interactive Menu Preview</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-secondary rounded-full blur-3xl opacity-50"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary rounded-full blur-3xl opacity-30"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold">Everything You Need</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed specifically for modern restaurants
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<QrCode className="h-10 w-10 text-primary" />}
              title="QR Code Menus"
              description="Generate unique QR codes for each table. Customers scan and order instantly without waiting for staff."
            />
            <FeatureCard
              icon={<Smartphone className="h-10 w-10 text-primary" />}
              title="Mobile-First Design"
              description="Beautiful, responsive menus that work perfectly on any device. No app installation required."
            />
            <FeatureCard
              icon={<Zap className="h-10 w-10 text-primary" />}
              title="Real-Time Orders"
              description="Receive orders instantly in your dashboard with live updates. Never miss an order again."
            />
            <FeatureCard
              icon={<TrendingUp className="h-10 w-10 text-primary" />}
              title="Analytics & Reports"
              description="Track your best-selling items, peak hours, and revenue with detailed analytics."
            />
            <FeatureCard
              icon={<CheckCircle2 className="h-10 w-10 text-primary" />}
              title="Easy Menu Updates"
              description="Update prices, add items, or mark dishes as unavailable in seconds from anywhere."
            />
            <FeatureCard
              icon={<ChefHat className="h-10 w-10 text-primary" />}
              title="Kitchen Management"
              description="Print tickets automatically and update order status from preparation to delivery."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="rounded-3xl gradient-hero p-12 text-center text-white shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Go Digital?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join hundreds of restaurants already using PratoDigital
            </p>
            <Link to="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8">
                Start Your Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ChefHat className="h-6 w-6 text-primary" />
                <span className="font-bold">PratoDigital</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Modern digital menu solutions for restaurants.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-smooth">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-smooth">About</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Contact</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-smooth">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition-smooth">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; 2024 PratoDigital. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-soft border border-border hover:shadow-medium transition-smooth">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default Landing;
