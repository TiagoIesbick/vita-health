FROM node:20-alpine

WORKDIR /client

COPY package.json package-lock.json ./

RUN npm install --silent

COPY . ./

RUN if [ "$ENVIRONMENT" = "production" ]; then npm run build; fi

CMD if [ "$ENVIRONMENT" = "development" ]; then npm start; fi