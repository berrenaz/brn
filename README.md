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

Görseller `images` klasöründen yüklenir. Admin panelden yeni foto yüklersen sitede o foto görünür.

Anasayfa fotoğrafı için dosya adı `hero-croissant.jpg` olsun.

## Domain: hazelunebakery.online

1. https://github.com/berrenaz/brn/settings/pages
2. **Build and deployment** → Source: **Deploy from a branch**
3. Branch: `cursor/hazelune-admin-378a`  Folder: `/ (root)`  → **Save**
4. Custom domain: `hazelunebakery.online` → **Save**
5. Yeşil tik gelince **Enforce HTTPS**

Admin paneli (`/admin/`) bu dal yayınlanınca açılır.

## Admin paneli

Adres: `https://hazelunebakery.online/admin/`

### Giriş

1. Firebase Console → **Authentication** → Sign-in method → **Email/Password** aç
2. Authentication → Users → **Add user** (e-posta ve şifre)
3. Authentication → Settings → Authorized domains içine `hazelunebakery.online` ekle

### Menüyü kaydetmek (bir kez)

Fotoğraf, açıklama ve fiyatın sitede değişmesi için Firestore ve Storage gerekir.

1. Firebase Console → **Build** → **Firestore Database** → **Create database**
   - Location: `eur3` (europe-west) yeter
   - Start in test mode diyebilirsin; hemen ardından kuralları değiştir
2. Firestore → **Rules** sekmesine şunu yapıştır → **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /items/{itemId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

3. Firebase Console → **Build** → **Storage** → **Get started**
4. Storage → **Rules** sekmesine şunu yapıştır → **Publish**:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /menu/{itemId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
        && request.resource.size < 8 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

5. Panele gir → **Menüyü yükle**
6. Ürünü değiştir → **Kaydet**
7. Siteyi yenile, Menü’den kontrol et
