# 项目管理系统 - 后端

项目管理系统的后端服务，基于 Hono.js 和 TypeScript，提供API接口。

## 技术栈

- Hono.js
- TypeScript
- Bun
- Prisma (ORM)
- Redis (缓存)
- PostgreSQL

## Docker 部署

### 快速启动

使用 Docker Compose 可以一键启动整个后端环境（包括 PostgreSQL 和 Redis）：

```bash
# 构建并启动服务
docker compose up -d

# 查看日志
docker compose logs -f
```

### 环境变量

Docker Compose 已经配置了所有必要的环境变量，无需手动配置。如果需要修改，可以编辑 `docker-compose.yml` 文件的 environment 部分：

```yaml
environment:
  - NODE_ENV=development
  - PORT=8000
  - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/municipal
  - REDIS_URL=redis://redis:6379
```

### 端口映射

默认端口映射：
- 后端 API：8000 -> 8000
- PostgreSQL：5432 -> 5432
- Redis：6379 -> 6379

如需修改，请编辑 `docker-compose.yml` 文件的 ports 部分。

## 本地开发环境

### 环境准备

1. 安装 Bun：[https://bun.sh/](https://bun.sh/)
2. 安装 PostgreSQL
3. 安装 Redis

### 配置环境变量

复制 `.env.example` 到 `.env` 并根据你的本地环境修改：

```bash
cp .env.example .env
```

### 安装依赖

```bash
bun install
```

### 数据库迁移

```bash
bunx prisma generate
bunx prisma migrate dev
```

### 启动开发服务器

```bash
bun run dev
```

## API 文档

启动服务后，访问 Swagger UI：

```
http://localhost:8000/api/docs
```

## 常见问题

### Prisma客户端初始化问题

如果遇到错误 `@prisma/client did not initialize yet. Please run "prisma generate" and try to import it again.`，主要原因可能是：

1. Docker容器内Prisma客户端未正确生成
2. 挂载卷覆盖了容器内的node_modules和Prisma生成的文件
3. OpenSSL依赖缺失
4. 数据库连接URL配置错误

解决方法详见 [Docker部署指南](./DOCKER.md)。

## 开发环境设置

1. 安装依赖

```bash
bun install
```

2. 生成Prisma客户端

```bash
bunx prisma generate
```

3. 创建并迁移数据库

```bash
bunx prisma migrate dev
```

4. 启动开发服务器

```bash
bun run dev
```

## 环境变量

需要在`.env`文件中设置以下环境变量：

```
NODE_ENV=development
PORT=8000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/municipal
REDIS_URL=redis://localhost:6379
```

对于Docker环境，使用`postgres`和`redis`作为主机名：

```
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/municipal
REDIS_URL=redis://redis:6379
```

## API文档

API文档可在服务启动后访问：

```
http://localhost:8000/api/docs
```

## 项目结构

```
backend/
  - prisma/        # 数据库模型
  - src/
    - config/      # 配置文件
    - middlewares/ # 中间件
    - routes/      # API路由
    - schemas/     # 数据验证模式
    - services/    # 业务逻辑
    - types/       # 类型定义
    - utils/       # 工具函数
    - app.ts       # 应用入口
```

## 开发指南

- 所有API路由需要遵循RESTful设计规范
- 使用Zod进行请求数据验证
- 新增功能需要添加对应的单元测试
- 代码提交前运行`bun run lint`确保代码质量
