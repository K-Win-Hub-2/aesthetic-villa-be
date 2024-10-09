FROM node:alpine

WORKDIR /usr/src/aesthetic-villa-be

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5909

CMD ["npm", "run", "dev"]