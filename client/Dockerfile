FROM node:20-alpine

WORKDIR /client

COPY package.json package-lock.json ./

RUN npm install --silent

COPY . ./

RUN npm run build