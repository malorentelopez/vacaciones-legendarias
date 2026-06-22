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

Cada push a la rama conectada redeploya automáticamente. En este repo la rama activa es **`development`** (GitHub default: `main`).

Si cambias el schema Prisma:

```bash
export DATABASE_URL="..."
pnpm db:push
```

---

## Despliegues automáticos por rama

GitHub tiene `main` como rama por defecto, pero el desarrollo va en **`development`**. Vercel debe saber qué rama despliega a Production y cuáles generan Preview.

### Opción A — Production en `development` (recomendado si solo usas esa rama)

En cada proyecto Vercel (Player y Admin):

1. **Settings → Environments → Production**
2. **Branch** → cambia de `main` a **`development`**
3. Guarda

Cada push a `development` actualizará Production (incluido `player.veranolegendario.es` si el dominio está en Production).

### Opción B — Production en `main`, Preview en `development`

1. Deja Production Branch en **`main`**
2. Los pushes a `development` crean deployments **Preview** (URL distinta, p. ej. `…-git-development-….vercel.app`)
3. Mira la pestaña **Deployments** → filtra por Preview, no Production

### Si no se dispara ningún deploy al hacer push

1. **Settings → Git** → comprueba que el repo está conectado
2. **Settings → Git → Ignored Build Step** → debe estar vacío (o no ignorar `development`)
3. Reconecta GitHub: **Settings → Git → Disconnect** → **Connect** de nuevo
4. En GitHub: **Settings → Integrations → Vercel** → confirma acceso al repo
5. Deploy manual mientras tanto: **Deployments → Create Deployment** → elige rama `development` → **Deploy**

Los archivos `apps/*/vercel.json` incluyen `"git.deploymentEnabled.development": true` para no bloquear esa rama.

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

**Build supera 250 MB o tarda >6 min**
→ No usar `@prisma/nextjs-monorepo-workaround-plugin`: duplica el query engine en cada chunk serverless.
→ Prisma usa `engineType = "client"` (~2 MB WASM) con tracing mínimo en `next.config.ts`.

**Login player devuelve 500 — `query_compiler_bg.wasm` ENOENT**
→ `serverExternalPackages` incluye `@prisma/client`; `outputFileTracingIncludes` lista solo `query_compiler_bg.wasm`, `.js` y `schema.prisma`.

**Login player devuelve 500 (`digest:...`) o "No se pudo conectar con la base de datos"**
→ Si el log menciona `Query Engine for runtime "rhel-openssl-3.0.x"`: Prisma usa `engineType = "client"` con el driver HTTP de Neon (sin binario nativo).
→ `DATABASE_URL` debe ser la URL **pooled** de Neon (`-pooler` en el host, `?sslmode=require`).
→ Ejecuta `pnpm db:push` y `pnpm db:seed` contra Neon desde local.
→ Redeploy del player tras cada cambio en `@repo/database`.

**Build: `no output files found for @repo/database#build`**
→ Aviso inofensivo: esos paquetes no generan `.next/` ni `dist/`. Turbo los tiene con `cache: false`.

---

## Seguridad en producción

- [ ] Cambiar contraseña del padre demo  
- [ ] Cambiar PIN del personaje  
- [ ] `AUTH_SECRET` único y privado  
- [ ] No commitear `.env`  
