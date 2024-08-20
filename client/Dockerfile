FROM node:20-alpine

WORKDIR /client

EXPOSE 3000

COPY package.json package-lock.json ./

RUN npm install --silent

COPY . ./

CMD ["npm", "build"]