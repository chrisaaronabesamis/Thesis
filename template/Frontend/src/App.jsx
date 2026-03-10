import { useEffect, useMemo, useState } from "react";
import TopNav from "./components/TopNav";
import AlbumGrid from "./components/AlbumGrid";
import EventShowcase from "./components/EventShowcase";
import AuthPanel from "./components/AuthPanel";
import ShopSection from "./components/ShopSection";
import CommunityFeed from "./components/CommunityFeed";
import AccountHub from "./components/AccountHub";
import HomeSection from "./components/HomeSection";
import AboutSection from "./components/AboutSection";
import AnnouncementSection from "./components/AnnouncementSection";
import ToastViewport from "./components/ToastViewport";
import CommunitySideNav from "./components/CommunitySideNav";
import {
  addToCart,
  createOrder,
  createCommentReply,
  createCommunityPost,
  createPostComment,
  deletePost,
  getAlbumTracks,
  getAlbums,
  getAnnouncements,
  getCartItems,
  getCollections,
  getCommunityFeed,
  getEventPosters,
  getGeneratedWebsiteByCommunityType,
  getOrderHistory,
  getPostComments,
  getPostLikeCount,
  getProductDetails,
  getProductsByCollection,
  getProfile,
  getShippingRate,
  loginUser,
  repostPost,
  registerUser,
  togglePostLike,
  updatePost,
} from "./services/api";
import {
  normalizeAlbums,
  normalizeAnnouncements,
  normalizeCart,
  normalizeCollections,
  normalizeComments,
  normalizeGeneratedWebsite,
  normalizeOrders,
  normalizePosters,
  normalizePosts,
  normalizeProductDetails,
  normalizeProducts,
  normalizeTracks,
} from "./services/normalize";
import { getSiteSlug, getToken, setSiteSlug, setToken } from "./utils/storage";
import { PH_PROVINCES } from "./utils/phProvinces";
import { PH_ADDRESS_TREE } from "./utils/phAddressTree";
import { toast } from "./utils/toast";
import {
  FALLBACK_ABOUT,
  FALLBACK_ANNOUNCEMENTS,
  FALLBACK_COLLECTIONS,
  FALLBACK_DISCOGRAPHY,
  FALLBACK_EVENTS,
  FALLBACK_MEMBERS,
  FALLBACK_PRODUCTS,
  FALLBACK_VARIANTS,
} from "./data/dbFallback";

const COMMUNITY_PAGE_SIZE = 12;

function resolveLocationFromHash() {
  const raw = String(window.location.hash || "").replace(/^#\/?/, "").trim().toLowerCase();
  const [pathPart, queryPart] = raw.split("?");
  const params = new URLSearchParams(queryPart || "");
  const focus = String(params.get("focus") || "").trim().toLowerCase();
  const view = String(params.get("view") || "").trim().toLowerCase();
  const productId = String(params.get("product") || "").trim();
  const section = String(params.get("section") || "").trim().toLowerCase();
  const allowedSections = ["about", "discography", "events", "announcement"];
  const allowedShopFocus = focus === "cart" || focus === "orders" ? focus : "";
  const allowedShopViews = ["catalog", "product", "cart", "checkout", "checkout-details", "orders"];
  const allowedShopView = allowedShopViews.includes(view) ? view : "catalog";
  const allowedCommunityFocus = focus === "compose" || focus === "discover" ? focus : "";
  const allowedCommunityViews = ["home", "search", "messages", "notifications", "profile"];
  const allowedCommunityView = allowedCommunityViews.includes(view) ? view : "home";
  const allowedSection = allowedSections.includes(section) ? section : "";

  if (pathPart === "about" || pathPart === "discography" || pathPart === "events" || pathPart === "announcement") {
    return { route: "home", focus: "", section: pathPart, communityView: "home" };
  }

  if (
    pathPart === "home" ||
    pathPart === "shop" ||
    pathPart === "community" ||
    pathPart === "login"
  ) {
    const resolvedFocus = pathPart === "shop"
      ? allowedShopFocus
      : pathPart === "community"
        ? allowedCommunityFocus
        : "";
    return {
      route: pathPart,
      focus: resolvedFocus,
      section: pathPart === "home" ? allowedSection : "",
      shopView: pathPart === "shop" ? (allowedShopFocus || allowedShopView) : "catalog",
      shopProductId: pathPart === "shop" ? productId : "",
      communityView: pathPart === "community" ? allowedCommunityView : "home",
    };
  }
  return { route: "home", focus: "", section: "", shopView: "catalog", shopProductId: "", communityView: "home" };
}

export default function App() {
  const [collections, setCollections] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productVariants, setProductVariants] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [aboutData, setAboutData] = useState(FALLBACK_ABOUT);
  const [membersData, setMembersData] = useState(FALLBACK_MEMBERS);
  const [posts, setPosts] = useState([]);
  const [communityOffset, setCommunityOffset] = useState(0);
  const [communityHasMore, setCommunityHasMore] = useState(true);
  const [communityLoadingMore, setCommunityLoadingMore] = useState(false);
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentLoadingByPost, setCommentLoadingByPost] = useState({});
  const [orderHistory, setOrderHistory] = useState([]);
  const [checkoutStatus, setCheckoutStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [shippingFee, setShippingFee] = useState(0);
  const [shippingRegion, setShippingRegion] = useState("");
  const [shippingReady, setShippingReady] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    province: "",
    city: "",
    barangay: "",
  });
  const [profile, setProfile] = useState(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [error, setError] = useState("");
  const [siteSlug] = useState(getSiteSlug());
  const [locationState, setLocationState] = useState(resolveLocationFromHash());
  const [loading, setLoading] = useState({
    feed: true,
    auth: false,
    tracks: false,
    shop: false,
    community: false,
  });
  const isLoggedIn = Boolean(profile?.user);
  const isCommunityRoute = locationState.route === "community";


  function scrollToSectionWithOffset(sectionId) {
    const sectionEl = document.getElementById(sectionId);
    if (!sectionEl) return;
    const navEl = document.querySelector(".top-nav");
    const navHeight = Number(navEl?.getBoundingClientRect().height || 0);
    const y = window.scrollY + sectionEl.getBoundingClientRect().top - navHeight - 12;
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
  }

  function decodeGoogleJwt(token = "") {
    const parts = String(token || "").split(".");
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    try {
      const json = atob(padded);
      return JSON.parse(json);
    } catch (_) {
      return null;
    }
  }

  async function loadCart() {
    if (!getToken()) {
      setCartItems([]);
      return;
    }
    try {
      const cartRes = await getCartItems();
      setCartItems(normalizeCart(cartRes));
    } catch (_) {
      setCartItems([]);
    }
  }

  async function loadOrders() {
    if (!getToken()) {
      setOrderHistory([]);
      return;
    }
    try {
      const ordersRes = await getOrderHistory();
      setOrderHistory(normalizeOrders(ordersRes));
    } catch (_) {
      setOrderHistory([]);
    }
  }

  async function loadCommunityFeed() {
    setLoading((prev) => ({ ...prev, community: true }));
    try {
      const feedRes = await getCommunityFeed(COMMUNITY_PAGE_SIZE, 0);
      const normalized = normalizePosts(feedRes);
      const withLikes = await Promise.all(
        normalized.map(async (post) => {
          try {
            const countRes = await getPostLikeCount(post.id);
            return { ...post, likeCount: Number(countRes?.likeCount || 0) };
          } catch (_) {
            return { ...post, likeCount: 0 };
          }
        }),
      );
      setPosts(withLikes);
      setCommunityOffset(withLikes.length);
      setCommunityHasMore(withLikes.length >= COMMUNITY_PAGE_SIZE);
    } catch (_) {
      setPosts([]);
      setCommunityOffset(0);
      setCommunityHasMore(false);
    } finally {
      setLoading((prev) => ({ ...prev, community: false }));
    }
  }

  async function loadMoreCommunityFeed() {
    if (loading.community || communityLoadingMore || !communityHasMore) return;

    setCommunityLoadingMore(true);
    try {
      const feedRes = await getCommunityFeed(COMMUNITY_PAGE_SIZE, communityOffset);
      const normalized = normalizePosts(feedRes);
      const withLikes = await Promise.all(
        normalized.map(async (post) => {
          try {
            const countRes = await getPostLikeCount(post.id);
            return { ...post, likeCount: Number(countRes?.likeCount || 0) };
          } catch (_) {
            return { ...post, likeCount: 0 };
          }
        }),
      );

      if (withLikes.length === 0) {
        setCommunityHasMore(false);
        return;
      }

      setPosts((prev) => {
        const seen = new Set(prev.map((item) => String(item.id)));
        const next = [...prev];
        withLikes.forEach((item) => {
          if (seen.has(String(item.id))) return;
          seen.add(String(item.id));
          next.push(item);
        });
        return next;
      });
      setCommunityOffset((prev) => prev + withLikes.length);
      setCommunityHasMore(withLikes.length >= COMMUNITY_PAGE_SIZE);
    } catch (_) {
      setCommunityHasMore(false);
    } finally {
      setCommunityLoadingMore(false);
    }
  }

  async function loadProducts(collectionId) {
    if (!collectionId) return;
    setLoading((prev) => ({ ...prev, shop: true }));
    try {
      const productsRes = await getProductsByCollection(collectionId);
      const normalized = normalizeProducts(productsRes);
      if (normalized.length > 0) {
        setProducts(normalized);
      } else {
        setProducts(normalizeProducts(FALLBACK_PRODUCTS.filter((item) => Number(item.collection_id) === Number(collectionId))));
      }
      setSelectedProduct(null);
      setProductVariants([]);
    } catch (_) {
      setProducts(normalizeProducts(FALLBACK_PRODUCTS.filter((item) => Number(item.collection_id) === Number(collectionId))));
      setSelectedProduct(null);
      setProductVariants([]);
    } finally {
      setLoading((prev) => ({ ...prev, shop: false }));
    }
  }

  async function loadPublicData() {
    setError("");
    setLoading((prev) => ({ ...prev, feed: true }));
    const [collectionsRes, albumsRes, eventsRes, announcementsRes] = await Promise.allSettled([
      getCollections(),
      getAlbums(),
      getEventPosters(),
      getAnnouncements(),
    ]);

    if (collectionsRes.status === "fulfilled") {
      const normalizedCollections = normalizeCollections(collectionsRes.value);
      setCollections(normalizedCollections.length > 0 ? normalizedCollections : normalizeCollections(FALLBACK_COLLECTIONS));
      if (normalizedCollections.length > 0) {
        const defaultCollectionId = normalizedCollections[0].id;
        setSelectedCollectionId(defaultCollectionId);
        await loadProducts(defaultCollectionId);
      } else {
        const defaultCollectionId = FALLBACK_COLLECTIONS[0]?.collection_id;
        setSelectedCollectionId(defaultCollectionId || "");
        if (defaultCollectionId) await loadProducts(defaultCollectionId);
      }
    } else {
      const fallbackCollections = normalizeCollections(FALLBACK_COLLECTIONS);
      setCollections(fallbackCollections);
      const defaultCollectionId = fallbackCollections[0]?.id;
      setSelectedCollectionId(defaultCollectionId || "");
      if (defaultCollectionId) await loadProducts(defaultCollectionId);
    }
    if (albumsRes.status === "fulfilled") {
      const normalized = normalizeAlbums(albumsRes.value);
      setAlbums(normalized.length > 0 ? normalized : normalizeAlbums(FALLBACK_DISCOGRAPHY));
    } else {
      setAlbums(normalizeAlbums(FALLBACK_DISCOGRAPHY));
    }
    if (eventsRes.status === "fulfilled") {
      const normalized = normalizePosters(eventsRes.value);
      setEvents(normalized.length > 0 ? normalized : normalizePosters(FALLBACK_EVENTS));
    } else {
      setEvents(normalizePosters(FALLBACK_EVENTS));
    }
    if (announcementsRes.status === "fulfilled") {
      const normalized = normalizeAnnouncements(announcementsRes.value);
      setAnnouncements(normalized.length > 0 ? normalized : normalizeAnnouncements(FALLBACK_ANNOUNCEMENTS));
    } else {
      setAnnouncements(normalizeAnnouncements(FALLBACK_ANNOUNCEMENTS));
    }

    const failedCount = [collectionsRes, albumsRes, eventsRes, announcementsRes].filter((item) => item.status === "rejected").length;
    if (failedCount > 0) {
      setError(`${failedCount} section(s) failed to load. Check API availability.`);
    }
    setLoading((prev) => ({ ...prev, feed: false }));
  }

  async function loadGeneratedWebsiteData() {
    const communityType = String(siteSlug || "").trim();
    if (!communityType) {
      setAboutData(FALLBACK_ABOUT);
      setMembersData(FALLBACK_MEMBERS);
      return;
    }
    try {
      const generatedRes = await getGeneratedWebsiteByCommunityType(communityType);
      const normalized = normalizeGeneratedWebsite(generatedRes);
      setAboutData(
        normalized.about?.description
          ? normalized.about
          : FALLBACK_ABOUT,
      );
      setMembersData(
        Array.isArray(normalized.members) && normalized.members.length > 0
          ? normalized.members
          : FALLBACK_MEMBERS,
      );
    } catch (_) {
      setAboutData(FALLBACK_ABOUT);
      setMembersData(FALLBACK_MEMBERS);
    }
  }

  useEffect(() => {
    setSiteSlug(siteSlug);
    setSelectedAlbumId(null);
    setTracks([]);
    setSelectedCollectionId("");
    setSelectedProduct(null);
    setProductVariants([]);
    Promise.all([loadPublicData(), loadGeneratedWebsiteData()]).then(() => {
      loadCart();
      loadCommunityFeed();
    });
  }, [siteSlug]);

  useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = "/home";
    }
    const onHashChange = () => setLocationState(resolveLocationFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    if (locationState.route === "home" && locationState.section) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [locationState.route, locationState.section]);

  useEffect(() => {
    if (locationState.route !== "home" || !locationState.section) return;
    const timer = setTimeout(() => {
      scrollToSectionWithOffset(locationState.section);
    }, 80);
    return () => clearTimeout(timer);
  }, [locationState.route, locationState.section]);

  useEffect(() => {
    if (locationState.route !== "shop") return;
    if (locationState.shopView !== "product") return;
    const id = Number(locationState.shopProductId || 0);
    if (!id) return;
    handleSelectProduct(id);
  }, [locationState.route, locationState.shopView, locationState.shopProductId]);

  useEffect(() => {
    if (locationState.route !== "community" || !locationState.focus) return;
    const id = locationState.focus === "compose" ? "community-compose" : "community-discover";
    const timer = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 90);
    return () => clearTimeout(timer);
  }, [locationState.route, locationState.focus, posts.length]);

  useEffect(() => {
    const isProtectedRoute = locationState.route === "shop";
    if (!isProtectedRoute || isLoggedIn) return;
    toast.warning("Login required to access Shop.");
    window.location.hash = "/login";
  }, [locationState.route, isLoggedIn]);

  async function loadProfile() {
    if (!getToken()) return;
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (_) {
      setToken("");
      setProfile(null);
    }
  }

  useEffect(() => {
    loadProfile();
    loadCart();
    loadCommunityFeed();
    loadOrders();
  }, [siteSlug]);

  async function handleLogin(payload) {
    setLoading((prev) => ({ ...prev, auth: true }));
    try {
      const data = await loginUser(payload);
      if (data?.token) {
        setToken(data.token);
        const profileData = await getProfile();
        setProfile(profileData);
        await loadCart();
        await loadCommunityFeed();
        await loadOrders();
      }
    } finally {
      setLoading((prev) => ({ ...prev, auth: false }));
    }
  }

  async function handleRegister(payload) {
    setLoading((prev) => ({ ...prev, auth: true }));
    try {
      await registerUser(payload);
    } finally {
      setLoading((prev) => ({ ...prev, auth: false }));
    }
  }

  async function handleGoogleContinue(credential, recaptchaToken) {
    if (!recaptchaToken) {
      throw new Error("Please complete reCAPTCHA first.");
    }
    const googleData = decodeGoogleJwt(credential);
    const email = String(googleData?.email || "").trim();
    const fullname = String(googleData?.name || "").trim() || "Google User";
    const imageUrl = String(googleData?.picture || "").trim();
    const sub = String(googleData?.sub || "").trim();

    if (!email || !sub) {
      throw new Error("Invalid Google credential.");
    }

    const generatedPassword = `G_${sub}_thread`;

    setLoading((prev) => ({ ...prev, auth: true }));
    try {
      try {
        const loginData = await loginUser({ email, password: generatedPassword });
        if (loginData?.token) {
          setToken(loginData.token);
          const profileData = await getProfile();
          setProfile(profileData);
          await loadCart();
          await loadCommunityFeed();
          await loadOrders();
          return;
        }
      } catch (_) {}

      await registerUser({ email, password: generatedPassword, fullname, imageUrl });
      const loginData = await loginUser({ email, password: generatedPassword });
      if (!loginData?.token) {
        throw new Error("Google login failed after registration.");
      }
      setToken(loginData.token);
      const profileData = await getProfile();
      setProfile(profileData);
      await loadCart();
      await loadCommunityFeed();
      await loadOrders();
    } finally {
      setLoading((prev) => ({ ...prev, auth: false }));
    }
  }

  function handleLogout() {
    setToken("");
    setProfile(null);
    setPosts([]);
    setCommentsByPost({});
    setCartItems([]);
    setOrderHistory([]);
  }

  async function handleAlbumSelect(albumId) {
    if (!albumId) return;
    setSelectedAlbumId(albumId);
    setLoading((prev) => ({ ...prev, tracks: true }));
    try {
      const data = await getAlbumTracks(albumId);
      setTracks(normalizeTracks(data));
    } catch (_) {
      setTracks([]);
    } finally {
      setLoading((prev) => ({ ...prev, tracks: false }));
    }
  }

  async function handleSelectCollection(collectionId) {
    setSelectedCollectionId(collectionId);
    await loadProducts(collectionId);
  }

  async function handleSelectProduct(productId) {
    if (!productId) return;
    setLoading((prev) => ({ ...prev, shop: true }));
    try {
      const detailsRes = await getProductDetails(productId);
      const details = normalizeProductDetails(detailsRes);
      if (details.product?.id) {
        setSelectedProduct(details.product);
        setProductVariants(details.variants);
      } else {
        const fallbackProduct = FALLBACK_PRODUCTS.find((item) => Number(item.product_id) === Number(productId));
        const fallbackVariants = FALLBACK_VARIANTS.filter((item) => Number(item.product_id) === Number(productId));
        setSelectedProduct(
          normalizeProductDetails({
            data: { product: fallbackProduct || {}, variants: fallbackVariants },
          }).product,
        );
        setProductVariants(
          normalizeProductDetails({
            data: { product: fallbackProduct || {}, variants: fallbackVariants },
          }).variants,
        );
      }
    } catch (_) {
      const fallbackProduct = FALLBACK_PRODUCTS.find((item) => Number(item.product_id) === Number(productId));
      const fallbackVariants = FALLBACK_VARIANTS.filter((item) => Number(item.product_id) === Number(productId));
      const fallback = normalizeProductDetails({
        data: { product: fallbackProduct || {}, variants: fallbackVariants },
      });
      setSelectedProduct(fallback.product);
      setProductVariants(fallback.variants);
    } finally {
      setLoading((prev) => ({ ...prev, shop: false }));
    }
  }

  async function handleAddToCart(variantId) {
    if (!getToken()) {
      setError("Login first to add items to cart.");
      return;
    }
    try {
      await addToCart({ variantId, quantity: 1 });
      await loadCart();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add to cart.");
    }
  }

  function updateCheckoutForm(field, value) {
    setShippingReady(false);
    setShippingFee(0);
    setShippingRegion("");
    setCheckoutForm((prev) => {
      if (field === "province") {
        return { ...prev, province: value, city: "", barangay: "" };
      }
      if (field === "city") {
        return { ...prev, city: value, barangay: "" };
      }
      return { ...prev, [field]: value };
    });
  }

  const cityOptions = useMemo(() => {
    const province = String(checkoutForm?.province || "").trim();
    if (!province) return [];
    const provinceNode = PH_ADDRESS_TREE[province];
    if (!provinceNode?.cities) return [];
    return Object.keys(provinceNode.cities);
  }, [checkoutForm?.province]);

  const barangayOptions = useMemo(() => {
    const province = String(checkoutForm?.province || "").trim();
    const city = String(checkoutForm?.city || "").trim();
    if (!province || !city) return [];
    const provinceNode = PH_ADDRESS_TREE[province];
    if (!provinceNode?.cities?.[city]) return [];
    return provinceNode.cities[city];
  }, [checkoutForm?.province, checkoutForm?.city]);

  function computeCartSubtotal() {
    return cartItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
  }

  function computeTotalWeight() {
    return cartItems.reduce(
      (sum, item) => sum + Number(item.weightG || 0) * Number(item.quantity || 0),
      0,
    );
  }

  async function handleFetchShippingFee() {
    if (!getToken()) {
      setCheckoutStatus("Login first.");
      setShippingReady(false);
      return;
    }
    if (!checkoutForm.province.trim()) {
      setCheckoutStatus("Province is required.");
      setShippingReady(false);
      return;
    }
    try {
      const shippingRes = await getShippingRate(checkoutForm.province.trim(), computeTotalWeight());
      setShippingFee(Number(shippingRes?.shipping_fee || 0));
      setShippingRegion(shippingRes?.region || "");
      setCheckoutStatus("Shipping fee fetched.");
      setShippingReady(true);
    } catch (err) {
      setCheckoutStatus(err?.response?.data?.message || "Failed to fetch shipping fee.");
      setShippingReady(false);
    }
  }

  async function handlePlaceCodOrder() {
    if (!getToken()) {
      setCheckoutStatus("Login first.");
      return;
    }
    if (cartItems.length === 0) {
      setCheckoutStatus("Cart is empty.");
      return;
    }
    if (!checkoutForm.province || !checkoutForm.city || !checkoutForm.barangay) {
      setCheckoutStatus("Complete PH shipping address.");
      return;
    }
    const payload = {
      items: cartItems.map((item) => ({
        product_id: item.productId,
        variant_id: item.variantId,
        quantity: item.quantity,
        price: item.price,
      })),
      shipping_address: {
        country: "Philippines",
        province: checkoutForm.province,
        city: checkoutForm.city,
        barangay: checkoutForm.barangay,
      },
      payment_method: paymentMethod || "COD",
      subtotal: computeCartSubtotal(),
      shipping_fee: Number(shippingFee || 0),
      total: computeCartSubtotal() + Number(shippingFee || 0),
    };

    try {
      await createOrder(payload);
      setCheckoutStatus("Order placed (COD).");
      setShippingReady(false);
      await loadCart();
      await loadOrders();
    } catch (err) {
      setCheckoutStatus(err?.response?.data?.message || "Failed to place order.");
    }
  }

  async function handleCreatePost(payload) {
    if (!getToken()) {
      throw new Error("Login required");
    }
    await createCommunityPost(payload);
    await loadCommunityFeed();
  }

  async function handleLikePost(postId) {
    if (!getToken()) return;
    await togglePostLike(postId);
    await loadCommunityFeed();
  }

  async function handleRepost(postId) {
    if (!getToken()) return;
    try {
      await repostPost(postId);
      await loadCommunityFeed();
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to repost.");
    }
  }

  async function handleUpdatePost(postId, content) {
    if (!getToken()) return;
    try {
      await updatePost(postId, { content });
      await loadCommunityFeed();
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to update post.");
      throw err;
    }
  }

  async function handleDeletePost(postId) {
    if (!getToken()) return;
    try {
      await deletePost(postId);
      setCommentsByPost((prev) => {
        const next = { ...prev };
        delete next[postId];
        return next;
      });
      await loadCommunityFeed();
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to delete post.");
    }
  }

  async function handleToggleComments(postId) {
    if (!postId) return;
    if (commentsByPost[postId]) {
      setCommentsByPost((prev) => {
        const next = { ...prev };
        delete next[postId];
        return next;
      });
      return;
    }
    setCommentLoadingByPost((prev) => ({ ...prev, [postId]: true }));
    try {
      const commentsRes = await getPostComments(postId);
      setCommentsByPost((prev) => ({ ...prev, [postId]: normalizeComments(commentsRes) }));
    } catch (_) {
      setCommentsByPost((prev) => ({ ...prev, [postId]: [] }));
    } finally {
      setCommentLoadingByPost((prev) => ({ ...prev, [postId]: false }));
    }
  }

  async function handleAddComment(postId, content) {
    await createPostComment(postId, { content });
    const commentsRes = await getPostComments(postId);
    setCommentsByPost((prev) => ({ ...prev, [postId]: normalizeComments(commentsRes) }));
  }

  async function handleAddReply(postId, commentId, content) {
    await createCommentReply(commentId, { content });
    const commentsRes = await getPostComments(postId);
    setCommentsByPost((prev) => ({ ...prev, [postId]: normalizeComments(commentsRes) }));
  }

  async function handleBuyNow(variantId) {
    if (!getToken()) {
      setError("Login first to continue.");
      window.location.hash = "/login";
      return;
    }
    try {
      await addToCart({ variantId, quantity: 1 });
      await loadCart();
      // Force COD for Buy Now flows and navigate to checkout
      setPaymentMethod("COD");
      setCheckoutStatus("Proceeding with Cash on Delivery (COD)...");
      window.location.hash = "/shop?view=checkout";
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to proceed with buy now.");
    }
  }

  return (
    <main className={`page-shell${isCommunityRoute ? " community-route" : ""}`}>
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      {!isCommunityRoute ? <TopNav route={locationState.route} section={locationState.section} isLoggedIn={isLoggedIn} /> : null}
      <ToastViewport />

      {locationState.route === "home" ? (
        <>
          <HomeSection
            stats={{
              albums: albums.length,
              products: products.length,
              events: events.length,
              announcements: announcements.length,
            }}
          />
          <AboutSection about={aboutData} members={membersData} />
          <AlbumGrid
            albums={albums}
            loading={loading.feed}
            selectedAlbumId={selectedAlbumId}
            onAlbumSelect={handleAlbumSelect}
            tracks={tracks}
            tracksLoading={loading.tracks}
          />
          <EventShowcase events={events} loading={loading.feed} />
          <AnnouncementSection announcements={announcements} loading={loading.feed} />
        </>
      ) : null}

      {locationState.route === "shop" ? (
        <>
          <ShopSection
            view={locationState.shopView}
            productId={locationState.shopProductId}
            collections={collections}
            selectedCollectionId={selectedCollectionId}
            products={products}
            selectedProduct={selectedProduct}
            productVariants={productVariants}
            onSelectCollection={handleSelectCollection}
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            loading={loading.shop}
            cartItems={cartItems}
            checkoutForm={checkoutForm}
            onCheckoutFormChange={updateCheckoutForm}
            shippingFee={shippingFee}
            shippingRegion={shippingRegion}
            shippingReady={shippingReady}
            onFetchShippingFee={handleFetchShippingFee}
            onPlaceCodOrder={handlePlaceCodOrder}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            orderHistory={orderHistory}
            checkoutStatus={checkoutStatus}
            provinceOptions={PH_PROVINCES}
            cityOptions={cityOptions}
            barangayOptions={barangayOptions}
          />
        </>
      ) : null}

      {locationState.route === "community" ? (
        <section className="community-page-shell">
          <CommunitySideNav view={locationState.communityView} />
          <div className="community-page-main">
            {locationState.communityView === "home" ? (
              <CommunityFeed
                posts={posts}
                onCreatePost={handleCreatePost}
                onLikePost={handleLikePost}
                onRepost={handleRepost}
                onUpdatePost={handleUpdatePost}
                onDeletePost={handleDeletePost}
                commentsByPost={commentsByPost}
                commentLoadingByPost={commentLoadingByPost}
                onToggleComments={handleToggleComments}
                onAddComment={handleAddComment}
                onAddReply={handleAddReply}
                loading={loading.community}
                isLoggedIn={isLoggedIn}
                currentUserId={profile?.user?.user_id || profile?.user?.id || null}
                onLoadMore={loadMoreCommunityFeed}
                hasMore={communityHasMore}
                loadingMore={communityLoadingMore}
              />
            ) : null}
            {locationState.communityView !== "home" ? (
              <AccountHub
                profile={profile}
                isLoggedIn={isLoggedIn}
                onProfileRefresh={loadProfile}
                communityView={locationState.communityView}
              />
            ) : null}
          </div>
        </section>
      ) : null}

      {locationState.route === "login" ? (
        <AuthPanel
          onLogin={handleLogin}
          onRegister={handleRegister}
          onLogout={handleLogout}
          onGoogleContinue={handleGoogleContinue}
          loading={loading.auth}
          profile={profile}
        />
      ) : null}
    </main>
  );
}
