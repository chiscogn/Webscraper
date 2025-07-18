# Use a valid version — 1.43.1 is compatible with your package.json
FROM mcr.microsoft.com/playwright:v1.43.1-focal

WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your app
COPY . .

# Expose the app port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
