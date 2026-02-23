// import Home from "./pages/home";
// import Registerform from "./pages/register-page.js";
// import Loginform from "./pages/login-page.js";
// import PageNotFound from "./pages/pageNotFound";
// import SPA from "./core/spa";
// import Page from "./pages/page";
// import Search from "./pages/search-page";
// import Profile from "./pages/profile-page";
// import OthersProfilePage from "./pages/others-profile-page.js";
// import Notifications from "./pages/notif-page.js";
import { setupSocket } from "./hooks/bini_hooks/socket.js";

/**
 * All Pages in Bini
 */
import SPA from "./core/bini_core/spa";
import Loginform from "./pages/bini_pages/auth_page/login-page";
import Registerform from "./pages/bini_pages/auth_page/register-page";
import Home from "./pages/bini_pages/home_page/home";
import Notifications from "./pages/bini_pages/notif_page/notif-page";
import PageNotFound from "./pages/bini_pages/page_not_found/pageNotFound";
import OthersProfilePage from "./pages/bini_pages/profile_page/others-profile-page";
import Profile from "./pages/bini_pages/profile_page/profile-page";
import Search from "./pages/bini_pages/search_page/search-page";
import ThreadTopic from "./components/bini_components/thread-topic.js";


/**
 * All Pages in Ecommerce
 */
import HOMEPAGE from './pages/ecommerce_page/home_page/home_page.js';
import SIGNIN from './pages/ecommerce_page/auth_page/signin_page.js';
import SIGNUP from './pages/ecommerce_page/auth_page/signup_page.js';
import SHOP from './pages/ecommerce_page/shop_page/shop_page.js';
import Checkout from './pages/ecommerce_page/checkout_page/checkout_page.js';
import OrderHistory from './pages/ecommerce_page/order_page/order_history_page.js';
import OrderConfirmation from './components/ecommerce_components/order/order_confirmation.js';



import "./styles/bini_styles/common.css";
import "./styles/bini_styles/header.css";



// sub_admin pages (from Admin_spa structure)
import SubAdminDashboard from './pages/Admin_page/Dashboard.js';
import SubAdminLandingPage from './pages/Admin_page/LandingPage.js';
import SubAdminUsers from './pages/Admin_page/Users.js';
import SubAdminGroups from './pages/Admin_page/Groups.js';
import SubAdminMarketplace from './pages/Admin_page/Marketplace.js';
import SubAdminOrders from './pages/Admin_page/Orders.js';
import SubAdminPayments from './pages/Admin_page/Payments.js';
import SubAdminMessaging from './pages/Admin_page/Messaging.js';
import SubAdminSettings from './pages/Admin_page/Settings.js';
import SubAdminAnalytics from './pages/Admin_page/Analytics.js';
import SubAdminCommunity from './pages/Admin_page/Community.js';
import SubAdminGenerateWebsite from './pages/Admin_page/GenerateWebsite.js';
import SubAdminReports from './pages/Admin_page/Reports.js';
import SubAdminThreads from './pages/Admin_page/Threads.js';


// Initialize SPA
const app = new SPA({
  root: document.getElementById("app"),
  defaultRoute: PageNotFound,
});





// All routing in sub admin
app.add("/subadmin", SubAdminDashboard);
app.add("/subadmin/dashboard", SubAdminDashboard);
app.add("/subadmin/landing", SubAdminLandingPage);
app.add("/subadmin/users", SubAdminUsers);
app.add("/subadmin/groups", SubAdminGroups);
app.add("/subadmin/marketplace", SubAdminMarketplace);
app.add("/subadmin/orders", SubAdminOrders);
app.add("/subadmin/payments", SubAdminPayments);
app.add("/subadmin/messaging", SubAdminMessaging);
app.add("/subadmin/settings", SubAdminSettings);
app.add("/subadmin/analytics", SubAdminAnalytics);
app.add("/subadmin/community", SubAdminCommunity);
app.add("/subadmin/generate-website", SubAdminGenerateWebsite);
app.add("/subadmin/reports", SubAdminReports);
app.add("/subadmin/threads", SubAdminThreads);
app.add("/bini/threads", SubAdminThreads); // Add direct route for sidebar link with /bini prefix
console.log('✅ /subadmin/threads and /bini/threads routes registered');

/**
 * All routing in Bini
 */
app.add("/bini", Home);
app.add("/bini/register", Registerform);
app.add("/bini/login", Loginform);
app.add("/bini/search", Search);
app.add("/bini/profile", Profile);
app.add("/bini/notifications", Notifications);
app.add("/bini/others-profile", OthersProfilePage);
// Thread topic route (captures thread id)
app.add(/\/bini\/thread\/([^/]+)/, ThreadTopic);
// app.add(/\/pages\/(?<id>\d+)/i, Page);


/**
 * All Routing in Ecommerce
 */
app.add('/', HOMEPAGE);
app.add('/signin', SIGNIN);
app.add('/signup', SIGNUP);
app.add('/shop', SHOP);
app.add('/checkout', Checkout);
app.add('/order-history', OrderHistory);
app.add('/order-confirmation', OrderConfirmation);

// Global socket init 
const socket = setupSocket();

// Global listener for user status updates
window.addEventListener("userStatusUpdate", (e) => {
  const { id, status } = e.detail;
  console.log(`🌍 Global user status: ${id} → ${status}`);
});

// Make socket accessible globally
window.globalSocket = socket;
  
app.handleRouteChanges();
