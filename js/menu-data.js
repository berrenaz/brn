(function (global) {
  const COLLECTION = "items";
  const CATEGORIES = [
    { id: "kahvalti", title: "Kahvaltı" },
    { id: "kruvasan", title: "Kruvasan" },
    { id: "tatlilar", title: "Tatlılar" },
    { id: "icecekler", title: "İçecekler" },
    { id: "kahveler", title: "Sıcak Kahveler" },
    { id: "frozen", title: "Frozen & Milkshake" },
  ];

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatPrice(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return "₺0";
    return "₺" + amount.toLocaleString("tr-TR");
  }

  function normalizeItem(data, id) {
    const raw = data || {};
    return {
      id: raw.id || id || "",
      category: raw.category || "",
      name: raw.name || "",
      price: Number(raw.price) || 0,
      description: raw.description || "",
      tags: Array.isArray(raw.tags) ? raw.tags.filter(Boolean) : [],
      imagePath: raw.imagePath || "",
      imageUrl: raw.imageUrl || "",
      featured: Boolean(raw.featured),
      order: Number(raw.order) || 0,
    };
  }

  function firestoreReady() {
    return typeof firebase !== "undefined"
      && firebase.apps
      && firebase.apps.length
      && typeof firebase.firestore === "function";
  }

  async function loadFromFirestore() {
    if (!firestoreReady()) return null;
    try {
      const snap = await firebase.firestore().collection(COLLECTION).get();
      if (snap.empty) return [];
      return snap.docs
        .map((doc) => normalizeItem(doc.data(), doc.id))
        .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, "tr"));
    } catch (error) {
      console.warn("Firestore menü okunamadı", error);
      return null;
    }
  }

  async function loadFromJson(jsonUrl) {
    const res = await fetch(jsonUrl, { cache: "no-store" });
    if (!res.ok) throw new Error("menu.json yüklenemedi");
    const data = await res.json();
    return (data.items || [])
      .map((item) => normalizeItem(item, item.id))
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, "tr"));
  }

  async function loadMenu(options) {
    const jsonUrl = (options && options.jsonUrl) || "data/menu.json";
    const fromStore = await loadFromFirestore();
    if (fromStore && fromStore.length) {
      return { items: fromStore, source: "firestore" };
    }
    try {
      const items = await loadFromJson(jsonUrl);
      return {
        items,
        source: fromStore ? "json-empty-store" : "json",
      };
    } catch (error) {
      return { items: [], source: "none", error };
    }
  }

  global.HazeluneMenu = {
    COLLECTION,
    CATEGORIES,
    escapeHtml,
    formatPrice,
    normalizeItem,
    loadFromFirestore,
    loadFromJson,
    loadMenu,
  };
})(window);
