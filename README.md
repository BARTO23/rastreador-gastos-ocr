# GastoTrack - Rastreador de Gastos con OCR

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-5.0-2d3748)](https://prisma.io)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

**App para rastrear gastos personales con OCR integrado - Escanea tus tickets y facturas, categoriza automáticamente y controla tu presupuesto.**

</div>

---

## ✨ Características

| Característica | Descripción |
|--------------|-------------|
| 📷 **OCR de Tickets** | Escanea recibos y facturas - extracción automática de monto y fecha usando Tesseract.js |
| 🏷️ **Categorización** | 7 categorías por defecto + categorías personalizadas |
| 💰 **Presupuestos** | Define límites mensuales con alertas al 80% y 100% |
| 📊 **Reportes Fiscales** | Exporta tus gastos en CSV por rango de fechas |
| 🔐 **Autenticación** | Sistema de login/registro con NextAuth.js |
| 🗄️ **Base de Datos** | SQLite con Prisma ORM |

---

## 🚀 Demo

Mira el proyecto en acción:

```
1. Register → Crea tu cuenta
2. Login   → Inicia sesión
3. Add     → Sube una imagen de ticket
4. OCR     → Extrae monto y fecha automáticamente
5. Save    → ¡Listo! El gasto queda registrado
```

---

## 🛠️ Tech Stack

- **Frontend/Backend**: [Next.js 14](https://nextjs.org) (App Router)
- **Base de Datos**: [SQLite](https://sqlite.org) + [Prisma](https://prisma.io)
- **Auth**: [NextAuth.js](https://next-auth.js.org)
- **OCR**: [Tesseract.js](https://tesseract.projectnaptha.com)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com)
- **Icons**: [Lucide React](https://lucide.dev)

---

## 📋 Requisitos

- Node.js 18+
- npm o yarn

---

## 🧰 Instalación

```bash
# 1. Clona el repositorio
git clone <repo-url>
cd rastreador-gastos-ocr

# 2. Instala dependencias
npm install

# 3. Configura variables de entorno
cp .env.example .env
# DATABASE_URL="file:./dev.db"
# NEXTAUTH_SECRET="tu-secret-aqui"
# NEXTAUTH_URL="http://localhost:3000"

# 4. Genera Prisma y crea la base de datos
npx prisma generate
npx prisma db push

# 5. Inicia el servidor
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📁 Estructura del Proyecto

```
rastreador-gastos-ocr/
├── app/                    # Páginas de Next.js
│   ├── api/              # Rutas API
│   │   ├── auth/        # NextAuth
│   │   ├── budget/     # Presupuesto
│   │   ├── categories/ # Categorías
│   │   ├── expenses/  # Gastos
│   │   ├── register/  # Registro
│   │   └── reports/  # Reportes
│   ├── add/              # Agregar gasto
│   ├── budget/           # Presupuesto
│   ├── categories/        # Categorías
│   ├── dashboard/       # Panel principal
│   ├── login/           # Login
│   ├── register/        # Registro
│   └── reports/        # Reportes
├── lib/                     # Utilidades
│   ├── auth.ts          # Config NextAuth
│   └── prisma.ts       # Cliente Prisma
├── prisma/
│   └── schema.prisma  # Modelo de datos
├── types/                  # Tipos TypeScript
└── public/                 # Archivos estáticos
```

---

## 🔑 Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | Connection string de SQLite | `file:./dev.db` |
| `NEXTAUTH_SECRET` | Secret para firmar tokens | `secret-muy-largo-123...` |
| `NEXTAUTH_URL` | URL de la app | `http://localhost:3000` |

---

## 🔄 Scripts Disponibles

```bash
npm run dev       # Desarrollo
npm run build    # Producción
npm run start    # Iniciar producción
npm run db:push  # Sincronizar DB
```

---

## 📱 Uso

### 1. Registro
Crea una cuenta en `/register` - se crean automáticamente las 7 categorías por defecto.

### 2. Agregar Gasto con OCR
1. Ve a `/add`
2. Sube una imagen del ticket
3. Tesseract.js extrae el texto
4. La app detecta monto y fecha automáticamente
5. Confirma y guarda

### 3. Presupuesto
1. Ve a `/budget`
2. Define tu límite mensual
3. El dashboard muestra el progreso
4. Alertas a 80% y 100%

### 4. Reportes
1. Ve a `/reports` o `/budget`
2. Selecciona rango de fechas
3. Descarga CSV para tus taxes

---

## 🔧 Modelo de Datos

```
User          → id, email, password, name
Category     → id, name, icon, color, isDefault, userId
Expense      → id, amount, description, date, ocrText, categoryId, userId
Budget       → id, limitAmount, month, year, userId
```

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una branch (`git checkout -b feature/nueva`)
3. Commit tus cambios (`git commit -m 'Agrega...'`)
4. Push a la branch (`git push origin feature/nueva`)
5. Abre un Pull Request

---

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para detalles.

---

<div align="center">

Hecho con ❤️ para control de finanzas personales

</div>