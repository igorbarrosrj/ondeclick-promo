#!/bin/sh
set -e

echo "🔄 Aguardando PostgreSQL..."

# Extrai credenciais da DATABASE_URL
# postgresql://user:password@host:port/database
export DATABASE_HOST=$(echo $DATABASE_URL | sed -n 's|.*@\([^:]*\):.*|\1|p')
export DATABASE_PORT=$(echo $DATABASE_URL | sed -n 's|.*:\([0-9]*\)/.*|\1|p')
export DATABASE_USER=$(echo $DATABASE_URL | sed -n 's|.*://\([^:]*\):.*|\1|p')
export DATABASE_PASSWORD=$(echo $DATABASE_URL | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p')
export DATABASE_NAME=$(echo $DATABASE_URL | sed -n 's|.*/\([^?]*\).*|\1|p')

echo "Conectando em: $DATABASE_HOST:$DATABASE_PORT/$DATABASE_NAME como $DATABASE_USER"

# Aguarda o PostgreSQL estar pronto
until PGPASSWORD=$DATABASE_PASSWORD psql -h "$DATABASE_HOST" -p "$DATABASE_PORT" -U "$DATABASE_USER" -d "$DATABASE_NAME" -c '\q' 2>/dev/null; do
  echo "⏳ PostgreSQL não está pronto - aguardando..."
  sleep 3
done

echo "✅ PostgreSQL está pronto!"
echo "🔧 Executando migrations SQL..."

# Executa migrations na ordem
for sql_file in /app/backend/sql/*.sql; do
  if [ -f "$sql_file" ]; then
    echo "📄 Executando: $(basename $sql_file)"
    PGPASSWORD=$DATABASE_PASSWORD psql -h "$DATABASE_HOST" -p "$DATABASE_PORT" -U "$DATABASE_USER" -d "$DATABASE_NAME" -f "$sql_file" 2>&1 || echo "⚠️  Erro ao executar $(basename $sql_file) (pode já ter sido executado)"
  fi
done

echo "✅ Migrations concluídas!"
echo "🚀 Iniciando servidor..."

# Inicia o servidor
exec node backend/dist/server.js
