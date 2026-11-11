import React, { useState, useEffect } from "react";
import "../styles/Profile.css";
import {
  User,
  Award,
  Clock,
  Recycle,
  Camera,
  Smartphone,
  DollarSign,
  FileText,
  Tag,
  Save,
  X,
  ShoppingCart,
  Search,
  PlusCircle,
  Edit,
  Trash2,
  AlertCircle,
  Heart,
  Mail,
  Home,
  Star,
  Grid,
  Package,
  Layers,
  MessageSquare,
  Truck,
  MessageCircle,
  Filter,
} from "lucide-react";
import {
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth, storage } from "../firebase/firebase";
import { uploadBytesResumable } from "firebase/storage";

function TechMarketplace() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("buy");
  const [isLoading, setIsLoading] = useState(false);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState({ min: "", max: "" });
  const [conditionFilter, setConditionFilter] = useState("All");
  const [showListingForm, setShowListingForm] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingListing, setEditingListing] = useState(null);
  const [sortOrder, setSortOrder] = useState({
    field: "createdAt",
    direction: "desc",
  });
  const [wishlist, setWishlist] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [viewMode, setViewMode] = useState("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [suggestedDevices, setSuggestedDevices] = useState([]);

  const defaultImage = "https://placehold.co/300x300";

  const [device, setDevice] = useState({
    name: "",
    brand: "",
    condition: "Used",
    price: "",
    description: "",
    image: defaultImage,
    createdAt: new Date(),
    userId: "",
    username: "",
    category: "Smartphone",
    warranty: "None",
    highlights: [],
    rating: 0,
    shipping: "Standard",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setDevice((prev) => ({
          ...prev,
          userId: user.uid,
          username: user.displayName || user.email?.split("@")[0] || "",
        }));

        fetchMyListings(user.uid);
        fetchAvailableDevices(user.uid);
        fetchWishlist(user.uid);
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    if (editingListing) {
      setDevice(editingListing);
      setShowListingForm(true);
      setPreviewMode(false);
    }
  }, [editingListing]);

  useEffect(() => {
    if (currentUser) {
      fetchAvailableDevices(currentUser.uid);
    }
    // eslint-disable-next-line
  }, [currentUser, sortOrder]);

  useEffect(() => {
    if (availableDevices.length > 0 && wishlist.length > 0) {
      const suggestionCandidates = availableDevices.filter(
        (device) => !wishlist.some((item) => item.deviceId === device.id)
      );

      const randomSuggestions = suggestionCandidates
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);

      setSuggestedDevices(randomSuggestions);
    } else if (availableDevices.length > 0) {
      const randomSuggestions = availableDevices
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);

      setSuggestedDevices(randomSuggestions);
    }
  }, [availableDevices, wishlist]);

  const fetchMyListings = async (userId) => {
    try {
      setIsLoading(true);
      const q = query(
        collection(db, "marketplace"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);

      const listings = [];
      querySnapshot.forEach((doc) => {
        listings.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setMyListings(listings);
    } catch (error) {
      console.error("Error fetching listings:", error);
      showErrorNotification("Failed to load your listings");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWishlist = async (userId) => {
    try {
      const q = query(
        collection(db, "wishlist"),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);

      const wishlistItems = [];
      querySnapshot.forEach((doc) => {
        wishlistItems.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setWishlist(wishlistItems);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  const fetchAvailableDevices = async (userId) => {
    try {
      setIsLoading(true);

      // Fetch all devices, order by sortOrder
      let q = query(
        collection(db, "marketplace"),
        orderBy(sortOrder.field, sortOrder.direction)
      );

      const querySnapshot = await getDocs(q);

      let devices = [];
      querySnapshot.forEach((doc) => {
        devices.push({
          id: doc.id,
          ...doc.data(),
          rating: doc.data().rating || (Math.random() * 3 + 2).toFixed(1),
        });
      });

      // Filter out current user's devices
      if (userId) {
        devices = devices.filter((device) => device.userId !== userId);
      }

      // If no devices found in database, add dummy data
      if (devices.length === 0) {
        const dummyDevices = [
          {
            id: "d1",
            name: "iPhone 13 Pro",
            brand: "Apple",
            condition: "Used",
            price: 699.99,
            description:
              "Like new condition with 98% battery health. Includes original box and charger.",
            image:
              "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-13-pro-family-hero?wid=940&hei=1112&fmt=png-alpha&.v=1644969385433",
            createdAt: new Date(Date.now() - 86400000), // 1 day ago
            userId: "dummyUser1",
            username: "techLover42",
            category: "Smartphone",
            warranty: "30 days",
            highlights: [
              "98% battery health",
              "Original accessories included",
              "No scratches or dents",
            ],
            rating: 4.7,
            shipping: "Standard",
          },
          {
            id: "d2",
            name: 'MacBook Pro 14" M1 Pro',
            brand: "Apple",
            condition: "New",
            price: 1799.99,
            description:
              "Brand new sealed in box. 10-core CPU, 16-core GPU, 16GB RAM, 512GB SSD.",
            image:
              "https://www.apple.com/v/macbook-pro-14-and-16/b/images/overview/hero/hero_intro_endframe__e6khcva4hkeq_large.jpg",
            createdAt: new Date(Date.now() - 172800000), // 2 days ago
            userId: "dummyUser2",
            username: "appleFanatic",
            category: "Laptop",
            warranty: "1 year",
            highlights: ["Brand new sealed", "M1 Pro chip", "16GB RAM"],
            rating: 4.9,
            shipping: "Expedited",
          },
          {
            id: "d3",
            name: "Samsung Galaxy S22 Ultra",
            brand: "Samsung",
            condition: "Used",
            price: 799.99,
            description:
              "Excellent condition with minor wear. Includes S Pen and original charger.",
            image:
              "https://images.samsung.com/us/smartphones/galaxy-s22-ultra/buy/S22_Ultra_ProductKV_Burgundy_MO.jpg",
            createdAt: new Date(Date.now() - 259200000), // 3 days ago
            userId: "dummyUser3",
            username: "androidMaster",
            category: "Smartphone",
            warranty: "None",
            highlights: [
              "Includes S Pen",
              "256GB storage",
              "Excellent battery life",
            ],
            rating: 4.5,
            shipping: "Standard",
          },
          {
            id: "d4",
            name: "Sony WH-1000XM4",
            brand: "Sony",
            condition: "Used",
            price: 199.99,
            description:
              "Great noise-cancelling headphones. Comes with carrying case and cable.",
            image:
              "https://www.sony.com/image/5d6e1f4e7623a1d5a9b3b3c3f3b3c3f3?fmt=pjpeg&wid=330&bgcolor=FFFFFF&bgc=FFFFFF",
            createdAt: new Date(Date.now() - 345600000), // 4 days ago
            userId: "dummyUser4",
            username: "audioPhile",
            category: "Accessories",
            warranty: "60 days",
            highlights: [
              "Industry-leading ANC",
              "30-hour battery",
              "Like new condition",
            ],
            rating: 4.8,
            shipping: "Standard",
          },
          {
            id: "d5",
            name: 'iPad Pro 12.9" (2021)',
            brand: "Apple",
            condition: "Damaged",
            price: 499.99,
            description:
              "Screen has minor cracks but fully functional. Includes Apple Pencil 2.",
            image:
              "https://www.apple.com/v/ipad-pro/aj/images/overview/hero/hero_combo__fcqcc3hbzjyy_large.jpg",
            createdAt: new Date(Date.now() - 432000000), // 5 days ago
            userId: "dummyUser5",
            username: "budgetBuyer",
            category: "Tablet",
            warranty: "None",
            highlights: [
              "Includes Apple Pencil",
              "M1 chip",
              "Works perfectly despite cracks",
            ],
            rating: 3.9,
            shipping: "Local Pickup",
          },
          {
            id: "d6",
            name: "Dell XPS 15",
            brand: "Dell",
            condition: "Used",
            price: 1099.99,
            description:
              "2020 model with i7 processor, 16GB RAM, 512GB SSD, 4K touch display.",
            image:
              "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/xps-15-9500/media-gallery/notebook-xps-9500-nt-black-gallery-1.psd?fmt=png-alpha&pscan=auto&scl=1&wid=4000&hei=4000&qlt=100,0&resMode=sharp2&size=4000,4000",
            createdAt: new Date(Date.now() - 518400000), // 6 days ago
            userId: "dummyUser6",
            username: "pcEnthusiast",
            category: "Laptop",
            warranty: "90 days",
            highlights: ["4K touch display", "16GB RAM", "Excellent condition"],
            rating: 4.3,
            shipping: "Standard",
          },
          {
            id: "d7",
            name: "Apple Watch Series 7",
            brand: "Apple",
            condition: "New",
            price: 349.99,
            description: "Brand new in box. GPS model, 45mm, Midnight color.",
            image:
              "https://www.apple.com/v/apple-watch-series-7/c/images/overview/hero/hero_watch__f2j6d7vdieie_large.jpg",
            createdAt: new Date(Date.now() - 604800000), // 7 days ago
            userId: "dummyUser7",
            username: "wearableTech",
            category: "Smartwatch",
            warranty: "1 year",
            highlights: ["Brand new", "45mm size", "Includes all accessories"],
            rating: 4.6,
            shipping: "Expedited",
          },
          {
            id: "d8",
            name: "AirPods Pro (2nd Gen)",
            brand: "Apple",
            condition: "Used",
            price: 159.99,
            description:
              "Lightly used with all original accessories. Excellent battery life.",
            image:
              "https://www.apple.com/v/airpods-pro/c/images/overview/hero__gnfk5g59t0qe_large.jpg",
            createdAt: new Date(Date.now() - 691200000), // 8 days ago
            userId: "dummyUser8",
            username: "audioDeals",
            category: "Accessories",
            warranty: "30 days",
            highlights: [
              "Active Noise Cancellation",
              "Like new",
              "All accessories included",
            ],
            rating: 4.4,
            shipping: "Standard",
          },
        ];

        devices.push(...dummyDevices);
      }

      setAvailableDevices(devices);
    } catch (error) {
      console.error("Error fetching available devices:", error);
      showErrorNotification("Failed to load available devices");
    } finally {
      setIsLoading(false);
    }
  };

  const showErrorNotification = (message) => {
    setNotification(
      <div className="error-notification">
        <AlertCircle size={18} />
        <span>{message}</span>
      </div>
    );
  };

  const showSuccessNotification = (message) => {
    setNotification(
      <div className="success-notification">
        <div className="success-icon">✓</div>
        <span>{message}</span>
      </div>
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "price" && value < 0) return;

    setDevice({
      ...device,
      [name]:
        name === "price" ? (value === "" ? "" : parseFloat(value)) : value,
    });
  };

  const handleHighlightChange = (index, value) => {
    const newHighlights = [...(device.highlights || [])];
    newHighlights[index] = value;
    setDevice({ ...device, highlights: newHighlights });
  };

  const addHighlight = () => {
    setDevice({
      ...device,
      highlights: [...(device.highlights || []), ""],
    });
  };

  const removeHighlight = (index) => {
    const newHighlights = [...(device.highlights || [])];
    newHighlights.splice(index, 1);
    setDevice({ ...device, highlights: newHighlights });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // start loading state
    setIsLoading(true);
    setUploadProgress(0);

    // build a unique filename
    const timestamp = Date.now();
    const fileName = `${file.name.split(".")[0]}_${timestamp}`;
    const storageRef = ref(storage, `devices/${currentUser.uid}/${fileName}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // update a progress bar if you have one
        const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(Math.round(pct));
      },
      (error) => {
        console.error("Upload failed:", error);
        showErrorNotification("Image upload failed");
        setIsLoading(false);
      },
      async () => {
        // on complete, get the public download URL
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        // save it into your device state so handleSubmit will write it to Firestore
        setDevice((prev) => ({ ...prev, image: downloadURL }));
        showSuccessNotification("Image uploaded!");
        setIsLoading(false);
        // reset progress after a short delay
        setTimeout(() => setUploadProgress(0), 1000);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      showErrorNotification("You must be logged in to submit a listing");
      return;
    }

    if (!device.name || !device.brand || !device.price) {
      showErrorNotification("Please fill in all required fields");
      return;
    }

    if (device.description.length > 500) {
      showErrorNotification("Description must be 500 characters or less");
      return;
    }

    setIsLoading(true);

    try {
      const deviceData = {
        ...device,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        userId: currentUser.uid,
        username:
          currentUser.displayName || currentUser.email?.split("@")[0] || "",
      };

      if (editingListing) {
        await updateDoc(doc(db, "marketplace", editingListing.id), deviceData);
        showSuccessNotification("Device updated successfully!");
      } else {
        await addDoc(collection(db, "marketplace"), deviceData);
        showSuccessNotification("Device listed successfully!");
      }

      setDevice({
        name: "",
        brand: "",
        condition: "Used",
        price: "",
        description: "",
        image: defaultImage,
        userId: currentUser.uid,
        username:
          currentUser.displayName || currentUser.email?.split("@")[0] || "",
        createdAt: null,
        category: "Smartphone",
        warranty: "None",
        highlights: [],
        rating: 0,
        shipping: "Standard",
      });

      fetchMyListings(currentUser.uid);
      setPreviewMode(false);
      setShowListingForm(false);
      setEditingListing(null);
    } catch (error) {
      showErrorNotification(`Error saving device: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (deviceId) => {
    try {
      setIsLoading(true);

      const deviceRef = doc(db, "marketplace", deviceId);
      const deviceSnap = await getDoc(deviceRef);

      if (deviceSnap.exists()) {
        const deviceData = deviceSnap.data();

        if (deviceData.image && !deviceData.image.includes("placehold.co")) {
          try {
            const imageRef = ref(storage, deviceData.image);
            await deleteObject(imageRef);
          } catch (imageError) {
            console.error("Error deleting image:", imageError);
          }
        }

        await deleteDoc(deviceRef);
        showSuccessNotification("Device deleted successfully!");
        fetchMyListings(currentUser.uid);
      }
    } catch (error) {
      showErrorNotification(`Error deleting device: ${error.message}`);
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
      setDeviceToDelete(null);
    }
  };

  const addToWishlist = async (device) => {
    if (!currentUser) {
      showErrorNotification("You must be logged in to use the wishlist");
      return;
    }

    try {
      const isInWishlist = wishlist.some((item) => item.deviceId === device.id);

      if (isInWishlist) {
        const wishlistItem = wishlist.find(
          (item) => item.deviceId === device.id
        );
        await deleteDoc(doc(db, "wishlist", wishlistItem.id));
        showSuccessNotification("Removed from wishlist!");
      } else {
        await addDoc(collection(db, "wishlist"), {
          userId: currentUser.uid,
          deviceId: device.id,
          deviceName: device.name,
          devicePrice: device.price,
          deviceImage: device.image,
          sellerId: device.userId,
          sellerName: device.username,
          createdAt: serverTimestamp(),
        });
        showSuccessNotification("Added to wishlist!");
      }

      fetchWishlist(currentUser.uid);
    } catch (error) {
      showErrorNotification(`Error updating wishlist: ${error.message}`);
    }
  };

  const handleContactSeller = (device) => {
    if (!currentUser) {
      showErrorNotification("You must be logged in to contact sellers");
      return;
    }
    setSelectedDevice(device);
    setShowContactModal(true);
  };

  const sendContactMessage = async () => {
    try {
      if (!contactMessage.trim()) {
        showErrorNotification("Please enter a message");
        return;
      }

      await addDoc(collection(db, "messages"), {
        fromUserId: currentUser.uid,
        fromUserName:
          currentUser.displayName || currentUser.email?.split("@")[0] || "",
        toUserId: selectedDevice.userId,
        toUserName: selectedDevice.username,
        message: contactMessage,
        deviceId: selectedDevice.id,
        deviceName: selectedDevice.name,
        createdAt: serverTimestamp(),
        read: false,
      });

      showSuccessNotification(`Message sent to ${selectedDevice.username}!`);
      setShowContactModal(false);
      setContactMessage("");
      setSelectedDevice(null);
    } catch (error) {
      showErrorNotification(`Error sending message: ${error.message}`);
    }
  };

  const togglePreview = () => {
    if (!device.name || !device.brand || !device.price) {
      showErrorNotification("Please fill in all required fields");
      return;
    }
    setPreviewMode(!previewMode);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePriceFilterChange = (e) => {
    const { name, value } = e.target;
    setPriceFilter({
      ...priceFilter,
      [name]: value === "" ? "" : parseFloat(value),
    });
  };

  const handleConditionFilterChange = (e) => {
    setConditionFilter(e.target.value);
  };

  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
  };

  const handleSortChange = (field) => {
    setSortOrder((prev) => ({
      field,
      direction:
        prev.field === field
          ? prev.direction === "asc"
            ? "desc"
            : "asc"
          : "desc",
    }));

    if (currentUser) {
      fetchAvailableDevices(currentUser.uid);
    }
  };

  const handleEditListing = (listing) => {
    setEditingListing(listing);
  };

  const confirmDelete = (device) => {
    setDeviceToDelete(device);
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeviceToDelete(null);
  };

  const filteredDevices = availableDevices.filter((device) => {
    const matchesSearch =
      device.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPrice =
      (priceFilter.min === "" || device.price >= priceFilter.min) &&
      (priceFilter.max === "" || device.price <= priceFilter.max);

    const matchesCondition =
      conditionFilter === "All" || device.condition === conditionFilter;

    const matchesCategory =
      categoryFilter === "All" || device.category === categoryFilter;

    return matchesSearch && matchesPrice && matchesCondition && matchesCategory;
  });

  const conditionIcons = {
    New: <Award className="condition-icon new" />,
    Used: <Clock className="condition-icon used" />,
    Damaged: <Recycle className="condition-icon damaged" />,
  };

  const categoryIcons = {
    Smartphone: <Smartphone size={18} />,
    Tablet: <Layers size={18} />,
    Laptop: <Package size={18} />,
    Desktop: <Home size={18} />,
    Smartwatch: <Clock size={18} />,
    Accessories: <Tag size={18} />,
    Other: <Package size={18} />,
  };

  const getConditionClass = (condition) => {
    return condition ? condition.toLowerCase().replace(/\s+/g, "-") : "used";
  };

  const handleImageError = (e) => {
    e.target.src = defaultImage;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Just now";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString();
    } catch {
      return "Just now";
    }
  };

  const isInWishlist = (deviceId) => {
    return wishlist.some((item) => item.deviceId === deviceId);
  };

  const renderStarRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} size={16} fill="gold" stroke="gold" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star
            key={i}
            size={16}
            fill="gold"
            stroke="gold"
            className="half-star"
          />
        );
      } else {
        stars.push(<Star key={i} size={16} fill="none" stroke="#ccc" />);
      }
    }

    return (
      <div className="star-rating">
        {stars} <span className="rating-number">({rating})</span>
      </div>
    );
  };

  return (
    <div className="techmarketplace-app">
      {notification && (
        <div className="notification-container">{notification}</div>
      )}

      <header className="marketplace-header">
        <div className="header-container">
          <div className="logo-search">
            <div className="marketplace-logo">
              <Package size={28} />
              <h1>TechMarket</h1>
            </div>
            <div className="global-search">
              <input
                type="text"
                placeholder="Search devices, brands, and more..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <button className="search-button">
                <Search size={22} />
              </button>
            </div>
          </div>
          <nav className="main-navigation">
            <button
              className={`nav-link ${activeTab === "buy" ? "active" : ""}`}
              onClick={() => setActiveTab("buy")}
            >
              <ShoppingCart size={20} />
              <span>Marketplace</span>
            </button>
            <button
              className={`nav-link ${activeTab === "sell" ? "active" : ""}`}
              onClick={() => setActiveTab("sell")}
            >
              <Tag size={20} />
              <span>Sell</span>
            </button>
            <button
              className={`nav-link ${activeTab === "wishlist" ? "active" : ""}`}
              onClick={() => setActiveTab("wishlist")}
            >
              <Heart size={20} />
              <span>Wishlist</span>
            </button>
            <div className="user-actions">
              <button className="user-button">
                <User size={20} />
                <span>
                  {currentUser
                    ? currentUser.displayName || "Account"
                    : "Sign In"}
                </span>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {activeTab === "buy" && (
        <div className="marketplace-container">
          <div className="marketplace-layout">
            <aside
              className={`filters-sidebar ${
                showMobileFilters ? "show-mobile" : ""
              }`}
            >
              <div className="filter-section">
                <h3>Categories</h3>
                <div className="filter-options">
                  <div className="category-option">
                    <input
                      type="radio"
                      id="cat-all"
                      name="category"
                      checked={categoryFilter === "All"}
                      onChange={() => setCategoryFilter("All")}
                    />
                    <label htmlFor="cat-all">
                      <Grid size={16} />
                      All Categories
                    </label>
                  </div>
                  <div className="category-option">
                    <input
                      type="radio"
                      id="cat-smartphone"
                      name="category"
                      checked={categoryFilter === "Smartphone"}
                      onChange={() => setCategoryFilter("Smartphone")}
                    />
                    <label htmlFor="cat-smartphone">
                      <Smartphone size={16} />
                      Smartphones
                    </label>
                  </div>
                  <div className="category-option">
                    <input
                      type="radio"
                      id="cat-tablet"
                      name="category"
                      checked={categoryFilter === "Tablet"}
                      onChange={() => setCategoryFilter("Tablet")}
                    />
                    <label htmlFor="cat-tablet">
                      <Layers size={16} />
                      Tablets
                    </label>
                  </div>
                  <div className="category-option">
                    <input
                      type="radio"
                      id="cat-laptop"
                      name="category"
                      checked={categoryFilter === "Laptop"}
                      onChange={() => setCategoryFilter("Laptop")}
                    />
                    <label htmlFor="cat-laptop">
                      <Package size={16} />
                      Laptops
                    </label>
                  </div>
                  <div className="category-option">
                    <input
                      type="radio"
                      id="cat-desktop"
                      name="category"
                      checked={categoryFilter === "Desktop"}
                      onChange={() => setCategoryFilter("Desktop")}
                    />
                    <label htmlFor="cat-desktop">
                      <Home size={16} />
                      Desktops
                    </label>
                  </div>
                  <div className="category-option">
                    <input
                      type="radio"
                      id="cat-smartwatch"
                      name="category"
                      checked={categoryFilter === "Smartwatch"}
                      onChange={() => setCategoryFilter("Smartwatch")}
                    />
                    <label htmlFor="cat-smartwatch">
                      <Clock size={16} />
                      Smartwatches
                    </label>
                  </div>
                  <div className="category-option">
                    <input
                      type="radio"
                      id="cat-accessories"
                      name="category"
                      checked={categoryFilter === "Accessories"}
                      onChange={() => setCategoryFilter("Accessories")}
                    />
                    <label htmlFor="cat-accessories">
                      <Tag size={16} />
                      Batteries
                    </label>
                  </div>
                </div>
              </div>

              <div className="filter-section">
                <h3>Price Range</h3>
                <div className="price-range">
                  <div className="price-input">
                    <span>$</span>
                    <input
                      type="number"
                      placeholder="Min"
                      name="min"
                      value={priceFilter.min}
                      onChange={handlePriceFilterChange}
                    />
                  </div>
                  <span className="price-separator">to</span>
                  <div className="price-input">
                    <span>$</span>
                    <input
                      type="number"
                      placeholder="Max"
                      name="max"
                      value={priceFilter.max}
                      onChange={handlePriceFilterChange}
                    />
                  </div>
                </div>
              </div>

              <div className="filter-section">
                <h3>Condition</h3>
                <div className="condition-options">
                  <div className="condition-option">
                    <input
                      type="radio"
                      id="cond-all"
                      name="condition"
                      checked={conditionFilter === "All"}
                      onChange={() => setConditionFilter("All")}
                    />
                    <label htmlFor="cond-all">All Conditions</label>
                  </div>
                  <div className="condition-option">
                    <input
                      type="radio"
                      id="cond-new"
                      name="condition"
                      checked={conditionFilter === "New"}
                      onChange={() => setConditionFilter("New")}
                    />
                    <label htmlFor="cond-new" className="condition-new">
                      <Award size={16} /> New
                    </label>
                  </div>
                  <div className="condition-option">
                    <input
                      type="radio"
                      id="cond-used"
                      name="condition"
                      checked={conditionFilter === "Used"}
                      onChange={() => setConditionFilter("Used")}
                    />
                    <label htmlFor="cond-used" className="condition-used">
                      <Clock size={16} /> Used
                    </label>
                  </div>
                  <div className="condition-option">
                    <input
                      type="radio"
                      id="cond-damaged"
                      name="condition"
                      checked={conditionFilter === "Damaged"}
                      onChange={() => setConditionFilter("Damaged")}
                    />
                    <label htmlFor="cond-damaged" className="condition-damaged">
                      <Recycle size={16} /> Damaged
                    </label>
                  </div>
                </div>
              </div>

              <div className="filter-actions">
                <button
                  className="clear-filters"
                  onClick={() => {
                    setSearchTerm("");
                    setPriceFilter({ min: "", max: "" });
                    setConditionFilter("All");
                    setCategoryFilter("All");
                  }}
                >
                  Clear All Filters
                </button>
                <button
                  className="close-filters"
                  onClick={() => setShowMobileFilters(false)}
                >
                  Done
                </button>
              </div>
            </aside>

            <main className="marketplace-content">
              <div className="marketplace-banner">
                <div className="banner-content">
                  <h2>Find Amazing Tech Deals</h2>
                  <p>
                    Browse thousands of pre-owned devices at unbeatable prices
                  </p>
                  <button className="banner-button">Discover Now</button>
                </div>
              </div>

              <div className="marketplace-controls">
                <div className="results-info">
                  <span>{filteredDevices.length} results</span>
                  <button
                    className="filter-toggle"
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                  >
                    <Filter size={16} /> Filters
                  </button>
                </div>
                <div className="view-controls">
                  <div className="sort-dropdown">
                    <label htmlFor="sort-select">Sort by:</label>
                    <select
                      id="sort-select"
                      onChange={(e) => {
                        const [field, direction] = e.target.value.split("-");
                        setSortOrder({ field, direction });
                        fetchAvailableDevices(currentUser?.uid);
                      }}
                      value={`${sortOrder.field}-${sortOrder.direction}`}
                    >
                      <option value="createdAt-desc">Newest First</option>
                      <option value="createdAt-asc">Oldest First</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                    </select>
                  </div>
                  <div className="view-mode">
                    <button
                      className={`view-button ${
                        viewMode === "grid" ? "active" : ""
                      }`}
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid size={16} />
                    </button>
                    <button
                      className={`view-button ${
                        viewMode === "list" ? "active" : ""
                      }`}
                      onClick={() => setViewMode("list")}
                    >
                      <Layers size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading devices...</p>
                </div>
              ) : filteredDevices.length === 0 ? (
                <div className="empty-state">
                  <Package size={48} />
                  <h3>No devices found</h3>
                  <p>Try adjusting your filters or search term</p>
                  <button
                    className="clear-filters"
                    onClick={() => {
                      setSearchTerm("");
                      setPriceFilter({ min: "", max: "" });
                      setConditionFilter("All");
                      setCategoryFilter("All");
                    }}
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className={`device-grid ${viewMode}`}>
                  {filteredDevices.map((device) => (
                    <div key={device.id} className="device-card">
                      <div className="device-image-container">
                        <img
                          src={device.image || defaultImage}
                          alt={device.name}
                          onError={handleImageError}
                        />
                        <button
                          className={`wishlist-button ${
                            isInWishlist(device.id) ? "active" : ""
                          }`}
                          onClick={() => addToWishlist(device)}
                        >
                          <Heart
                            size={20}
                            fill={
                              isInWishlist(device.id) ? "currentColor" : "none"
                            }
                          />
                        </button>
                        <div
                          className={`device-condition ${getConditionClass(
                            device.condition
                          )}`}
                        >
                          {conditionIcons[device.condition] ||
                            conditionIcons.Used}
                          <span>{device.condition}</span>
                        </div>
                      </div>
                      <div className="device-info">
                        <div className="device-category">
                          {categoryIcons[device.category] ||
                            categoryIcons.Other}
                          <span>{device.category}</span>
                        </div>
                        <h3 className="device-name">{device.name}</h3>
                        <div className="device-brand">{device.brand}</div>
                        {renderStarRating(device.rating)}
                        <div className="device-highlights">
                          {device.highlights
                            ?.slice(0, 2)
                            .map((highlight, i) => (
                              <div key={i} className="highlight">
                                <span>•</span> {highlight}
                              </div>
                            ))}
                        </div>
                        <div className="device-footer">
                          <div className="device-price">
                            <DollarSign size={16} />
                            <span>
                              {(Number(device.price) || 0).toFixed(2)}
                            </span>
                          </div>
                          <button
                            className="contact-button"
                            onClick={() => handleContactSeller(device)}
                          >
                            <MessageCircle size={16} />
                            <span>Contact</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {suggestedDevices.length > 0 && (
                <div className="suggested-section">
                  <h3>You might also like</h3>
                  <div className="suggested-grid">
                    {suggestedDevices.map((device) => (
                      <div key={device.id} className="suggested-card">
                        <img
                          src={device.image || defaultImage}
                          alt={device.name}
                          onError={handleImageError}
                        />
                        <div className="suggested-info">
                          <h4>{device.name}</h4>
                          <div className="suggested-price">
                            <DollarSign size={14} />
                            {(Number(device.price) || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      )}

      {activeTab === "sell" && (
        <div className="sell-container">
          <div className="sell-header">
            <h2>List a Device for Sale</h2>
            <p>
              Fill out the form below to list your device in the marketplace
            </p>
          </div>

          <div className="sell-content">
            {!showListingForm ? (
              <div className="sell-actions">
                <button
                  className="primary-button"
                  onClick={() => setShowListingForm(true)}
                >
                  <PlusCircle size={18} />
                  <span>Create New Listing</span>
                </button>

                {myListings.length > 0 && (
                  <div className="my-listings">
                    <h3>Your Current Listings</h3>
                    <div className="listings-grid">
                      {myListings.map((listing) => (
                        <div key={listing.id} className="listing-card">
                          <img
                            src={listing.image || defaultImage}
                            alt={listing.name}
                            onError={handleImageError}
                          />
                          <div className="listing-info">
                            <h4>{listing.name}</h4>
                            <div className="listing-price">
                              <DollarSign size={14} />
                              {listing.price?.toFixed(2) || "0.00"}
                            </div>
                            <div className="listing-status">
                              <span
                                className={`status ${getConditionClass(
                                  listing.condition
                                )}`}
                              >
                                {listing.condition}
                              </span>
                              <span className="listing-date">
                                Listed {formatDate(listing.createdAt)}
                              </span>
                            </div>
                          </div>
                          <div className="listing-actions">
                            <button
                              className="edit-button"
                              onClick={() => handleEditListing(listing)}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="delete-button"
                              onClick={() => confirmDelete(listing)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="listing-form-container">
                <form onSubmit={handleSubmit} className="device-form">
                  <div className="form-header">
                    <h3>
                      {editingListing ? "Edit Listing" : "Create New Listing"}
                    </h3>
                    <div className="form-actions">
                      <button
                        type="button"
                        className="preview-button"
                        onClick={togglePreview}
                      >
                        {previewMode ? "Back to Edit" : "Preview"}
                      </button>
                      <button
                        type="button"
                        className="cancel-button"
                        onClick={() => {
                          setShowListingForm(false);
                          setEditingListing(null);
                          setDevice({
                            name: "",
                            brand: "",
                            condition: "Used",
                            price: "",
                            description: "",
                            image: defaultImage,
                            userId: currentUser?.uid || "",
                            username:
                              currentUser?.displayName ||
                              currentUser?.email?.split("@")[0] ||
                              "",
                            createdAt: new Date(),
                            category: "Smartphone",
                            warranty: "None",
                            highlights: [],
                            rating: 0,
                            shipping: "Standard",
                          });
                          setPreviewMode(false);
                        }}
                      >
                        <X size={18} />
                        <span>Cancel</span>
                      </button>
                      <button type="submit" className="submit-button">
                        {isLoading ? (
                          <div className="spinner"></div>
                        ) : (
                          <>
                            <Save size={18} />
                            <span>{editingListing ? "Update" : "Publish"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {previewMode ? (
                    <div className="device-preview">
                      <div className="preview-card">
                        <div className="preview-image-container">
                          <img
                            src={device.image || defaultImage}
                            alt={device.name}
                            onError={handleImageError}
                          />
                          <div
                            className={`device-condition ${getConditionClass(
                              device.condition
                            )}`}
                          >
                            {conditionIcons[device.condition] ||
                              conditionIcons.Used}
                            <span>{device.condition}</span>
                          </div>
                        </div>
                        <div className="preview-info">
                          <div className="preview-category">
                            {categoryIcons[device.category] ||
                              categoryIcons.Other}
                            <span>{device.category}</span>
                          </div>
                          <h3 className="preview-name">{device.name}</h3>
                          <div className="preview-brand">{device.brand}</div>
                          <div className="preview-description">
                            {device.description || "No description provided"}
                          </div>
                          <div className="preview-highlights">
                            {device.highlights?.length > 0 ? (
                              device.highlights.map((highlight, i) => (
                                <div key={i} className="highlight">
                                  <span>•</span> {highlight}
                                </div>
                              ))
                            ) : (
                              <div className="no-highlights">
                                No highlights added
                              </div>
                            )}
                          </div>
                          <div className="preview-footer">
                            <div className="preview-price">
                              <DollarSign size={18} />
                              <span>
                                {(Number(device.price) || 0).toFixed(2)}
                              </span>
                            </div>
                            <div className="preview-meta">
                              <div className="meta-item">
                                <Truck size={16} />
                                <span>{device.shipping}</span>
                              </div>
                              <div className="meta-item">
                                <FileText size={16} />
                                <span>{device.warranty}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="form-sections">
                      <div className="form-section">
                        <h4>Basic Information</h4>
                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="name">Device Name*</label>
                            <input
                              type="text"
                              id="name"
                              name="name"
                              value={device.name}
                              onChange={handleChange}
                              placeholder="e.g. iPhone 13 Pro"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor="brand">Brand*</label>
                            <input
                              type="text"
                              id="brand"
                              name="brand"
                              value={device.brand}
                              onChange={handleChange}
                              placeholder="e.g. Apple"
                              required
                            />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="category">Category*</label>
                            <select
                              id="category"
                              name="category"
                              value={device.category}
                              onChange={handleChange}
                              required
                            >
                              <option value="Smartphone">Smartphone</option>
                              <option value="Tablet">Tablet</option>
                              <option value="Laptop">Laptop</option>
                              <option value="Desktop">Desktop</option>
                              <option value="Smartwatch">Smartwatch</option>
                              <option value="Accessories">Accessories</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label htmlFor="condition">Condition*</label>
                            <select
                              id="condition"
                              name="condition"
                              value={device.condition}
                              onChange={handleChange}
                              required
                            >
                              <option value="New">New</option>
                              <option value="Used">Used</option>
                              <option value="Damaged">Damaged</option>
                            </select>
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor="price">Price ($)*</label>
                            <div className="price-input">
                              <DollarSign size={18} />
                              <input
                                type="number"
                                id="price"
                                name="price"
                                value={device.price}
                                onChange={handleChange}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                required
                              />
                            </div>
                          </div>
                          <div className="form-group">
                            <label htmlFor="warranty">Warranty</label>
                            <select
                              id="warranty"
                              name="warranty"
                              value={device.warranty}
                              onChange={handleChange}
                            >
                              <option value="None">None</option>
                              <option value="30 days">30 days</option>
                              <option value="60 days">60 days</option>
                              <option value="90 days">90 days</option>
                              <option value="1 year">1 year</option>
                              <option value="Manufacturer">Manufacturer</option>
                            </select>
                          </div>
                        </div>
                        <div className="form-group">
                          <label htmlFor="shipping">Shipping Options</label>
                          <select
                            id="shipping"
                            name="shipping"
                            value={device.shipping}
                            onChange={handleChange}
                          >
                            <option value="Standard">
                              Standard (3-5 days)
                            </option>
                            <option value="Expedited">
                              Expedited (1-2 days)
                            </option>
                            <option value="Local Pickup">
                              Local Pickup Only
                            </option>
                          </select>
                        </div>
                      </div>

                      <div className="form-section">
                        <h4>Device Image</h4>
                        <div className="image-upload">
                          <div className="image-preview">
                            <img
                              src={device.image || defaultImage}
                              alt="Preview"
                              onError={handleImageError}
                            />
                            {uploadProgress > 0 && uploadProgress < 100 && (
                              <div className="upload-progress">
                                <div
                                  className="progress-bar"
                                  style={{ width: `${uploadProgress}%` }}
                                ></div>
                                <span>{uploadProgress}%</span>
                              </div>
                            )}
                          </div>
                          <div className="upload-actions">
                            <input
                              type="file"
                              id="device-image"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="file-input"
                            />
                            <label
                              htmlFor="device-image"
                              className="upload-button"
                            >
                              <Camera size={16} />
                              <span>Upload Image</span>
                            </label>
                            <button
                              type="button"
                              className="remove-image"
                              onClick={() =>
                                setDevice({ ...device, image: defaultImage })
                              }
                              disabled={
                                !device.image || device.image === defaultImage
                              }
                            >
                              <X size={16} />
                              <span>Remove</span>
                            </button>
                          </div>
                          <p className="upload-hint">
                            Recommended size: 800x800px (max 5MB)
                          </p>
                        </div>
                      </div>

                      <div className="form-section">
                        <h4>Description & Details</h4>
                        <div className="form-group">
                          <label htmlFor="description">Description*</label>
                          <textarea
                            id="description"
                            name="description"
                            value={device.description}
                            onChange={handleChange}
                            placeholder="Describe your device in detail..."
                            rows="5"
                            maxLength="500"
                            required
                          />
                          <div className="character-count">
                            {device.description?.length || 0}/500 characters
                          </div>
                        </div>

                        <div className="highlights-section">
                          <label>Key Highlights</label>
                          {device.highlights?.map((highlight, index) => (
                            <div key={index} className="highlight-input">
                              <input
                                type="text"
                                value={highlight}
                                onChange={(e) =>
                                  handleHighlightChange(index, e.target.value)
                                }
                                placeholder="Enter a highlight (e.g. 'Like new condition')"
                              />
                              <button
                                type="button"
                                className="remove-highlight"
                                onClick={() => removeHighlight(index)}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            className="add-highlight"
                            onClick={addHighlight}
                          >
                            <PlusCircle size={16} />
                            <span>Add Highlight</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "wishlist" && (
        <div className="wishlist-container">
          <div className="wishlist-header">
            <h2>Your Wishlist</h2>
            <p>Your saved devices and price alerts</p>
          </div>

          {wishlist.length === 0 ? (
            <div className="empty-wishlist">
              <Heart size={48} />
              <h3>Your wishlist is empty</h3>
              <p>
                Save devices you're interested in by clicking the heart icon
              </p>
              <button
                className="browse-button"
                onClick={() => setActiveTab("buy")}
              >
                <ShoppingCart size={18} />
                <span>Browse Marketplace</span>
              </button>
            </div>
          ) : (
            <div className="wishlist-grid">
              {wishlist.map((item) => {
                const device =
                  availableDevices.find((d) => d.id === item.deviceId) || item;
                return (
                  <div key={item.id} className="wishlist-card">
                    <div className="wishlist-image">
                      <img
                        src={device.deviceImage || device.image || defaultImage}
                        alt={device.deviceName || device.name}
                        onError={handleImageError}
                      />
                    </div>
                    <div className="wishlist-info">
                      <h3>{device.deviceName || device.name}</h3>
                      <div className="wishlist-price">
                        <DollarSign size={16} />
                        <span>
                          {Number(
                            device.devicePrice ?? device.price ?? 0
                          ).toFixed(2)}
                        </span>
                      </div>
                      <div className="wishlist-seller">
                        <User size={14} />
                        <span>{device.sellerName || device.username}</span>
                      </div>
                    </div>
                    <div className="wishlist-actions">
                      <button
                        className="contact-button"
                        onClick={() => {
                          const fullDevice = availableDevices.find(
                            (d) => d.id === item.deviceId
                          );
                          if (fullDevice) {
                            handleContactSeller(fullDevice);
                          }
                        }}
                      >
                        <MessageSquare size={16} />
                        <span>Contact</span>
                      </button>
                      <button
                        className="remove-button"
                        onClick={() => addToWishlist(device)}
                      >
                        <Trash2 size={16} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {showContactModal && selectedDevice && (
        <div className="modal-overlay">
          <div className="contact-modal">
            <div className="modal-header">
              <h3>Contact Seller</h3>
              <button
                className="close-modal"
                onClick={() => {
                  setShowContactModal(false);
                  setContactMessage("");
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="device-info">
                <img
                  src={selectedDevice.image || defaultImage}
                  alt={selectedDevice.name}
                  onError={handleImageError}
                />
                <div>
                  <h4>{selectedDevice.name}</h4>
                  <div className="device-price">
                    <DollarSign size={16} />
                    <span>
                      {(Number(selectedDevice?.price) || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="contact-message">Your Message*</label>
                <textarea
                  id="contact-message"
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder={`Hi ${selectedDevice.username}, I'm interested in your ${selectedDevice.name}...`}
                  rows="5"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="cancel-button"
                onClick={() => {
                  setShowContactModal(false);
                  setContactMessage("");
                }}
              >
                Cancel
              </button>
              <button
                className="send-button"
                onClick={sendContactMessage}
                disabled={!contactMessage.trim()}
              >
                <Mail size={16} />
                <span>Send Message</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && deviceToDelete && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <div className="modal-header">
              <h3>Confirm Delete</h3>
            </div>
            <div className="modal-body">
              <AlertCircle size={48} className="warning-icon" />
              <p>Are you sure you want to delete this listing?</p>
              <p className="warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={cancelDelete}>
                Cancel
              </button>
              <button
                className="delete-button"
                onClick={() => handleDelete(deviceToDelete.id)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="spinner"></div>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>Delete Listing</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TechMarketplace;
