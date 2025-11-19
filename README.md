# Sistem Cetak Kupon Berhadiah

Frontend aplikasi untuk mengelola produksi kupon berhadiah menggunakan Next.js 16, TypeScript, dan Ant Design.

## 📋 Tentang Project

Sistem ini dibuat untuk mengelola produksi **Kupon Berhadiah Langsung** dengan spesifikasi:

- **Total**: 10.000 kupon (nomor seri 00001-10000)
- **Distribusi Hadiah**:
  - 50 kupon @ Rp 100.000
  - 100 kupon @ Rp 50.000
  - 250 kupon @ Rp 20.000
  - 500 kupon @ Rp 10.000
  - 1.000 kupon @ Rp 5.000
- **Total Hadiah**: Rp 25.000.000 (1.900 kupon berhadiah, 8.100 tidak beruntung)
- **Packaging**: 10 box x 1.000 kupon per box
- **Komposisi per box**: Sama untuk semua box (190 berhadiah, 810 tidak beruntung)
- **Produksi**: 2 batch x 5 box per batch
- **Validasi**: Tidak boleh hadiah sama pada nomor kupon berurutan

## 🚀 Quick Start

### Prerequisites
- **Node.js**: 18.17 atau lebih baru (recommended: Node.js 20+)
- **npm**: 9+ atau **yarn**: 1.22+
- Backend API berjalan di `http://localhost:3000`

### Installation

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local dan set NEXT_PUBLIC_API_URL=http://localhost:3000

# Run development server
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3001`

## 🎯 3 Aplikasi Terpisah

### 1. Admin (`/admin`)
**Fungsi**: Generate kupon, konfigurasi hadiah, monitoring produksi

**Halaman**:
- `/admin` - Dashboard
- `/admin/coupons` - Generate kupon untuk batch
- `/admin/prize-config` - Konfigurasi distribusi hadiah
- `/admin/batches` - Monitoring batch produksi
- `/admin/users` - Manajemen user

### 2. Production (`/production`)
**Fungsi**: Input batch produksi, print kupon, logging

**Halaman**:
- `/production` - Dashboard
- `/production/batches` - Kelola batch (create/edit)
- `/production/print` - Print kupon per box
- `/production/logs` - Production logs

### 3. QC (`/qc`)
**Fungsi**: Validasi output produksi, laporan QC

**Halaman**:
- `/qc` - Dashboard
- `/qc/validations` - Validasi QC
- `/qc/reports` - Laporan QC per batch

## 🛠️ Tech Stack

### Core Framework & Language
- **Framework**: Next.js 16.0.3 (App Router)
- **Language**: TypeScript 5+
- **Runtime**: Node.js 18.17+ (recommended: Node.js 20+)
- **React**: 19.2.0

### Dependencies (Production)

#### UI & Styling
- **antd**: ^5.29.1 - UI component library
- **@ant-design/icons**: ^6.1.0 - Icon library untuk Ant Design
- **@ant-design/v5-patch-for-react-19**: ^1.0.3 - Patch untuk kompatibilitas React 19
- **tailwindcss**: ^4 - CSS framework (via PostCSS)

#### State Management & Data Fetching
- **zustand**: ^5.0.8 - Lightweight state management
- **@tanstack/react-query**: ^5.90.10 - Data fetching & caching
- **@tanstack/react-query-devtools**: ^5.90.2 - DevTools untuk React Query

#### HTTP & Utilities
- **axios**: ^1.13.2 - HTTP client untuk API calls
- **dayjs**: ^1.11.19 - Date manipulation library
- **react-hook-form**: ^7.66.1 - Form management

### DevDependencies

#### Type Definitions
- **@types/node**: ^20 - TypeScript types untuk Node.js
- **@types/react**: ^19 - TypeScript types untuk React
- **@types/react-dom**: ^19 - TypeScript types untuk React DOM

#### Build Tools & Linting
- **eslint**: ^9 - JavaScript/TypeScript linter
- **eslint-config-next**: 16.0.3 - ESLint config untuk Next.js
- **typescript**: ^5 - TypeScript compiler
- **@tailwindcss/postcss**: ^4 - PostCSS plugin untuk Tailwind

## 📁 Struktur Project

```
fe_cetak_kupon/
├── app/                    # Next.js App Router
│   ├── admin/             # Aplikasi Admin
│   ├── production/        # Aplikasi Production
│   ├── qc/                # Aplikasi QC
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── lib/
│   ├── api/               # API client functions
│   ├── constants.ts        # Constants & endpoints
│   └── utils/             # Utility functions
├── stores/                # Zustand stores
├── providers/             # React providers
├── hooks/                 # Custom React hooks
└── types/                 # TypeScript types
```

## 📖 Penggunaan

### State Management (Zustand)

```typescript
import { useAuthStore } from '@/stores/authStore';

export default function MyComponent() {
  const { user, login, logout } = useAuthStore();
  
  return (
    <div>
      {user ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <button onClick={() => login(userData)}>Login</button>
      )}
    </div>
  );
}
```

### Data Fetching (React Query)

```typescript
import { useQuery } from '@tanstack/react-query';
import { batchesApi } from '@/lib/api/batches';

export default function BatchesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['batches'],
    queryFn: () => batchesApi.getAll(),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.map((batch) => (
        <div key={batch.batch_id}>{batch.batch_number}</div>
      ))}
    </div>
  );
}
```

### Mutation (Create/Update/Delete)

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

const mutation = useMutation({
  mutationFn: (data) => batchesApi.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['batches'] });
  },
});
```

## 🔌 API Integration

Semua API functions tersedia di `lib/api/`:

- **Batches**: `batchesApi.getAll()`, `batchesApi.create()`, dll
- **Coupons**: `couponsApi.getAll()`, `couponsApi.generate()`, dll
- **QC**: `qcApi.getAll()`, `qcApi.create()`, dll
- **Users**: `usersApi.getAll()`, `usersApi.create()`, dll
- **Prize Config**: `prizeConfigApi.getAll()`, dll

Lihat file di `lib/api/` untuk detail lengkap.

## 🧪 Testing

Untuk testing, pastikan backend API sudah berjalan di `http://localhost:3000`.

### Manual Testing
1. Buka aplikasi di browser: `http://localhost:3001`
2. Test setiap fitur sesuai requirement:
   - Generate kupon (Admin)
   - Input batch produksi (Production)
   - Print kupon (Production)
   - Validasi QC (QC)
   - Laporan produksi (Production/Admin)

## 🐛 Troubleshooting

### Backend tidak terhubung
1. Pastikan backend berjalan di `http://localhost:3000`
2. Cek `.env.local` sudah benar (NEXT_PUBLIC_API_URL)
3. Cek browser console (F12) untuk error

### Data tidak muncul
1. Cek Network tab di browser DevTools
2. Test API langsung: `curl http://localhost:3000/api/coupons`
3. Pastikan CORS sudah dikonfigurasi di backend

### Build Error
1. Pastikan Node.js version sesuai (18.17+)
2. Hapus `node_modules` dan `package-lock.json`, lalu `npm install` ulang
3. Cek TypeScript errors: `npm run lint`

## ✅ Status Project

**✅ Project Complete** - Semua fitur sesuai requirement sudah diimplementasikan:

- ✅ Generate kupon (10.000 kupon)
- ✅ Distribusi hadiah sesuai ketentuan
- ✅ Print kupon per box
- ✅ Log laporan (operator, lokasi, waktu, output produksi)
- ✅ Laporan produksi per batch
- ✅ QC validations

## 📝 Scripts

```bash
npm run dev      # Development server (port 3001)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🔗 Links

- Frontend: `http://localhost:3001`
- Backend API: `http://localhost:3000`
- Admin: `http://localhost:3001/admin`
- Production: `http://localhost:3001/production`
- QC: `http://localhost:3001/qc`
