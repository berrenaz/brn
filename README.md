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

## Domain: hazelunebakery.online

1. GitHub’da repo **Public** olsun: Settings → Change repository visibility
2. Settings → Pages
   - Source: **GitHub Actions**
   - Custom domain: `hazelunebakery.online`
   - **Enforce HTTPS**
3. Domain panelinde (DNS) şu kayıtları ekle:

**hazelunebakery.online** (A):

- `185.199.108.153`
- `185.199.109.153`
- `185.199.110.153`
- `185.199.111.153`

**www.hazelunebakery.online** (CNAME):

- `berrenaz.github.io`

