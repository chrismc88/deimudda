import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Impressum from "./pages/Impressum";
import SellerDashboard from "./pages/SellerDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import SellerShop from "./pages/SellerShop";
import ListingDetail from "./pages/ListingDetail";
import BrowseListings from "./pages/BrowseListings";
import Checkout from "./pages/Checkout";
import Terms from "./pages/Terms";
import Profile from "./pages/Profile";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/impressum"} component={Impressum} />
      <Route path={"/browse"} component={BrowseListings} />
      <Route path="/listing/:id" component={ListingDetail} />
      <Route path="/checkout/:id" component={Checkout} />
      <Route path="/terms" component={Terms} />
      <Route path="/profile" component={Profile} />
      <Route path="/seller/dashboard" component={SellerDashboard} />
      <Route path="/buyer/dashboard" component={BuyerDashboard} />
      <Route path="/seller/:sellerId" component={SellerShop} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

