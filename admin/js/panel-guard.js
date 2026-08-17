(function () {
  const config = window.FIREBASE_CONFIG;

  if (!config || String(config.apiKey).startsWith("BURAYA_")) {
    window.location.replace("./index.html");
    return;
  }

  const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(config);
  const auth = firebase.auth(app);

  auth.onAuthStateChanged((user) => {
    if (!user) {
      window.location.replace("./index.html");
      return;
    }

    const emailEl = document.getElementById("adminEmail");
    if (emailEl) emailEl.textContent = user.email || "";
  });

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await auth.signOut();
      window.location.replace("./index.html");
    });
  }
})();
