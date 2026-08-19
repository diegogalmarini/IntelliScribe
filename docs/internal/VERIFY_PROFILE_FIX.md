# Verificación de Perfil - diegorgandulfo@gmail.com

## Queries de Verificación

Ejecuta estas queries en Supabase SQL Editor para verificar:

### 1️⃣ Verificar que el perfil existe y tiene datos correctos
```sql
SELECT 
  id, 
  email, 
  first_name, 
  last_name, 
  plan_id, 
  subscription_status, 
  minutes_used, 
  minutes_limit, 
  role, 
  created_at
FROM profiles
WHERE email = 'diegorgandulfo@gmail.com';
```

**Resultado esperado**:
```
email: diegorgandulfo@gmail.com
first_name: Raul
last_name: Gandulfo
plan_id: free
subscription_status: active
minutes_used: 0
minutes_limit: 24
role: Member
```

---

### 2️⃣ Verificar que NO hay usuarios sin perfil
```sql
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) 
   FROM auth.users au 
   LEFT JOIN profiles p ON au.id = p.id 
   WHERE p.id IS NULL) as missing_profiles;
```

**Resultado esperado**:
```
total_auth_users: 3 (o el número que tengas)
total_profiles: 3 (mismo número que auth_users)
missing_profiles: 0  ← IMPORTANTE: debe ser 0
```

---

### 3️⃣ Ver todos los usuarios actuales
```sql
SELECT 
  email, 
  first_name, 
  last_name, 
  plan_id, 
  subscription_status,
  role
FROM profiles
ORDER BY created_at DESC;
```

**Resultado esperado**:
```
1. imnatipol@gmail.com - Nati Pol - free - active - Member
2. diegorgandulfo@gmail.com - Raul Gandulfo - free - active - Member
3. diegogalmarini@gmail.com - Diego Galmarini - business_plus - active - admin
```

---

## Verificación en CRM

Después de ejecutar las queries:

1. Ve a https://www.diktalo.com/admin
2. Click en "Users (CRM)" tab
3. Click en botón "🔄 Refresh"
4. Deberías ver a **Raul Gandulfo** en la lista

---

## ✅ Checklist de Verificación

- [ ] Query #1 devuelve 1 fila con datos de Raul Gandulfo
- [ ] Query #2 muestra `missing_profiles: 0`
- [ ] Query #3 muestra 3 usuarios (Diego admin, Raul, Nati)
- [ ] Raul Gandulfo aparece en el CRM del admin dashboard
- [ ] Raul puede hacer login sin problemas
- [ ] Al hacer Ctrl+Shift+F5, Raul sigue apareciendo

---

## 🔧 Si algo falla

### Si missing_profiles > 0
```sql
-- Arreglar todos los perfiles faltantes
INSERT INTO public.profiles (id, email, first_name, last_name, plan_id, subscription_status, minutes_used, minutes_limit, role, created_at)
SELECT id, email, 'User', '', 'free', 'active', 0, 24, 'Member', created_at
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = au.id)
ON CONFLICT (id) DO NOTHING;
```

### Si Raul no aparece en CRM pero sí en profiles
- Hacer hard refresh: Ctrl+Shift+F5
- Cerrar sesión de admin y volver a entrar
- Click en botón Refresh del CRM

### Si persiste el problema
- Toma screenshots de los resultados de las 3 queries
- Mándamelas para diagnosticar
