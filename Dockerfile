FROM mcr.microsoft.com/playwright:v1.54.1-focal

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

EXPOSE 3000

CMD ["node", "server.js"]
