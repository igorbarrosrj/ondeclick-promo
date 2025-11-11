-- Script de inicialização do PostgreSQL
-- Cria os bancos de dados necessários para a aplicação

-- Banco principal da aplicação (se não existir)
SELECT 'CREATE DATABASE rotacomercial'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'rotacomercial')\gexec

-- Banco do N8N (se não existir)
SELECT 'CREATE DATABASE n8n_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'n8n_db')\gexec
