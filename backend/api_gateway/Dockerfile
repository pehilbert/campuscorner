FROM node:16

WORKDIR /service

COPY ./package*.json .

RUN npm install

COPY . .

ENV PORT=5000
EXPOSE 5000

CMD ["node", "server.js"]