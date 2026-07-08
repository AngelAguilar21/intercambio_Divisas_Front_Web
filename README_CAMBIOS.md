# Paquete de actualización Ezchange Web + Supabase

Reemplaza/crea estos archivos en `intercambio_Divisas_Front_Web`.

## Crear
- `.env.example`
- `src/services/supabaseClient.js`
- `src/services/ezchangeService.js`
- `supabase/functions/send-pending-emails/index.ts`
- `supabase/functions/send-pending-emails/deno.json`
- `supabase/sql/README_incremental.sql`

## Reemplazar
- `package.json`
- `quasar.config.js`
- `src/stores/auth.js`
- `src/pages/auth/RegisterPage.vue`
- `src/pages/HistorialPage.vue`
- `src/pages/admin/AdminDashboardPage.vue`
- `src/pages/admin/AdminUsuariosPage.vue`
- `src/services/*.js` incluidos en este paquete

## Variables necesarias
Copia `.env.example` a `.env` y completa:

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_ANON_KEY
```

## Dependencia nueva
```powershell
npm install @supabase/supabase-js
```

## SQL
No se requiere SQL incremental si ya ejecutaste `script_completo_supabase_ezchange.sql` completo.
