FROM node:7.7-alpine

RUN npm install -g node-dev

WORKDIR /app
ADD . /app

EXPOSE 3000

CMD ["node-dev", "server.js"]
