const welcome = document.getElementById("welcome");
const menuScreen = document.getElementById("menuScreen");
const menuBody = document.getElementById("menuBody");
const openMenu = document.getElementById("openMenu");
const closeMenu = document.getElementById("closeMenu");
const cats = document.getElementById("cats");

function showMenu() {
  menuScreen.classList.add("is-open");
  menuScreen.setAttribute("aria-hidden", "false");
  welcome.classList.add("is-hidden");
  document.body.classList.add("menu-open");
  menuBody.scrollTop = 0;
}

function hideMenu() {
  menuScreen.classList.remove("is-open");
  menuScreen.setAttribute("aria-hidden", "true");
  welcome.classList.remove("is-hidden");
  document.body.classList.remove("menu-open");
}

openMenu.addEventListener("click", showMenu);
closeMenu.addEventListener("click", hideMenu);

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

document.querySelectorAll(".photo[data-img]").forEach((slot) => {
  const image = new Image();
  image.alt = slot.closest(".item")?.querySelector("h3")?.textContent || "";
  image.onload = () => {
    slot.appendChild(image);
    slot.classList.add("has-image");
  };
  image.src = slot.dataset.img;
});
