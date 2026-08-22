FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Grant full execute permissions to all binaries
RUN chmod -R +x node_modules/.bin || true

RUN npm run build

EXPOSE 5173

CMD ["sh", "-c", "npx serve -s dist -l ${PORT:-5173}"]
