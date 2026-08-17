(function () {
  const api = window.HazeluneMenu;
  const banner = document.getElementById("panelBanner");
  const tabs = document.getElementById("panelTabs");
  const list = document.getElementById("panelList");
  const seedBtn = document.getElementById("seedBtn");
  if (!api || !banner || !tabs || !list) return;

  const JSON_URL = "../data/menu.json";
  const ALLOWED_EXT = ["jpg", "jpeg", "png", "webp", "gif"];
  const MAX_BYTES = 8 * 1024 * 1024;

  let items = [];
  let activeCategory = api.CATEGORIES[0].id;
  let started = false;

  function showBanner(message, kind) {
    banner.hidden = !message;
    banner.className = "banner" + (kind ? " " + kind : "");
    banner.innerHTML = message || "";
  }

  function previewSrc(item) {
    if (item.imageUrl) return item.imageUrl;
    if (item.imagePath) return "../" + item.imagePath;
    return "";
  }

  function fileExt(name) {
    const ext = String(name || "").split(".").pop().toLowerCase();
    return ALLOWED_EXT.includes(ext) ? ext : "jpg";
  }

  function parseTags(value) {
    return String(value || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  function friendlyError(error) {
    const code = error && error.code;
    if (code === "permission-denied") {
      return "Firebase izin vermedi. Firestore ve Storage kurallarını README’deki gibi yapıştır.";
    }
    if (code === "unavailable" || code === "failed-precondition") {
      return "Firestore henüz açık değil. Firebase Console → Build → Firestore Database → Create database.";
    }
    if (String(code || "").startsWith("storage/")) {
      return "Fotoğraf yüklenemedi. Firebase Console → Storage’ı aç ve kuralları yapıştır.";
    }
    return (error && error.message) || "İşlem tamamlanamadı.";
  }

  async function loadItems() {
    const stored = await api.loadFromFirestore();
    if (stored && stored.length) {
      items = stored;
      seedBtn.hidden = true;
      showBanner("Menü Firebase’den geldi. Değiştirip Kaydet dersen sitede görünür.", "ok");
      return;
    }
    if (stored && stored.length === 0) {
      items = await api.loadFromJson(JSON_URL);
      seedBtn.hidden = false;
      showBanner("Menü henüz Firebase’e yüklenmedi. Önce <strong>Menüyü yükle</strong>’ye bas.", "warn");
      return;
    }
    try {
      items = await api.loadFromJson(JSON_URL);
    } catch (error) {
      items = [];
    }
    seedBtn.hidden = false;
    showBanner("Firestore okunamadı. Firebase Console’da veritabanını aç, kuralları yapıştır, sonra bu sayfayı yenile.", "warn");
  }

  function renderTabs() {
    tabs.innerHTML = api.CATEGORIES.map((category) => {
      const count = items.filter((item) => item.category === category.id).length;
      const active = category.id === activeCategory ? " is-active" : "";
      return `<button class="tab${active}" type="button" data-category="${category.id}">${api.escapeHtml(category.title)} (${count})</button>`;
    }).join("");
  }

  function renderList() {
    const group = items.filter((item) => item.category === activeCategory);
    if (!group.length) {
      list.innerHTML = "<p class=\"note\">Bu kategoride ürün yok.</p>";
      return;
    }

    list.innerHTML = group.map((item) => {
      const src = previewSrc(item);
      const img = src
        ? `<img src="${api.escapeHtml(src)}" alt="">`
        : "<span class=\"thumb-empty\">Foto yok</span>";
      return `
        <article class="editor" data-id="${api.escapeHtml(item.id)}">
          <div class="thumb" data-thumb>${img}</div>
          <div class="editor-body">
            <label>Ürün adı</label>
            <input data-field="name" type="text" value="${api.escapeHtml(item.name)}">
            <label>Fiyat (₺)</label>
            <input data-field="price" type="number" min="0" step="1" value="${api.escapeHtml(item.price)}">
            <label>Açıklama</label>
            <textarea data-field="description" rows="3">${api.escapeHtml(item.description)}</textarea>
            <label>Etiketler (virgülle)</label>
            <input data-field="tags" type="text" value="${api.escapeHtml(item.tags.join(", "))}">
            <label class="check">
              <input data-field="featured" type="checkbox" ${item.featured ? "checked" : ""}>
              Büyük kart (kahvaltı / tatlı gibi)
            </label>
            <label>Yeni fotoğraf</label>
            <input data-field="photo" type="file" accept="image/*">
            <div class="editor-actions">
              <button class="save" type="button" data-save>Kaydet</button>
              <span class="status" data-status></span>
            </div>
          </div>
        </article>
      `;
    }).join("");
  }

  function setStatus(card, message, kind) {
    const status = card.querySelector("[data-status]");
    if (!status) return;
    status.textContent = message;
    status.className = "status" + (kind ? " " + kind : "");
  }

  function readCard(card, previous) {
    return {
      ...previous,
      name: card.querySelector('[data-field="name"]').value.trim(),
      price: Number(card.querySelector('[data-field="price"]').value) || 0,
      description: card.querySelector('[data-field="description"]').value.trim(),
      tags: parseTags(card.querySelector('[data-field="tags"]').value),
      featured: card.querySelector('[data-field="featured"]').checked,
    };
  }

  async function uploadPhoto(itemId, file) {
    if (!file) return "";
    if (file.size > MAX_BYTES) {
      throw new Error("Fotoğraf 8 MB’dan küçük olmalı.");
    }
    const ext = fileExt(file.name);
    const path = `menu/${itemId}/${Date.now()}.${ext}`;
    const ref = firebase.storage().ref(path);
    await ref.put(file, { contentType: file.type || "image/" + ext });
    return ref.getDownloadURL();
  }

  async function saveItem(card) {
    const id = card.dataset.id;
    const previous = items.find((item) => item.id === id);
    if (!previous) return;

    const saveBtn = card.querySelector("[data-save]");
    const fileInput = card.querySelector('[data-field="photo"]');
    const next = readCard(card, previous);

    saveBtn.disabled = true;
    setStatus(card, "Kaydediliyor…");

    try {
      const file = fileInput.files && fileInput.files[0];
      if (file) {
        next.imageUrl = await uploadPhoto(id, file);
      }

      await firebase.firestore().collection(api.COLLECTION).doc(id).set({
        id: next.id,
        category: next.category,
        name: next.name,
        price: next.price,
        description: next.description,
        tags: next.tags,
        imagePath: next.imagePath || "",
        imageUrl: next.imageUrl || "",
        featured: next.featured,
        order: next.order,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      const index = items.findIndex((item) => item.id === id);
      if (index >= 0) items[index] = next;
      if (fileInput) fileInput.value = "";
      if (next.imageUrl) {
        const thumb = card.querySelector("[data-thumb]");
        if (thumb) thumb.innerHTML = `<img src="${api.escapeHtml(next.imageUrl)}" alt="">`;
      }
      setStatus(card, "Kaydedildi. Sitede görünür.", "ok");
    } catch (error) {
      setStatus(card, friendlyError(error), "err");
    } finally {
      saveBtn.disabled = false;
    }
  }

  async function seedMenu() {
    seedBtn.disabled = true;
    seedBtn.textContent = "Yükleniyor…";
    try {
      const payload = items.length ? items : await api.loadFromJson(JSON_URL);
      const db = firebase.firestore();
      const batch = db.batch();
      payload.forEach((item) => {
        const ref = db.collection(api.COLLECTION).doc(item.id);
        batch.set(ref, {
          ...item,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      });
      await batch.commit();
      items = payload;
      seedBtn.hidden = true;
      showBanner("Menü yüklendi. Artık fotoğraf, açıklama ve fiyatı değiştirebilirsin.", "ok");
      renderTabs();
      renderList();
    } catch (error) {
      showBanner(friendlyError(error), "warn");
      seedBtn.hidden = false;
    } finally {
      seedBtn.disabled = false;
      seedBtn.textContent = "Menüyü yükle";
    }
  }

  tabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    activeCategory = button.dataset.category;
    renderTabs();
    renderList();
  });

  list.addEventListener("click", (event) => {
    const saveBtn = event.target.closest("[data-save]");
    if (!saveBtn) return;
    const card = saveBtn.closest(".editor");
    if (card) saveItem(card);
  });

  list.addEventListener("change", (event) => {
    const input = event.target.closest('[data-field="photo"]');
    if (!input || !input.files || !input.files[0]) return;
    const card = input.closest(".editor");
    const thumb = card && card.querySelector("[data-thumb]");
    if (!thumb) return;
    const url = URL.createObjectURL(input.files[0]);
    thumb.innerHTML = `<img src="${url}" alt="">`;
  });

  if (seedBtn) {
    seedBtn.addEventListener("click", seedMenu);
  }

  async function start() {
    if (started) return;
    started = true;
    try {
      await loadItems();
    } catch (error) {
      showBanner(friendlyError(error), "warn");
    }
    renderTabs();
    renderList();
  }

  firebase.auth().onAuthStateChanged((user) => {
    if (user) start();
  });
})();
