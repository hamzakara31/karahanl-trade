# 🚀 Siteyi Yayınlama Rehberi (Vercel)

## Adım 1: GitHub'a Yükle

```bash
# İlk kez ise:
git init
git add .
git commit -m "Initial commit"

# GitHub'da yeni repo oluştur (github.com/new)
# Sonra:
git remote add origin https://github.com/KULLANICI_ADIN/karahanli-trade.git
git branch -M main
git push -u origin main
```

## Adım 2: Vercel'e Deploy Et

1. **Vercel'e git:** https://vercel.com
2. **"Sign Up" ile kayıt ol** (GitHub ile giriş yap - ücretsiz)
3. **"Add New Project"** tıkla
4. **GitHub repo'nu seç** (karahanli-trade)
5. **Environment Variables ekle:**
   - `NEXT_PUBLIC_SUPABASE_URL` = Supabase URL'in
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Supabase Anon Key'in
6. **"Deploy"** tıkla

⏱️ **2-3 dakika sonra hazır!**

## Adım 3: Link Paylaş

Deploy bitince sana link verecek:
```
https://karahanli-trade.vercel.app
```

Bu linki arkadaşlarınla paylaş! 🎉

## 🔄 Güncellemeler

Her `git push` yaptığında otomatik deploy olur!

```bash
git add .
git commit -m "Yeni özellik"
git push
```

---

## 🆓 Diğer Ücretsiz Alternatifler

- **Netlify:** vercel.com benzeri
- **Railway:** Backend + Frontend
- **Render:** 750 saat/ay ücretsiz

