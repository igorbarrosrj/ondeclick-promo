# Migração Supabase → PostgreSQL Nativo

## Mudanças Necessárias

### 1. Variáveis de Ambiente (.env)

Substitua:
```bash
NEXT_PUBLIC_SUPABASE_URL="http://69.62.101.194:8000"
NEXT_PUBLIC_SUPABASE_ANON_KEY="b8942dae583827aedd950b3ddc40368d5d713378d97e54dc1016612c0cff861f"
SUPABASE_SERVICE_ROLE_KEY="ba6363ed57e79c16ea83459c2087c8e00c7d27c2e034e56b6476d27bae4599ca55ca118aef70105c84520520945878f45b5d6e3fd896217cf7f9beb5c919735a"
```

Por:
```bash
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/ondeclick"
```

### 2. Package.json - JÁ FEITO ✅
- Removido `@supabase/supabase-js`
- Adicionado `pg` e `@types/pg`

### 3. Arquivos Criados - JÁ FEITO ✅
- `/backend/src/repositories/postgres-repository.ts` - Repository PostgreSQL nativo
- `/backend/src/config/postgres.ts` - Config do pool PostgreSQL

### 4. Próximos Passos

#### Atualizar Container (backend/src/adapters/next/container.ts)
Substituir `supabaseRepository` por `postgresRepository`

#### Atualizar Services
Todos os services que usam `SupabaseRepository` devem usar `PostgresRepository`

#### Atualizar Types (backend/src/types/database.ts)
Remover tipos específicos do Supabase

### 5. Dockerfile - Problema Atual

O build falha porque o TypeScript não compila devido aos erros do Supabase.

**Solução Temporária**: Comentar imports problemáticos até migração completa.

## Comandos para Testar

```bash
# 1. Instalar dependências
npm install

# 2. Build backend
npm run build:backend

# 3. Verificar se gerou dist/
ls -la backend/dist/

# 4. Build Docker
docker build -f Dockerfile.backend -t ondeclick-backend .
```

## Erros a Corrigir

1. ❌ `backend/src/repositories/supabase-repository.ts` - Deletar ou renomear
2. ❌ Todos os imports de `@supabase/supabase-js` - Substituir
3. ❌ `backend/src/config/supabase.ts` - Deletar
4. ❌ Services importando SupabaseRepository - Atualizar

## Status da Migração

- [x] Package.json atualizado
- [x] PostgresRepository criado
- [ ] Container atualizado
- [ ] Services atualizados
- [ ] Types atualizados
- [ ] Tests atualizados
- [ ] Build funcionando
