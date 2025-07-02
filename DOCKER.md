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

## 故障排除

### Prisma客户端初始化问题

如果遇到以下错误：

```
error: @prisma/client did not initialize yet. Please run "prisma generate" and try to import it again.
```

可以通过以下步骤解决：

1. 进入容器执行Prisma生成命令：

```bash
docker-compose exec backend bunx prisma generate
```

2. 重启服务：

```bash
docker-compose restart backend
```

### 数据库连接问题

如果遇到数据库连接问题，请确保：

1. PostgreSQL容器已正常启动
2. 环境变量中的数据库URL格式正确
3. 数据库名称为"municipal"
4. 使用服务名称"postgres"作为主机名，而不是"localhost"

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
