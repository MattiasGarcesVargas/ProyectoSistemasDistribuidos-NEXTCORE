# --- build web ---
FROM node:20-alpine AS webbuild
WORKDIR /web
COPY web/package*.json ./
RUN npm install
COPY web/ .
RUN npm run build

# --- build server ---
FROM node:20-alpine
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm install
COPY server ./server

# copia build react a /app/server/public
COPY --from=webbuild /web/dist ./server/public

WORKDIR /app/server
EXPOSE 8080
CMD ["node", "index.js"]