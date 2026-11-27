# ============================================================
# Multi-stage Dockerfile for RakshaAI
# Stage 1: Build the React app
# Stage 2: Serve with nginx
# ============================================================

# --- Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --frozen-lockfile

# Copy source
COPY . .

# Build — uses VITE_ env vars from docker-compose
ARG VITE_GEMINI_API_KEY=""
ARG VITE_OVERPASS_API_URL="https://overpass-api.de/api/interpreter"
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
ENV VITE_OVERPASS_API_URL=$VITE_OVERPASS_API_URL

RUN npm run build

# --- Serve Stage ---
FROM nginx:alpine AS production

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx config for SPA routing
RUN printf 'server {\n\
    listen 80;\n\
    server_name _;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
    gzip on;\n\
    gzip_types text/plain text/css application/javascript application/json;\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
