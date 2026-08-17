(function () {
  const api = window.HazeluneMenu;
  if (!api) return;

  const config = window.FIREBASE_CONFIG;
  if (config && typeof firebase !== "undefined" && !firebase.apps.length) {
    firebase.initializeApp(config);
  }

  function photoAttrs(item) {
    if (item.imageUrl) {
      return `data-img-url="${api.escapeHtml(item.imageUrl)}"`;
    }
    if (item.imagePath) {
      return `data-img="${api.escapeHtml(item.imagePath)}"`;
    }
    return "";
  }

  function fileLabel(item) {
    const path = item.imagePath || "";
    return path.replace(/^images\//, "") || "fotoğraf";
  }

  function renderItem(item) {
    const featured = item.featured;
    const tags = item.tags.length
      ? `<div class="tags">${item.tags.map((tag) => `<span class="tag">${api.escapeHtml(tag)}</span>`).join("")}</div>`
      : "";
    const desc = item.description
      ? `<p class="desc">${api.escapeHtml(item.description)}</p>`
      : "";

    return `
      <article class="item ${featured ? "featured" : "compact"}">
        <div class="photo" ${photoAttrs(item)}>
          <span class="photo-hint">Görsel alanı<small>${api.escapeHtml(fileLabel(item))}</small></span>
        </div>
        <div class="item-body">
          <div class="item-top">
            <h3>${api.escapeHtml(item.name)}</h3>
            <span class="price">${api.escapeHtml(api.formatPrice(item.price))}</span>
          </div>
          ${desc}
          ${tags}
        </div>
      </article>
    `;
  }

  function folderUrls(fileName) {
    const bust = window.location.protocol === "file:" ? "" : `?v=${Date.now()}`;
    const base = fileName.replace(/\.[^.]+$/, "");
    return [...new Set([
      `images/${fileName}${bust}`,
      `images/${base}.jpg${bust}`,
      `images/${base}.jpeg${bust}`,
      `images/${base}.png${bust}`,
      `images/${base}.webp${bust}`,
    ])];
  }

  function bindPhotos(root) {
    (root || document).querySelectorAll(".photo[data-img], .photo[data-img-url]").forEach((slot) => {
      slot.querySelectorAll("img").forEach((old) => old.remove());
      slot.classList.remove("has-image");

      const remote = slot.dataset.imgUrl;
      const image = new Image();
      image.alt = slot.closest(".item")?.querySelector("h3")?.textContent || "";

      if (remote) {
        image.addEventListener("load", () => {
          slot.prepend(image);
          slot.classList.add("has-image");
        });
        image.src = remote;
        return;
      }

      const fileName = (slot.dataset.img || "").replace(/^images\//, "");
      if (!fileName) return;

      const urls = folderUrls(fileName);
      let index = 0;
      const tryNext = () => {
        if (index >= urls.length) return;
        image.src = urls[index];
        index += 1;
      };
      image.addEventListener("load", () => {
        slot.prepend(image);
        slot.classList.add("has-image");
      });
      image.addEventListener("error", tryNext);
      tryNext();
    });
  }

  function renderMenu(items) {
    if (!items.length) return false;

    api.CATEGORIES.forEach((category) => {
      const section = document.getElementById(category.id);
      if (!section) return;
      const grid = section.querySelector(".grid");
      if (!grid) return;
      const group = items.filter((item) => item.category === category.id);
      const featured = group.some((item) => item.featured);
      grid.classList.toggle("featured", featured);
      grid.innerHTML = group.map(renderItem).join("");
    });

    bindPhotos(document.getElementById("menu"));
    return true;
  }

  api.loadMenu({ jsonUrl: "data/menu.json" }).then((result) => {
    if (result.items && result.items.length) {
      renderMenu(result.items);
    }
  });
})();
