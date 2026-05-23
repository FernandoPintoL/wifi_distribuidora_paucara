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
