
FROM node:18-slim
RUN apt update && apt install -y chromium
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]
