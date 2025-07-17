# Use Playwright official image with browsers pre-installed
FROM mcr.microsoft.com/playwright:focal

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of app code
COPY . .

# Avoid reinstalling browsers since base image has them
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

EXPOSE 3000

CMD ["node", "server.js"]
