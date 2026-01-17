FROM node:18

WORKDIR /usr/src/app

# install dependencies
COPY package*.json ./
RUN npm install --production=false

# copy source
COPY . .

ENV NODE_ENV=development
EXPOSE 3005

CMD ["npm", "run", "dev"]
