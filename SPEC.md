# Rastreador de Gastos con OCR - Specification

## Stack Tecnológico
- **Frontend/Backend**: Next.js 14 (App Router)
- **Base de datos**: SQLite
- **ORM**: Prisma
- **Auth**: NextAuth.js (Credentials provider)
- **OCR**: Tesseract.js (cliente, procesa en browser)
- **Estilos**: Tailwind CSS

---

## 1. Estructura de Base de Datos

### Modelo Prisma

```prisma
User
- id: String (cuid)
- email: String (unique)
- password: String
- name: String?
- createdAt: DateTime
- updatedAt: DateTime

Category
- id: String (cuid)
- name: String
- icon: String (emoji)
- color: String (hex)
- isDefault: Boolean
- userId: String (FK)
- createdAt: DateTime

Expense
- id: String (cuid)
- amount: Float
- description: String
- date: DateTime
- imageUrl: String?
- ocrText: String?
- categoryId: String (FK)
- userId: String (FK)
- createdAt: DateTime

Budget
- id: String (cuid)
- limitAmount: Float
- month: Int
- year: Int
- userId: String (FK)
- createdAt: DateTime
```

### Categorías por defecto
1. 🍔 Comida
2. 🚗 Transporte
3. 💡 Utilities
4. 🎬 Entretenimiento
5. 🏥 Salud
6. 🛍️ Shopping
7. 📦 Otros

---

## 2. Arquitectura de Páginas

| Ruta | Descripción |
|-----|-------------|
| `/` | Landing pública |
| `/login` | Login |
| `/register` | Registro |
| `/dashboard` | Panel principal (lista de gastos) |
| `/add` | Agregar gasto (con OCR) |
| `/categories` | Gestión de categorías |
| `/budget` | Presupuesto y alertas |
| `/reports` | Exportar reportes fiscales |

---

## 3. Flujos Principales

### A. Agregar gasto con OCR
1. Usuario accede a `/add`
2. Sube imagen (ticket/factura)
3. Tesseract.js procesa en cliente → extrae texto
4. Regex extrae monto total y fecha
5. Usuario confirma/edita datos
6. Save expense

### B. Seguimiento de presupuesto
1. Usuario define presupuesto mensual en `/budget`
2. Dashboard muestra progreso (barra/porcentaje)
3. Alertas cuando > 80% y > 100%

### C. Reportes fiscales
1. Filtro por rango de fechas
2. Genera CSV agrupado por categoría
3. Export para declaración de impuestos

---

## 4. Diseño UI (SaaS Moderno)

### Colores
- Primario: `#6366f1` (indigo-500)
- Fondo: `#f8fafc` (slate-50)
- Texto: `#1e293b` (slate-800)
- Éxito: `#22c55e` (green-500)
- Warning: `#f59e0b` (amber-500)
- Error: `#ef4444` (red-500)

### Spacing
4, 8, 12, 16, 24, 32, 48, 64

### Componentes clave
- Tarjetas de gasto con icono de categoría
- Barra de progreso de presupuesto
- Upload con preview de imagen
- Gráficos simples (total por categoría)

---

## 5. Pendientes de Decisión

1. **Hosting** - ¿ienes un hosting en mente (Vercel, Railway)?
2. **Formato de exportación** - ¿CSV basta o necesitas PDF también?
3. **Imágenes de receipts** - ¿guardar en disco local o en cloud (Cloudinary, etc)?

---

## 6. Lista de Archivos a Crear

```
rastreador-gastos/
├── prisma/
│   └── schema.prisma
├── app/
│   ├── layout.tsx
│   ├── page.tsx (landing)
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── add/
│   │   └── page.tsx
│   ├── categories/
│   │   └── page.tsx
│   ├── budget/
│   │   └── page.tsx
│   ├── reports/
│   │   └── page.tsx
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts
├── components/
│   ├── ui/
│   ├── ExpenseCard.tsx
│   ├── BudgetProgress.tsx
│   ├��─ OCRUploader.tsx
│   └── CategorySelect.tsx
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   └── ocr.ts
├── public/
└── package.json
```