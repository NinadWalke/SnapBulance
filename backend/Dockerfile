# STAGE 1: The Builder (Heavy, has all dev dependencies)
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package files and Prisma schema FIRST (for optimal Docker layer caching)
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Use 'npm ci' (Clean Install) - it is stricter and faster than 'npm install' for CI/CD environments
RUN npm ci

# Copy the rest of your source code
COPY . .

# Generate Prisma Client and compile TypeScript to JavaScript
RUN npx prisma generate
RUN npm run build

# STAGE 2: Production Runner (Lightweight, secure)
FROM node:20-alpine AS production

WORKDIR /app

# Set Node environment to production
ENV NODE_ENV=production

# Copy package files and schema again
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Install ONLY production dependencies (ignores devDependencies like Jest, TS-Node, etc.)
# This drastically reduces the size of your final container and minimizes security vulnerabilities.
RUN npm ci --omit=dev

# Generate Prisma client for the production environment
RUN npx prisma generate

# Copy the compiled JavaScript from the builder stage
COPY --chown=node:node --from=builder /app/dist ./dist

# SECURITY: Never run your app as the 'root' user in production. 
# The node alpine image comes with a low-privilege user named 'node'. We switch to it.
USER node

# Document the port the container listens on
EXPOSE 3000

# The command that starts the app
CMD ["node", "dist/src/main.js"]