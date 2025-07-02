#!/bin/sh
set -e

echo "Waiting for PostgreSQL to start..."
# 更健壮的等待PostgreSQL启动方式
wait_for_postgres() {
  echo "Attempting to connect to PostgreSQL..."
  while ! bunx prisma db execute --stdin <<< "SELECT 1" > /dev/null 2>&1; do
    echo "PostgreSQL is unavailable - sleeping 2 seconds"
    sleep 2
  done
  echo "PostgreSQL is up and running!"
}

# 尝试等待，但设置超时时间
timeout=60
elapsed=0
while [ $elapsed -lt $timeout ]; do
  if wait_for_postgres; then
    break
  fi
  elapsed=$((elapsed+2))
  if [ $elapsed -ge $timeout ]; then
    echo "Timed out waiting for PostgreSQL, continuing anyway..."
    break
  fi
done

echo "Running database setup..."
# 先生成Prisma客户端
bunx prisma generate

# 尝试创建数据库（如果不存在）
echo "Creating database if not exists..."
bunx prisma db push --skip-generate --accept-data-loss

# 执行数据库迁移
echo "Running migrations..."
bunx prisma migrate deploy

echo "Starting application..."
# 启动应用
exec "$@" 