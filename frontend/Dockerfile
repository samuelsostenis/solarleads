FROM node:18

WORKDIR /usr/src/app

# install dependencies
COPY package*.json ./
RUN npm install --production=false

# copy source
COPY . .

ENV NODE_ENV=development
EXPOSE 5173

# start vite on 0.0.0.0 so it is accessible from host
CMD ["npm", "run", "dev", "--", "--host"]
