# Imagem usada apenas quando MESSAGING_PROVIDER=whatsapp-web (automacao real),
# ja que o whatsapp-web.js precisa de um Chromium instalado no sistema.
# Para o modo simples (MESSAGING_PROVIDER=none, sem automacao), este Dockerfile
# nao e necessario — a plataforma de deploy pode rodar o Node puro.
FROM node:20-slim

# Dependencias de sistema exigidas pelo Chromium (headless) usado pelo whatsapp-web.js
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-liberation \
    libnss3 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libxss1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# Evita que o "npm install" baixe o Chromium proprio do puppeteer (pesado);
# usamos o Chromium do sistema instalado acima.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .

EXPOSE 5000
CMD ["node", "src/server.js"]
