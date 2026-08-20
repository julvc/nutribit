# 🥗 NutriBit

**Rastreador de calorías y peso — gratuito, privado y sin suscripciones.**

Registra tus comidas, controla tus macros y sigue la evolución de tu peso. Tus datos son tuyos: cada usuario solo ve su propia información (Row Level Security en Postgres).

🌐 **App:** https://julvc.github.io/nutribit/

## ✨ Funcionalidades

- 🍽️ **Registro de comidas** por día, con calorías, proteínas, carbohidratos y grasas
- 🎯 **Meta calórica diaria** editable, con barra de progreso
- 📊 **Historial** de los últimos 14 días con gráfica y promedio
- ⚖️ **Registro de peso** con gráfica de evolución
- 🔐 **Autenticación** con email y contraseña (Supabase Auth)
- 📱 **PWA**: instalable en iOS y Android desde el navegador, sin tiendas

## 🛠️ Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| Backend | Supabase (Auth + PostgreSQL + RLS) |
| Gráficas | Recharts |
| Hosting | GitHub Pages (CI/CD con GitHub Actions) |

## 🚀 Desarrollo local

```bash
npm install
cp .env.example .env.local   # completar con credenciales de Supabase
npm run dev                  # http://localhost:5173
```

**Base de datos:** ejecutar `supabase/schema.sql` en el SQL Editor de tu proyecto Supabase. En Settings → Data API: habilitar Data API, **desactivar** "Automatically expose new tables" y activar "Automatic RLS".

```bash
npm run build     # type-check + build de producción
npm run lint      # ESLint
npm test          # tests (Vitest)
```

## 📦 Deploy

Push a `main` → GitHub Actions construye y publica en GitHub Pages. Requiere los secrets `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en el repo.

## 📄 Licencia

[MIT](LICENSE)
