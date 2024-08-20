FROM node:20-alpine AS build

WORKDIR /client

COPY package.json package-lock.json ./

RUN npm install --silent

COPY . ./

RUN npm run build