(function () {
  const welcome = document.getElementById("welcome");
  const menuScreen = document.getElementById("menu");
  const menuBody = document.getElementById("menuBody");
  const closeMenu = document.getElementById("closeMenu");
  const cats = document.getElementById("cats");
  const embedded = window.EMBEDDED_PHOTOS || {};

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

    const section = document.getElementById(button.dataset.target);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  const sections = [...document.querySelectorAll(".section")];
  const catButtons = [...cats.querySelectorAll(".cat")];

  menuBody.addEventListener("scroll", () => {
    const offset = menuBody.scrollTop + 140;
    let current = sections[0]?.id;

    sections.forEach((section) => {
      if (section.offsetTop <= offset) current = section.id;
    });

    catButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.target === current);
    });
  });

  function candidates(fileName) {
    const base = fileName.replace(/\.[^.]+$/, "");
    const names = [...new Set([fileName, `${base}.jpg`, `${base}.jpeg`, `${base}.png`, `${base}.webp`])];
    const urls = [];
    names.forEach((name) => {
      if (embedded[name]) urls.push(embedded[name]);
    });
    names.forEach((name) => {
      urls.push(`images/${name}`);
    });
    return urls;
  }

  document.querySelectorAll(".photo[data-img]").forEach((slot) => {
    const fileName = (slot.dataset.img || "").replace(/^images\//, "");
    if (!fileName) return;

    slot.querySelectorAll("img").forEach((old) => old.remove());

    const urls = candidates(fileName);
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
