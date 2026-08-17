(function () {
  const config = window.FIREBASE_CONFIG;
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const submitBtn = document.getElementById("submitBtn");
  const errorBox = document.getElementById("errorBox");

  function showError(message) {
    errorBox.hidden = false;
    errorBox.textContent = message;
  }

  function hideError() {
    errorBox.hidden = true;
    errorBox.textContent = "";
  }

  function configReady() {
    return config && config.apiKey && !String(config.apiKey).startsWith("BURAYA_");
  }

  if (!configReady()) {
    showError("Firebase ayarları henüz girilmedi. admin/js/firebase-config.js dosyasını doldur.");
    submitBtn.disabled = true;
    return;
  }

  const app = firebase.initializeApp(config);
  const auth = firebase.auth(app);

  auth.onAuthStateChanged((user) => {
    if (user) {
      window.location.replace("./panel.html");
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideError();
    submitBtn.disabled = true;
    submitBtn.textContent = "Giriş yapılıyor…";

    try {
      await auth.signInWithEmailAndPassword(emailInput.value.trim(), passwordInput.value);
      window.location.replace("./panel.html");
    } catch (error) {
      const messages = {
        "auth/invalid-email": "E-posta adresi geçersiz.",
        "auth/user-disabled": "Bu hesap kapatılmış.",
        "auth/user-not-found": "Bu e-posta ile kayıtlı hesap yok.",
        "auth/wrong-password": "Şifre yanlış.",
        "auth/invalid-credential": "E-posta veya şifre yanlış.",
        "auth/too-many-requests": "Çok fazla deneme. Biraz sonra tekrar dene.",
        "auth/unauthorized-domain": "Bu domain Firebase’de yetkili değil. Authentication → Settings → Authorized domains.",
      };
      showError(messages[error.code] || "Giriş yapılamadı. Ayarları kontrol et.");
      submitBtn.disabled = false;
      submitBtn.textContent = "Giriş yap";
    }
  });
})();
