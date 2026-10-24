# Stage 1: Build C++23 FastCGI Backend
FROM ubuntu:24.04 AS backend-builder
RUN apt-get update && apt-get install -y \
    build-essential cmake libfcgi-dev libsqlite3-dev libjson-c-dev libsystemd-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /src
COPY . .
RUN cmake -B build -DCMAKE_BUILD_TYPE=Release && cmake --build build --target jiralike -j$(nproc)

# Stage 2: Build Angular SPA Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /web
COPY web/package*.json ./
RUN npm install
COPY web/ ./
RUN npm run build

# Stage 3: Runtime Image (Nginx + FastCGI Backend)
FROM ubuntu:24.04
RUN apt-get update && apt-get install -y \
    nginx libfcgi0ldbl libsqlite3-0 libjson-c5 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/jiralike
COPY --from=backend-builder /src/jiralike /opt/jiralike/jiralike
COPY db/migrations /opt/jiralike/db/migrations
COPY --from=frontend-builder /web/dist/web/browser /opt/jiralike-fe
COPY nginx/000-jiralike.com /etc/nginx/sites-available/default

RUN mkdir -p /var/lib/jiralike/db /var/lib/jiralike/blobs

EXPOSE 80
CMD sh -c "/opt/jiralike/jiralike -n 127.0.0.1:9002 -w 4 -d /var/lib/jiralike/db/jiralike.db -u /var/lib/jiralike/blobs & nginx -g 'daemon off;'"
