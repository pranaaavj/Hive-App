FROM node:20

WORKDIR /app

# Copy only the lock files and package config first
COPY package.json pnpm-lock.yaml ./

# Install pnpm and then project dependencies
RUN npm install -g pnpm && pnpm install

# Copy everything else
COPY . .

EXPOSE 5001

# Use local node_modules binaries
CMD ["pnpm", "dev"]
