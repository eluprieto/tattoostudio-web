# TattooStudio Web

Página web completa para estudio de tatuajes y piercings. Estética dark vintage dorada. Incluye galería, tienda con carrito, integración Mercado Pago y sistema de login/registro.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JS, GSAP, Three.js |
| Backend | Node.js + Express |
| Base de datos | MongoDB (Mongoose) |
| Pagos | Mercado Pago SDK v2 |
| Autenticación | JWT + bcryptjs |
| Email | Nodemailer (Gmail SMTP) |

---

## Estructura de carpetas

```
tattoostudio-web/
├── frontend/
│   ├── index.html          ← Página principal
│   ├── css/
│   │   ├── main.css        ← Estilos principales
│   │   ├── animations.css  ← Animaciones scroll
│   │   ├── shop.css        ← Tienda y carrito
│   │   └── responsive.css  ← Breakpoints
│   ├── js/
│   │   ├── utils.js        ← Helpers globales
│   │   ├── hero.js         ← Intro + Three.js
│   │   ├── animations.js   ← Scroll animations
│   │   ├── gallery.js      ← Galería + lightbox
│   │   ├── shop.js         ← Productos + filtros
│   │   ├── cart.js         ← Carrito
│   │   ├── auth.js         ← Login/Registro JWT
│   │   └── main.js         ← Boot general
│   ├── assets/
│   │   ├── gallery/        ← Imágenes de la galería
│   │   └── products/       ← Imágenes de productos
│   └── pages/
│       ├── shop.html
│       ├── login.html
│       ├── register.html
│       ├── checkout.html
│       ├── payment-success.html
│       └── payment-failure.html
└── backend/
    ├── server.js
    ├── .env.example
    └── src/
        ├── routes/         ← auth, products, orders, payments
        ├── models/         ← User, Product, Order
        ├── services/       ← MercadoPago, email, shipping
        ├── middleware/     ← auth JWT, rate limiter, errorHandler
        └── utils/          ← logger, validators, helpers
```

---

## Cómo instalar y correr en local

### 1. Abrir el frontend (sin backend)

Abrí `frontend/index.html` directamente en el navegador, o usá Live Server en VS Code.

> La tienda funciona con datos de demo. El carrito persiste en localStorage.

### 2. Levantar el backend

```bash
cd backend
npm install
cp .env.example .env
# Editá .env con tus credenciales
npm run dev
```

El servidor queda en `http://localhost:3000`

### 3. MongoDB

Necesitás MongoDB corriendo localmente o una URI de Atlas en `.env`:

```
MONGODB_URI=mongodb://localhost:27017/tattoostudio
# o
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/tattoostudio
```

---

## Configurar Mercado Pago

1. Entrá a [mercadopago.com.ar/developers](https://mercadopago.com.ar/developers)
2. Creá una aplicación
3. Copiá el **Access Token** (de TEST para pruebas, de PROD para producción)
4. Pegalo en `.env`:
   ```
   MP_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxxxxxx
   ```
5. Configurá las URLs de retorno:
   ```
   FRONTEND_URL=https://tudominio.com
   ```

---

## Configurar email (Gmail)

1. Activá la verificación en 2 pasos en tu cuenta de Google
2. Generá una **App Password**: Google Account → Seguridad → Contraseñas de aplicación
3. Ponéla en `.env`:
   ```
   EMAIL_USER=tu@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx
   OWNER_EMAIL=dueno@email.com
   ```

---

## Agregar productos

**Sin backend (MVP rápido):** Editá el array `DEMO_PRODUCTS` en `frontend/js/shop.js`

**Con backend:** `POST /api/products` (requiere token de admin)

```json
{
  "name": "Aro Helix Titanio",
  "category": "aritos",
  "bodyPart": "oreja",
  "material": "titanio",
  "price": 4500,
  "stock": 10,
  "desc": "Descripción del producto",
  "image": "/assets/products/foto.jpg"
}
```

---

## Agregar imágenes a la galería

1. Copiá las fotos a `frontend/assets/gallery/`
2. Editá el array `GALLERY_DATA` en `frontend/js/gallery.js`:

```js
{ id: 13, title: 'Nombre del trabajo', category: 'blackwork', desc: 'Descripción', img: 'assets/gallery/mi-foto.jpg' }
```

Categorías disponibles: `blackwork`, `color`, `realismo`, `tradicional`, `minimalista`, `piercings`

---

## Configurar envíos

El costo de envío se define en `.env`:

```
SHIPPING_COST=1500          # Costo en pesos
FREE_SHIPPING_FROM=15000    # Monto mínimo para envío gratis
```

---

## Cómo deployar

### Frontend → Vercel / Netlify

1. Subí la carpeta `frontend/` a un repo de GitHub
2. Importá el repo en Vercel/Netlify
3. No requiere build step

### Backend → Railway / Render

1. Creá un proyecto en [railway.app](https://railway.app) o [render.com](https://render.com)
2. Conectá el repo
3. Configurá las variables de entorno del `.env`
4. Start command: `node server.js`

### Variables de entorno en producción

Configurá todas las variables del `.env.example` en el panel de tu hosting.

---

## Limitaciones del MVP

- Las imágenes de galería y productos son placeholders (reemplazar con fotos reales)
- El panel de admin no tiene interfaz visual (se gestiona por API)
- No hay integración con correo de seguimiento de envíos
- Sin sistema de reseñas

---

## Roadmap

- [ ] Panel de administración visual
- [ ] Integración con MercadoPago Subscriptions para reservas
- [ ] Sistema de reseñas de clientes
- [ ] Notificaciones push para pedidos
- [ ] Integración con Correo Argentino para tracking
- [ ] Blog/noticias del estudio
- [ ] Agenda online para turnos
