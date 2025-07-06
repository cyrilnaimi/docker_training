# Stage 1: Build the Angular app  
FROM node:20-alpine as build  
WORKDIR /app  
COPY package.json package-lock.json ./  
RUN npm install  
COPY . .  
RUN npm run build -- --configuration production
RUN ls -l /app/dist/angular-app/

# Stage 2: Serve the app with Nginx  
FROM nginx:alpine  
COPY --from=build /app/dist/angular-app/browser /usr/share/nginx/html  
COPY nginx.conf /etc/nginx/conf.d/default.conf  
EXPOSE 80
