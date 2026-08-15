(function () {
  const welcome = document.getElementById("welcome");
  const menuScreen = document.getElementById("menu");
  const menuBody = document.getElementById("menuBody");
  const closeMenu = document.getElementById("closeMenu");
  const cats = document.getElementById("cats");

  if (!welcome || !menuScreen || !menuBody || !closeMenu || !cats) return;

  function setHash(hash) {
    try {
      const url = new URL(window.location.href);
      url.hash = hash || "";
      history.replaceState(null, "", url.href);
    } catch {
      window.location.hash = hash || "";
    }
  }

  function showMenu(sectionId) {
    menuScreen.classList.add("is-open");
    menuScreen.setAttribute("aria-hidden", "false");
    welcome.classList.add("is-hidden");
    document.body.classList.add("menu-open");
    menuBody.scrollTop = 0;

    if (sectionId) {
      const section = document.getElementById(sectionId);
      if (section) {
        requestAnimationFrame(() => {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    }
  }

  function hideMenu() {
    menuScreen.classList.remove("is-open");
    menuScreen.setAttribute("aria-hidden", "true");
    welcome.classList.remove("is-hidden");
    document.body.classList.remove("menu-open");
  }

  document.querySelectorAll("[data-open-menu]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showMenu(link.dataset.target);
      setHash("menu");
    });
  });

  closeMenu.addEventListener("click", (event) => {
    event.preventDefault();
    hideMenu();
    setHash("");
  });

  if (window.location.hash === "#menu") {
    showMenu();
  }

  cats.addEventListener("click", (event) => {
    const button = event.target.closest(".cat");
    if (!button) return;

    cats.querySelectorAll(".cat").forEach((cat) => cat.classList.remove("is-active"));
    button.classList.add("is-active");
    button.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });

    const section = document.getElementById(button.dataset.target);
    if (section) {
      const top = section.getBoundingClientRect().top - menuBody.getBoundingClientRect().top + menuBody.scrollTop;
      lockedSectionId = section.id;
      menuBody.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }
  });

  const sections = [...document.querySelectorAll(".section")];
  const catButtons = [...cats.querySelectorAll(".cat")];
  let lockedSectionId = null;
  let unlockTimer = 0;

  function setActiveCat(sectionId) {
    catButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.target === sectionId);
    });
  }

  function updateActiveCat() {
    if (lockedSectionId) {
      setActiveCat(lockedSectionId);
      return;
    }

    const probe = menuBody.getBoundingClientRect().top + 28;
    let current = sections[0]?.id;

    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= probe) current = section.id;
    });

    setActiveCat(current);
  }

  menuBody.addEventListener("scroll", () => {
    window.clearTimeout(unlockTimer);
    unlockTimer = window.setTimeout(() => {
      lockedSectionId = null;
      updateActiveCat();
    }, 80);
    updateActiveCat();
  });

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

  const heroPhoto = document.querySelector(".hero-photo");
  if (heroPhoto && window.location.protocol !== "file:") {
    heroPhoto.src = `images/hero-croissant.jpg?v=${Date.now()}`;
  }

  document.querySelectorAll(".photo[data-img]").forEach((slot) => {
    const fileName = (slot.dataset.img || "").replace(/^images\//, "");
    if (!fileName) return;

    slot.querySelectorAll("img").forEach((old) => old.remove());

    const urls = folderUrls(fileName);
    const image = new Image();
    image.alt = slot.closest(".item")?.querySelector("h3")?.textContent || "";
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
})();
