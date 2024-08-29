ARG ENVIRONMENT=development

FROM node:20-alpine

WORKDIR /client

EXPOSE 3000

COPY package.json package-lock.json ./

RUN npm install --silent

COPY . ./

RUN if [ "$ENVIRONMENT" = "production" ]; then npm run build; fi

CMD if [ "$ENVIRONMENT" = "development" ]; then npm start; fi