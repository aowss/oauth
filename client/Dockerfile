FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json yarn.lock ./
RUN yarn install --production

# Bundle app source
COPY src src

EXPOSE 3000
CMD [ "yarn", "start" ]
