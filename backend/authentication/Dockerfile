FROM node:16

WORKDIR /service

COPY ./package*.json .

RUN npm install

COPY . .

CMD ["node", "server.js"]