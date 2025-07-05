# Stage 1: Build the Angular app  
FROM node:20-alpine as build  
WORKDIR /app  
COPY package.json package-lock.json ./  
RUN npm install  
COPY . .  
RUN npm run build -- --configuration production

# Stage 2: Serve the app with Nginx  
FROM nginx:alpine  
COPY --from=build /app/dist/angular-app/ /usr/share/nginx/html  
EXPOSE 80
