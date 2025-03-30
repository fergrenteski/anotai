# Usa uma imagem oficial do Node.js como base
FROM node:18

# Define o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copia os arquivos de dependências para instalar primeiro (otimiza cache)
COPY package.json package-lock.json ./

# Instala as dependências do backend
RUN npm install

# Copia todos os arquivos do backend para o container
COPY . .

# Expõe a porta 3000 para acesso externo
EXPOSE 3000

# Inicia o servidor do backend
CMD ["node", "server.js"]
