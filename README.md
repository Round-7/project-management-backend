# 项目管理系统 - 后端

项目管理系统的后端服务，基于 Hono.js 和 TypeScript，提供API接口。

## 技术栈

- Hono.js
- TypeScript
- Bun
- Prisma (ORM)
- Redis (缓存)
- PostgreSQL

## 快速开始

### 本地开发

#### 1. 安装依赖

```bash
cd backend
bun install
```

#### 2. 配置环境变量

复制`.env.example`文件并重命名为`.env`，然后配置必要的环境变量：

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/municipal
REDIS_URL=redis://localhost:6379
```

#### 3. 启动开发服务

```bash
bun run dev
```

#### 4. 构建项目

```bash
bun run build
```

### Docker部署

请参考 [Docker部署指南](./DOCKER.md) 进行部署和故障排除。

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
