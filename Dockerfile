FROM node:10
RUN mkdir -p /usr/src/proxy
WORKDIR /usr/src/proxy
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD ["npm", "run", "start:proxy"]
