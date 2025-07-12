# Stage 1: Build the application  
FROM node:20-alpine AS build  
WORKDIR /app  
COPY package*.json ./  
RUN npm cache clean --force && npm install  
COPY . .  
RUN npm run build

# Stage 2: Run the application  
FROM node:22-alpine  
WORKDIR /app  
COPY --from=build /app/.output .  
ENV HOST=0.0.0.0  
EXPOSE 3000  
CMD ["node", "./server/index.mjs"]
