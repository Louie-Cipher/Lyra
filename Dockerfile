FROM node:20-slim

WORKDIR /usr/src/app

# COPY package*.json ./
# COPY tsconfig.json ./
# COPY environment.d.ts ./
# COPY src ./src
COPY . .

RUN npm install

RUN npm run build

CMD ["npm", "start"]
