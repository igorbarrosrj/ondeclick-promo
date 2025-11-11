#!/bin/sh
set -e

echo "🔄 Aguardando PostgreSQL..."

# Aguarda o PostgreSQL estar pronto
until PGPASSWORD=$DATABASE_PASSWORD psql -h "$DATABASE_HOST" -U "$DATABASE_USER" -d "$DATABASE_NAME" -c '\q' 2>/dev/null; do
  echo "⏳ PostgreSQL não está pronto - aguardando..."
  sleep 2
done

echo "✅ PostgreSQL está pronto!"

# Extrai credenciais da DATABASE_URL se não estiverem definidas
if [ -z "$DATABASE_HOST" ] && [ -n "$DATABASE_URL" ]; then
  export DATABASE_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
  export DATABASE_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
  export DATABASE_USER=$(echo $DATABASE_URL | sed -n 's/.*\/\/\([^:]*\):.*/\1/p')
  export DATABASE_PASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
  export DATABASE_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
fi

echo "🔧 Executando migrations SQL..."

# Executa migrations na ordem
for sql_file in /app/backend/sql/*.sql; do
  if [ -f "$sql_file" ]; then
    echo "📄 Executando: $(basename $sql_file)"
    PGPASSWORD=$DATABASE_PASSWORD psql -h "$DATABASE_HOST" -U "$DATABASE_USER" -d "$DATABASE_NAME" -f "$sql_file" || echo "⚠️  Erro ao executar $(basename $sql_file) (pode ser esperado se já foi executado)"
  fi
done

echo "✅ Migrations concluídas!"
echo "🚀 Iniciando servidor..."

# Inicia o servidor
exec node backend/dist/server.js
