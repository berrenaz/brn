# Hazelune

## Siteyi açmak

Sadece `index.html` indirme. Tüm klasörü indir:

1. GitHub’da yeşil **Code** → **Download ZIP**
2. ZIP’i aç
3. İçindeki `index.html` dosyasına çift tıkla

Klasör şöyle olmalı:

```
Hazelune/
  index.html
  images/
    hero-croissant.jpg
    serpme-kahvalti.jpg
    latte.jpg
    ...
```

## Görseller

Ölçü şart değil. Dosya adı menüdekiyle aynı olsun: `serpme-kahvalti.jpg`

Görseller `images` klasöründen yüklenir. GitHub’da dosyayı değiştirince sitede de değişir.

## Domain: hazelunebakery.online

Bu yazı çıkıyorsa site henüz GitHub’da yayınlanmamış demektir. DNS çalışıyor; eksik olan yayın ayarı.

1. https://github.com/berrenaz/brn/settings/pages
2. **Build and deployment** → Source: **Deploy from a branch**
3. Branch: `cursor/hazelune-homepage-378a`  Folder: `/ (root)`  → **Save**
4. Custom domain: `hazelunebakery.online` → **Save**
5. Yeşil tik gelince **Enforce HTTPS**

## Admin paneli

Adres: `/admin/`

1. Firebase Console → **Authentication** → Sign-in method → **Email/Password** aç
2. Authentication → Users → **Add user** (e-posta ve şifre)
3. Project settings → Your apps → Web uygulaması ekle, çıkan `firebaseConfig` değerlerini `admin/js/firebase-config.js` içine yapıştır
4. Authentication → Settings → Authorized domains içine `hazelunebakery.online` ekle



