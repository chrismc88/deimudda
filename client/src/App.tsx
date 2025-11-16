import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import CookieBanner from "./components/CookieBanner";
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
import Messages from "./pages/Messages";
import ChatWindow from "./pages/ChatWindow";
import Notifications from "./pages/Notifications";
import FAQ from "./pages/FAQ";
import About from "./pages/About";
import Contact from "./pages/Contact";
import SellerGuidelines from "./pages/SellerGuidelines";
import FeeStructure from "./pages/FeeStructure";
import Privacy from "./pages/Privacy";
import Support from "./pages/Support";

// Admin Components
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminTransactions from "./pages/AdminTransactions";
import AdminListings from "./pages/AdminListings";
import AdminSettings from "./pages/AdminSettings";
import AdminFees from "./pages/AdminFees";
import AdminStats from "./pages/AdminStats";
import AdminSecurity from "./pages/AdminSecurity";
import AdminTest from "./pages/AdminTest";
import AdminManage from "./pages/AdminManage";
import AdminManagement from "./pages/AdminManagement";
import AdminReports from "./pages/AdminReports";
import AdminLogs from "./pages/AdminLogs";

// Additional Pages
import Widerruf from "./pages/Widerruf";
import Maintenance from "./pages/Maintenance";
import SellerTransactions from "./pages/SellerTransactions";
// import OfferManagement from "./pages/OfferManagement"; // Removed: Corrupted backup file
import NewMessage from "./pages/NewMessage";
import CheckoutNew from "./pages/CheckoutNew";
import OfferManagement from "./pages/OfferManagement";

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
      <Route path="/messages" component={Messages} />
      <Route path="/messages/:id" component={ChatWindow} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/faq" component={FAQ} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/seller-guidelines" component={SellerGuidelines} />
      <Route path="/fee-structure" component={FeeStructure} />
      <Route path="/datenschutz" component={Privacy} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/support" component={Support} />
      <Route path="/widerruf" component={Widerruf} />
      <Route path="/maintenance" component={Maintenance} />
      <Route path="/checkout-new/:id" component={CheckoutNew} />
      <Route path="/seller/transactions" component={SellerTransactions} />
      <Route path="/offers" component={OfferManagement} />
      <Route path="/messages/new" component={NewMessage} />
      
      {/* Admin Routes - Protected routes for admin/super_admin */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/test" component={AdminTest} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/transactions" component={AdminTransactions} />
      <Route path="/admin/listings" component={AdminListings} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/fees" component={AdminFees} />
      <Route path="/admin/stats" component={AdminStats} />
      <Route path="/admin/security" component={AdminSecurity} />
      <Route path="/admin/manage" component={AdminManage} />
      <Route path="/admin/management" component={AdminManagement} />
      <Route path="/admin/reports" component={AdminReports} />
      <Route path="/admin/logs" component={AdminLogs} />
      
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
          <CookieBanner />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

