FROM oven/bun:latest

WORKDIR /app

# 复制依赖相关文件
COPY package.json bun.lock* ./

# 安装依赖
RUN bun install --frozen-lockfile

# 复制所有源代码和环境文件
COPY . .

# 运行Prisma生成
RUN bunx prisma migrate deploy

# 暴露8000端口
EXPOSE 8000

# 启动应用（Bun会自动加载.env文件）
CMD ["bun", "run", "start"] 