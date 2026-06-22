# Despliegue en Vercel + Neon (0 €)

Guía para publicar **Verano Legendario** con uso personal/familiar.

## Arquitectura

```
┌─────────────────┐     ┌─────────────────┐
│  Vercel         │     │  Vercel         │
│  Player app     │     │  Admin app      │
│  apps/player    │     │  apps/admin     │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
         ┌───────────▼───────────┐
         │  Neon PostgreSQL      │  ← gratis (~0.5 GB)
         └───────────────────────┘
                     │
         ┌───────────▼───────────┐
         │  Vercel Blob (player) │  ← avatares subidos
         └───────────────────────┘
```

Dos proyectos en Vercel apuntando al **mismo repositorio**, cada uno con su carpeta raíz.

---

## Paso 1 — Base de datos (Neon)

1. Crea cuenta en [neon.tech](https://neon.tech).
2. **New project** → elige región cercana (p. ej. `eu-central-1`).
3. Copia la connection string **pooled** (recomendada para serverless):
   ```
   postgresql://user:pass@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```

4. Desde tu máquina, aplica el schema y el seed:

```bash
# En la raíz del repo, con DATABASE_URL apuntando a Neon
export DATABASE_URL="postgresql://..."
pnpm db:push
pnpm db:seed
```

> El seed crea el usuario demo. **Cámbiale la contraseña y el PIN** antes de usar en producción.

---

## Paso 2 — Secreto de sesión

Genera un `AUTH_SECRET` (mínimo 32 caracteres). Debe ser **el mismo** en player y admin:

```bash
openssl rand -base64 32
```

---

## Paso 3 — Proyecto Vercel: Player

1. [vercel.com](https://vercel.com) → **Add New Project** → importa el repo de GitHub.
2. Configuración:
   | Campo | Valor |
   |-------|-------|
   | **Root Directory** | `apps/player` |
   | **Framework** | Next.js (auto) |

3. El archivo `apps/player/vercel.json` ya define install/build del monorepo.

4. **Environment Variables** — añádelas para **Production** y **Preview**:

   | Variable | Valor | Obligatoria |
   |----------|-------|-------------|
   | `DATABASE_URL` | Connection string **pooled** de Neon | Sí |
   | `AUTH_SECRET` | El secreto generado | Sí |
   | `BLOB_READ_WRITE_TOKEN` | Auto al conectar Blob (paso 5) | Solo avatares |

   > Si el build muestra `[warn] DATABASE_URL`, la variable **no está definida** en ese proyecto Vercel. Sin `DATABASE_URL` el login fallará con error 500.

5. Deploy.

---

## Paso 4 — Proyecto Vercel: Admin

Repite el proceso con:

| Campo | Valor |
|-------|-------|
| **Root Directory** | `apps/admin` |

Variables:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | **La misma** que en player |
| `AUTH_SECRET` | **El mismo** que en player |

No hace falta `BLOB_READ_WRITE_TOKEN` en admin.

---

## Paso 5 — Avatares (Vercel Blob)

Los avatares subidos no pueden guardarse en disco en Vercel. El player usa **Vercel Blob** en producción.

1. En el proyecto **Player** de Vercel: **Storage** → **Create Database** → **Blob**.
2. Conecta el store al proyecto → se crea `BLOB_READ_WRITE_TOKEN` automáticamente.
3. Redeploy del player si hace falta.

En local sigue funcionando el almacenamiento en `public/avatars/custom/` (sin token).

---

## Paso 6 — Comprobar

| App | URL típica |
|-----|------------|
| Player | `https://tu-player.vercel.app` |
| Admin | `https://tu-admin.vercel.app` |

1. Admin → login con tu usuario (no dejes `parent123` en producción).
2. Player → PIN del personaje.
3. Sube un avatar en **Héroe** → debe persistir tras recargar.

---

## Dominios propios (opcional)

En cada proyecto Vercel → **Settings → Domains**:

- `verano.tudominio.com` → player  
- `admin.tudominio.com` → admin  

Neon y Vercel incluyen HTTPS automático.

---

## Coste estimado

| Servicio | Plan | Coste |
|----------|------|-------|
| Vercel Hobby | 2 proyectos | 0 € |
| Neon | Free tier | 0 € |
| Vercel Blob | Incluido en Hobby | 0 €* |

\* Límites generosos para una familia. Si crece el uso, Neon Pro ~19 $/mes o Vercel Pro.

---

## Actualizaciones

Cada push a `main` o `development` (según la rama conectada) redeploya automáticamente.

Si cambias el schema Prisma:

```bash
export DATABASE_URL="..."
pnpm db:push
```

---

## Problemas frecuentes

**Build falla con Prisma**
→ Comprueba que `pnpm db:generate` corre (postinstall en `@repo/database`).

**Login admin ok, player no (o al revés)**
→ `AUTH_SECRET` distinto entre proyectos.

**Avatares desaparecen**
→ Falta `BLOB_READ_WRITE_TOKEN` en el proyecto player.

**Error de conexión a BD**
→ Usa la URL **pooled** de Neon y `?sslmode=require`.

**Login player devuelve 500 (`digest:...`)**
→ Casi siempre: Prisma no encuentra el query engine en el bundle de Vercel (monorepo). `next.config.ts` debe incluir `outputFileTracingRoot` apuntando a la raíz del repo.
→ También: `DATABASE_URL` mal configurada, o no se ejecutó `pnpm db:push` / `pnpm db:seed` contra Neon.
→ En Vercel → proyecto Player → **Settings → Environment Variables** → comprueba `DATABASE_URL` (URL **pooled** con `-pooler` en el host).
→ Desde tu Mac:
```bash
export DATABASE_URL="postgresql://...tu-url-pooled-de-neon..."
pnpm db:push
pnpm db:seed
```
→ Redeploy del player. Si falla, revisa **Deployments → Functions → Logs** al intentar login.

**Build: `no output files found for @repo/database#build`**
→ Aviso inofensivo: esos paquetes no generan `.next/` ni `dist/`. Turbo los tiene con `cache: false`.

---

## Seguridad en producción

- [ ] Cambiar contraseña del padre demo  
- [ ] Cambiar PIN del personaje  
- [ ] `AUTH_SECRET` único y privado  
- [ ] No commitear `.env`  
