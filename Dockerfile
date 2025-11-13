# Base image
FROM node:20-bookworm-slim

# Enable pnpm via Corepack (pinned to repo version)
ENV COREPACK_HOME=/usr/local/share/corepack
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json pnpm-lock.yaml ./
# Copy patches directory before installing dependencies
COPY patches/ ./patches/
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Expose dev port (will be overridden by docker-compose)
EXPOSE ${PORT:-3000}

# Default env for dev inside container
ENV NODE_ENV=development

# Startup script runs migrations (if DB present) then starts dev server
CMD ["bash", "./scripts.docker-dev.sh"]
