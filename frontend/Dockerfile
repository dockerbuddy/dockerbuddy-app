# Specify a base image
FROM node:alpine

WORKDIR '/app'
ENV DISABLE_ESLINT_PLUGIN=true

# Install some depenendencies
COPY package.json .
RUN yarn install
COPY . .



# Uses port which is used by the actual application
EXPOSE 3000
USER node

# Default command
CMD ["yarn", "run", "start"]