# Dockerfile para desenvolvimento com hot-reload
FROM oven/bun:1

WORKDIR /app

# Instalar ferramentas de desenvolvimento
RUN apt-get update && apt-get install -y \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar arquivos de dependências
COPY package.json bun.lockb* ./

# Instalar dependências
RUN bun install

# Expor porta de desenvolvimento
EXPOSE 3000

# Comando padrão (será sobrescrito pelo docker-compose)
CMD ["bun", "run", "dev"]