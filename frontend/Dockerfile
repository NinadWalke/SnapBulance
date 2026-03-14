# STAGE 1: The Builder (Node.js)
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Declare Build Arguments
ARG VITE_ENVIRONMENT
ARG VITE_API_URL_LOCAL

# Set them as Environment Variables for the build step
ENV VITE_ENVIRONMENT=$VITE_ENVIRONMENT
ENV VITE_API_URL_LOCAL=$VITE_API_URL_LOCAL

# This turns your React/Vite code into static files in the /dist folder
RUN npm run build

# STAGE 2: Production Server (Nginx)
FROM nginx:alpine AS production

# Remove the default Nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy your compiled React static files from the builder stage into Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# We need a custom Nginx config for React Router (Single Page Application)
# Without this, if a user refreshes the page on /user/home, Nginx throws a 404!
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]