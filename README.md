# 📊 TradeJournal Pro - Advanced Trading Analytics Platform

TradeZella benzeri profesyonel bir trading analiz ve günlükleme platformu.

## 🚀 Özellikler

### Temel Özellikler
- ✅ **Otomatik Günlük Tutma**: Broker entegrasyonları ile otomatik işlem kaydı
- 📊 **Gelişmiş Analytics**: 50+ farklı rapor ve metrik
- 🎯 **Playbook Yönetimi**: Strateji oluşturma ve takip
- 📈 **Backtesting**: Geçmiş verilerde strateji testi
- 🔄 **Replay Modu**: İşlemleri tekrar izleme
- 👥 **Topluluk**: Trader topluluğu ve mentörlük
- 🎓 **Eğitim**: Ücretsiz eğitim içerikleri

### Desteklenen Broker'lar (Planlanan)
- MetaTrader 4/5
- Interactive Brokers
- TD Ameritrade
- Tradovate
- Webull
- Binance (Crypto)

## 🛠️ Teknoloji Stack

### Frontend
- **Framework**: Next.js 14 (React)
- **Styling**: TailwindCSS
- **Animasyonlar**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **TypeScript**: Full type safety

### Backend
- **API**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Market Data**: Binance API (Crypto), Alpha Vantage (Forex/Stocks)

### Data Providers
- ✅ **Binance API**: Real-time cryptocurrency data (BTC, ETH, BNB, SOL, etc.)
- ✅ **Alpha Vantage API**: Forex pairs (EUR/USD, GBP/USD, etc.) & Stocks

### API Keys Required
1. **Alpha Vantage** (Free): https://www.alphavantage.co/support/#api-key
   - Add to `.env.local`: `NEXT_PUBLIC_ALPHA_VANTAGE_KEY=your_key`
   - Free tier: 5 calls/min, 500/day
2. **Binance**: No API key needed (public endpoints only)

## 📦 Kurulum

### Gereksinimler
- Node.js 18+ 
- npm veya yarn

### Adımlar

1. **Dependencies yükleyin:**
```bash
npm install
```

2. **Development server'ı başlatın:**
```bash
npm run dev
```

3. **Tarayıcıda açın:**
```
http://localhost:3000
```

## 🗂️ Proje Yapısı

```
trade-journal-platform/
├── app/
│   ├── layout.tsx          # Ana layout
│   ├── page.tsx            # Ana sayfa
│   └── globals.css         # Global stiller
├── components/
│   ├── Navbar.tsx          # Navigasyon bar
│   ├── Hero.tsx            # Hero section
│   ├── Features.tsx        # Özellikler
│   └── Stats.tsx           # İstatistikler
├── public/                 # Statik dosyalar
├── styles/                 # CSS dosyaları
└── package.json
```

## 🎯 Geliştirme Roadmap

### Faz 1: Temel Altyapı ✅
- [x] Next.js kurulumu
- [x] TailwindCSS konfigürasyonu
- [x] Ana sayfa tasarımı
- [x] Responsive tasarım

### Faz 2: Kimlik Doğrulama (Sırada)
- [ ] Supabase entegrasyonu
- [ ] Kullanıcı kayıt/giriş
- [ ] Dashboard layout
- [ ] Profil yönetimi

### Faz 3: Trade Günlüğü
- [ ] Trade ekleme formu
- [ ] Trade listesi
- [ ] Trade detay sayfası
- [ ] Trade düzenleme/silme

### Faz 4: Analytics
- [ ] Dashboard widgets
- [ ] Grafik entegrasyonu
- [ ] Performans metrikleri
- [ ] Rapor oluşturma

### Faz 5: Broker Entegrasyonları
- [ ] MetaTrader entegrasyonu
- [ ] Interactive Brokers
- [ ] CSV import/export
- [ ] Otomatik senkronizasyon

### Faz 6: Gelişmiş Özellikler
- [x] Backtesting engine (Binance + Alpha Vantage)
- [x] SMA, RSI, MACD stratejileri
- [ ] Replay modu
- [ ] Playbook sistemi
- [ ] AI önerileri

### Faz 7: Topluluk
- [ ] Kullanıcı profilleri
- [ ] Trade paylaşımı
- [ ] Yorum sistemi
- [ ] Mentörlük modu

## 🎨 Tasarım Sistemi

### Renkler
- **Primary**: Blue (0ea5e9)
- **Secondary**: Purple (9333ea)
- **Success**: Green (22c55e)
- **Danger**: Red (ef4444)

### Tipografi
- **Font**: Inter (Google Fonts)
- **Heading**: Bold, 32-72px
- **Body**: Regular, 16-18px

## 📱 Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔐 Güvenlik
- JWT authentication
- HTTPS zorunlu
- API rate limiting
- SQL injection koruması
- XSS koruması

## 📈 Performans
- Lighthouse score: 90+
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lazy loading images

## 🤝 Katkıda Bulunma
Bu proje şu an geliştirme aşamasındadır. Katkılarınızı bekliyoruz!

## 📄 Lisans
MIT License

## 🙏 Teşekkürler
Bu proje TradeZella'dan ilham alınarak oluşturulmuştur.

---

**Not**: Bu proje eğitim amaçlıdır ve sürekli geliştirilmektedir.

