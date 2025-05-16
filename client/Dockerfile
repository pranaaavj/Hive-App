FROM node:20

WORKDIR /app

# Copy only package manager files to install dependencies first
COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install

# Do not copy source; using volume mount for live reload
EXPOSE 5173

# Ensure Vite dev server binds to 0.0.0.0 for Docker compatibility
CMD ["pnpm", "dev", "--", "--host", "0.0.0.0"]
