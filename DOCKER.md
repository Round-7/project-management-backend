# Docker 部署指南

本项目使用 Docker Compose 进行容器化部署，包括后端API服务、PostgreSQL 数据库和 Redis 缓存服务。

## 前置条件

- 安装 Docker 和 Docker Compose
- 确保 8000、5432 和 6379 端口可用

## 快速开始

### 1. 构建并启动所有服务

在backend目录执行：

```bash
docker-compose up -d
```

初次运行时会自动构建镜像，这可能需要一些时间。

### 2. 查看服务状态

```bash
docker-compose ps
```

### 3. 访问API

- 后端 API: http://服务器IP:8000

## 服务说明

- **backend**: Hono.js 后端 API 服务
- **postgres**: PostgreSQL 数据库
- **redis**: Redis 缓存服务

## 环境变量配置

### 后端环境变量

在docker-compose.yml中配置了以下环境变量：

```yaml
environment:
  - NODE_ENV=development
  - PORT=8000
  - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/municipal
  - REDIS_URL=redis://redis:6379
```

## 数据持久化

数据通过 Docker 卷进行持久化存储：

- `postgres_data`: PostgreSQL 数据
- `redis_data`: Redis 数据

## 数据库迁移

系统启动时会自动执行Prisma数据库迁移。如果需要手动执行迁移，可以使用以下命令：

```bash
docker-compose exec backend bunx prisma migrate deploy
```

## 问题解决：Prisma客户端初始化

如果遇到错误 `@prisma/client did not initialize yet. Please run "prisma generate" and try to import it again.`，请按照以下步骤解决：

### 方法一：进入容器手动初始化

1. 确保容器已启动

```bash
docker ps
```

2. 进入backend容器

```bash
docker exec -it backend sh
```

3. 在容器内执行以下命令

```bash
cd /app
bunx prisma generate
bunx prisma migrate deploy
```

4. 重启容器

```bash
docker restart backend
```

### 方法二：修改Dockerfile

如果方法一无法解决问题，请修改Dockerfile并重新构建：

1. 确保Dockerfile中包含以下内容：

```dockerfile
FROM oven/bun:latest

# 安装系统依赖
RUN apt-get update -y && \
    apt-get install -y openssl curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 复制依赖相关文件
COPY package.json bun.lock* ./
COPY prisma ./prisma/

# 安装依赖
RUN bun install --frozen-lockfile

# 先生成Prisma客户端
RUN bunx prisma generate

# 复制所有源代码和环境文件
COPY . .

# 暴露8000端口
EXPOSE 8000

# 创建启动脚本
RUN echo '#!/bin/sh\n\
echo "Waiting for database..."\n\
sleep 5\n\
\n\
echo "Regenerating Prisma client..."\n\
bunx prisma generate\n\
\n\
echo "Running migrations..."\n\
bunx prisma migrate deploy\n\
\n\
echo "Starting application..."\n\
bun run start\n\
' > /app/start.sh && chmod +x /app/start.sh

# 启动应用
CMD ["/app/start.sh"]
```

2. 删除docker-compose.yml中的卷挂载（避免覆盖容器中的node_modules和Prisma生成的文件）

```yaml
services:
  backend:
    # ...其他配置...
    volumes: [] # 移除卷挂载
```

3. 重新构建容器

```bash
docker compose build backend
docker compose up -d
```

### 方法三：更改数据库连接URL

如果使用的是docker-compose，确保DATABASE_URL使用服务名而不是localhost：

```
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/municipal
```

而不是：

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/municipal
```

## 常用操作

### 停止所有服务

```bash
docker-compose down
```

### 重启特定服务

```bash
docker-compose restart <服务名>
```

### 查看服务日志

```bash
docker-compose logs -f <服务名>
```

### 进入容器内部

```bash
docker-compose exec <服务名> sh
```
