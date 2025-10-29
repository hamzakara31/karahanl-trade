# GitHub ve Vercel Deployment Rehberi

## 1️⃣ GitHub Repository Oluştur

1. https://github.com adresine git
2. Sağ üstte "+" → "New repository"
3. Repository adı: `karahanli-trade`
4. Public seç
5. "Create repository" tıkla

## 2️⃣ GitHub'a Push Et

Repository oluşturduktan sonra, GitHub'ın gösterdiği sayfada **"...or push an existing repository from the command line"** bölümündeki komutları kullan.

Veya aşağıdaki komutları çalıştır (GITHUB_USERNAME kısmını kendi kullanıcı adınla değiştir):

```bash
git remote add origin https://github.com/GITHUB_USERNAME/karahanli-trade.git
git branch -M main
git push -u origin main
```

## 3️⃣ Vercel'e Deploy

1. https://vercel.com adresine git
2. "Sign Up" → GitHub ile giriş yap
3. "Add New Project" tıkla
4. `karahanli-trade` repository'sini seç
5. "Import" tıkla

### Environment Variables Ekle:

Deploy etmeden önce **"Environment Variables"** bölümünde şunları ekle:

- **Name:** `NEXT_PUBLIC_SUPABASE_URL`
  - **Value:** Supabase URL'in (https://xxx.supabase.co)

- **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - **Value:** Supabase Anon Key'in

6. "Deploy" tıkla

⏱️ **2-3 dakika sonra sitin hazır!**

## 4️⃣ Link'i Paylaş

Deploy bitince Vercel sana bir link verecek:
```
https://karahanli-trade.vercel.app
```

Bu linki arkadaşlarınla paylaş! 🎉

---

## 🔄 Güncellemeler

Her değişiklikten sonra:

```bash
git add .
git commit -m "Değişiklik açıklaması"
git push
```

Vercel otomatik deploy eder!

