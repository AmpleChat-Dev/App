FROM node:14-alpine

WORKDIR /usr/src/app

COPY webpack.config.js ./
COPY package*.json ./

RUN npm install

COPY ./src ./src
COPY ./public ./public

RUN npm build

EXPOSE 5000

ENV HOST=0.0.0.0

CMD [ "npm", "start" ]