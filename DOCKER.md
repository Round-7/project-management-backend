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

### 3. 初始化数据库

首次运行时，需要初始化数据库：

```bash
docker-compose exec backend bun run migrate
```

### 4. 访问API

- 后端 API: http://服务器IP:8000

## 服务说明

- **backend**: Hono.js 后端 API 服务
- **postgres**: PostgreSQL 数据库
- **redis**: Redis 缓存服务

## 环境变量配置

### 后端环境变量

在`.env`文件或`docker-compose.yml`中为 backend 服务配置：

```yaml
environment:
  - NODE_ENV=production
  - PORT=8000
  - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/project_management
  - REDIS_URL=redis://redis:6379
```

## 数据持久化

数据通过 Docker 卷进行持久化存储：

- `postgres_data`: PostgreSQL 数据
- `redis_data`: Redis 数据

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
