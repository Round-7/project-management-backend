#!/bin/sh
set -e

echo "Waiting for PostgreSQL to start..."
# 等待PostgreSQL启动
sleep 5

echo "Running database migrations..."
# 执行数据库迁移
bunx prisma migrate deploy

bunx prisma db push
bunx prisma generate

echo "Starting application..."
# 启动应用
exec "$@" 