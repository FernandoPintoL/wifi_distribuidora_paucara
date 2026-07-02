# Distribuidora Paucara Portal

Portal cautivo y panel de vouchers para Distribuidora Paucara, pensado para integrarse con MikroTik HotSpot y PostgreSQL.

También incluye acceso con usuario y contraseña para clientes que no tengan voucher.

## Requisitos

- Node.js 20 o superior
- PostgreSQL accesible con la configuración de `.env.local`

## Variables de entorno

Usa estas credenciales como base:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=control
DB_USERNAME=postgres
DB_PASSWORD=1234
```

## Desarrollo

```bash
npm install
npm run dev
```

## Funcionalidad

- Landing pública de Distribuidora Paucara
- Redención de vouchers para Hotspot
- Registro y login de usuarios sin voucher
- Panel administrativo para crear y revisar vouchers
- Persistencia en PostgreSQL

## Integración con MikroTik (external login)

Este proyecto soporta un flujo básico para integrarse con el Hotspot de MikroTik mediante "External Login".

Pasos rápidos:

1. En MikroTik Hotspot, configura la URL de External Login apuntando a:

	`http://<tu-ip>:3000/api/mikrotik/external-login`

2. La ruta reenviará los parámetros que MikroTik envía (mac, ip, link-orig, etc.) hacia la portada del portal.

3. Para ejecutar comandos contra la API de MikroTik desde este backend (p. ej. crear un binding o usuario), define en tu `.env.local` las variables `MIKROTIK_HOST`, `MIKROTIK_USER`, `MIKROTIK_PASSWORD` y opcionalmente `MIKROTIK_PORT`.

4. Por seguridad las llamadas a la API están deshabilitadas por defecto. Para habilitarlas exporta `MIKROTIK_ALLOW_API=true` en tu entorno y usa el endpoint `POST /api/mikrotik/authorize` con payload `{ command: '/ip/hotspot/user/add', params: { name: 'user', password: 'pass' } }`.

Nota: `src/lib/mikrotik.ts` contiene un helper placeholder; implementaremos el cliente RouterOS real cuando quieras que conecte en producción.
