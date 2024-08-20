FROM node:20-alpine as build

WORKDIR /client

COPY package.json package-lock.json ./

RUN npm install --silent

COPY . ./

RUN npm run build

FROM node:20-slim

RUN npm install -g serve

COPY --from=build /client/build /client/build

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]