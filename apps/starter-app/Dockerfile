# Use the official Node.js runtime as the base image
FROM --platform=linux/amd64 node:22-slim

# Set the working directory in the container
WORKDIR /app

# Copy package.json (But not package-lock.json bc of a npm bug with optional dependencies across mac/linux)
COPY package.json ./

# Copy packages directory for local workspace packages
COPY packages/ ./packages/

# Copy the specific app's package.json
COPY apps/starter-app/package.json ./apps/starter-app/

# Install Node.js dependencies (this will install workspace dependencies)
RUN npm install

# Copy the rest of the application code
COPY apps/starter-app/ ./apps/starter-app/

# Change to the app directory and build
WORKDIR /app/apps/starter-app
RUN NODE_ENV=production npm run build

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "build"]
