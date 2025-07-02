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