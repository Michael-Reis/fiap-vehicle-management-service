# Use Node.js 18 LTS como imagem base
FROM node:18-alpine AS base

# Configurar diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY tsconfig.json ./

# Copiar código fonte
COPY src/ ./src/

# Instalar todas as dependências (incluindo dev para o build)
RUN npm ci --ignore-scripts

# Fazer o build manualmente
RUN npm run build

# Limpar dependências de desenvolvimento e reinstalar só as de produção
RUN rm -rf node_modules && npm ci --only=production --ignore-scripts && npm cache clean --force

# Estágio de produção
FROM node:18-alpine AS production

# Instalar dumb-init e wget para gerenciar processos e healthcheck
RUN apk add --no-cache dumb-init wget

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001

# Configurar diretório de trabalho
WORKDIR /app

# Copiar dependências de produção do estágio base
COPY --from=base /app/node_modules ./node_modules

# Copiar código compilado do estágio base
COPY --from=base /app/dist ./dist

# Copiar package.json para ter acesso aos scripts
COPY package*.json ./

# Mudar propriedade dos arquivos para o usuário nodejs
RUN chown -R nodeuser:nodejs /app
USER nodeuser

# Expor porta
EXPOSE 3000

# Usar dumb-init como entrypoint e comando de start
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]