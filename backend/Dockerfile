# TODO: adjust for build TS -> JS & file structure changes
FROM node:14-slim
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production
COPY . ./
CMD [ "node", "server.js" ]
