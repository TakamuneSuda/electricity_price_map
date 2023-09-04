# 本番環境
FROM nginx:1.20.1-alpine

COPY ./app/dist /usr/share/nginx/html
ADD nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]