# 1. Etapa de compilación
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --configuration=production

# 2. Etapa de producción (Servidor Web Nginx)
FROM nginx:1.25-alpine
# Copia los archivos compilados de Angular a Nginx
COPY --from=builder /app/dist/shop/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
