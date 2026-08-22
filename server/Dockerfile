FROM node:20-slim

WORKDIR /app

# Install openssl for Prisma support in slim Debian
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

# Grant full execute permissions to all binaries
RUN chmod -R +x node_modules/.bin || true

RUN npx prisma generate
RUN npx tsc

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "dist/index.js"]
