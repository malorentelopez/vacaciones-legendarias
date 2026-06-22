# Verano Legendario

Plataforma de gamificación familiar inspirada en RPG para el verano.

## Stack

- **Monorepo:** pnpm + Turborepo
- **Apps:** Next.js 15 (Player `:3000` + Admin `:3001`)
- **BD:** PostgreSQL + Prisma
- **Dominio:** DDD ligero en `packages/domain`

## Requisitos

- Node.js 20+
- pnpm 9+
- Docker (para PostgreSQL)

## Setup

```bash
# Instalar dependencias
pnpm install

# Levantar PostgreSQL
docker compose up -d

# Crear tablas y seed
pnpm db:push
pnpm db:seed

# Arrancar ambas apps
pnpm dev
```

## URLs

| App | URL | Credenciales demo |
|-----|-----|-------------------|
| Player | http://localhost:3000 | PIN: `1234` |
| Admin | http://localhost:3001 | `parent@demo.com` / `parent123` |

## Estructura

```
apps/
  player/     # App del niño/a
  admin/      # Panel de padres
packages/
  database/   # Prisma schema + client
  domain/     # Servicios y repositorios
  ui/         # Componentes compartidos
docs/         # Documentación del proyecto
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Arranca player + admin |
| `pnpm build` | Build de producción |
| `pnpm test` | Tests del dominio |
| `pnpm db:studio` | Prisma Studio |

## Despliegue

Guía paso a paso para **Vercel + Neon (0 €)**: [docs/deploy-vercel.md](docs/deploy-vercel.md)

## Fases implementadas

1. Personaje — dashboard, skills, selector multijugador
2. Misiones — completar, CRUD admin
3. XP y niveles — LevelConfiguration configurable
4. Logros — desbloqueo automático
5. Cristales y tienda — compra con aprobación parental
6. Admin completo — dashboard, CRUD, timeline, penalizaciones
7. Calendario — vista mensual
8. Avatar — personalización
9. Multijugador — selector de personajes familiar
