FROM oven/bun:latest

# 安装OpenSSL（Prisma依赖）
RUN apt-get update -y && apt-get install -y openssl && apt-get clean

WORKDIR /app

# 复制依赖相关文件
COPY package.json bun.lock* ./

# 安装依赖
RUN bun install --frozen-lockfile

# 复制所有源代码和环境文件
COPY . .

# 强制生成Prisma客户端
RUN bunx prisma generate --schema=./prisma/schema.prisma

# 暴露8000端口
EXPOSE 8000

# 启动应用（Bun会自动加载.env文件）
CMD ["sh", "-c", "bunx prisma generate && bun run start"] 