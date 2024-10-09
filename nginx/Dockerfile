FROM nginx

COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD sed -i "s|http://127.0.0.0|${SERVER_URL}|g" /etc/nginx/conf.d/default.conf && nginx -g "daemon off;"