# Docker 部署指南

## 快速启动

```bash
# 进入后端目录
cd backend

# 构建并启动所有服务
docker compose up -d

# 查看日志
docker compose logs -f
```

## 构建选项

```bash
# 仅构建，不启动
docker compose build

# 强制重新构建
docker compose build --no-cache

# 构建特定服务
docker compose build backend
```

## 常见问题

### 1. Prisma客户端初始化问题

如果遇到错误 `@prisma/client did not initialize yet. Please run "prisma generate" and try to import it again.`，原因可能是：

- Prisma客户端未正确生成
- OpenSSL依赖缺失
- 文件权限问题

**解决方案：**

1. 重建容器：

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

2. 手动进入容器生成Prisma客户端：

```bash
docker compose exec backend sh
cd /app
bunx prisma generate
exit
docker compose restart backend
```

### 2. 数据库连接错误

如果后端无法连接到数据库，请检查：

1. 确认PostgreSQL容器正在运行：

```bash
docker compose ps postgres
```

2. 检查数据库URL格式：

在Docker环境中，数据库主机应该是服务名`postgres`，而不是`localhost`：

```
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/municipal
```

3. 等待数据库就绪：

启动脚本中已包含5秒等待时间，如需增加等待时间，可编辑Dockerfile中的start.sh脚本。

### 3. 端口冲突

如果遇到端口冲突（如端口已被占用），可以修改docker-compose.yml中的端口映射：

```yaml
ports:
  - '8001:8000' # 将主机的8001端口映射到容器的8000端口
```

### 4. 容器权限问题

如果遇到文件权限问题，可以尝试以下方案：

```bash
# 重建容器
docker compose down
docker compose up -d --build
```

### 5. 查看容器日志

```bash
# 查看所有容器日志
docker compose logs

# 查看特定容器日志
docker compose logs backend
docker compose logs postgres

# 实时跟踪日志
docker compose logs -f backend
```

## 管理命令

```bash
# 启动所有服务
docker compose up -d

# 停止所有服务
docker compose down

# 重启特定服务
docker compose restart backend

# 查看服务状态
docker compose ps

# 进入容器
docker compose exec backend sh
```
