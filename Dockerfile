FROM nginx:stable-alpine
COPY --from=build /client/build /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/nginx.conf