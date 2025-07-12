# Stage 1: Build the Angular app  
FROM node:22-alpine AS build  
RUN apk add --no-cache git

WORKDIR /app  
COPY package.json package-lock.json ./
COPY scripts ./scripts
RUN mkdir -p src/environments
RUN npm install git-describe && npm install
RUN node scripts/set-version.js

COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve the app with Nginx  
FROM nginx:alpine

COPY --from=build /app/dist/angular-app/browser /usr/share/nginx/html  
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
