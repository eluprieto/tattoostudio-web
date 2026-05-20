# Deploy Notes – TattooStudio

## Checklist antes de pasar a producción

### Seguridad
- [ ] Cambiar `JWT_SECRET` por un string aleatorio largo (mínimo 64 chars)
- [ ] Cambiar `MP_ACCESS_TOKEN` de TEST a PROD
- [ ] Activar HTTPS (Vercel/Netlify lo hacen automáticamente)
- [ ] Revisar `CORS` en `server.js` para que solo acepte el dominio real
- [ ] Asegurarse que `.env` NO está en el repo (está en `.gitignore`)

### Performance
- [ ] Comprimir imágenes con [squoosh.app](https://squoosh.app) antes de subir
- [ ] Activar gzip/brotli en el hosting del backend
- [ ] Subir fuentes a self-hosted si se quiere evitar dependencia de Google Fonts

### MongoDB
- [ ] Usar MongoDB Atlas en producción (no localhost)
- [ ] Activar IP Whitelist en Atlas para el servidor backend
- [ ] Habilitar backups automáticos en Atlas

### Mercado Pago
- [ ] Verificar que las `back_urls` apunten al dominio de producción
- [ ] Activar webhook en el panel de MP apuntando a `https://tudominio.com/api/payments/webhook`
- [ ] Probar el flujo completo con tarjeta de TEST antes de publicar

### Email
- [ ] Verificar que el App Password de Gmail funciona
- [ ] Hacer una compra de prueba y verificar que llegan los emails

## Variables de entorno en producción

```
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=string_muy_largo_y_aleatorio
MP_ACCESS_TOKEN=APP_USR-xxxx-PROD
FRONTEND_URL=https://tudominio.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=info@tattoostudio.com
EMAIL_PASS=app_password_16_chars
OWNER_EMAIL=dueno@email.com
SHIPPING_COST=1500
FREE_SHIPPING_FROM=15000
```

## Crear primer admin

Después de crear una cuenta normal, actualizá directamente en MongoDB:

```js
// En MongoDB Compass o Atlas
db.users.updateOne(
  { email: "tu@email.com" },
  { $set: { role: "admin" } }
)
```
