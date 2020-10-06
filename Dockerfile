FROM node:10-alpine

RUN mkdir -p /usr/src/staff-slack-hub
WORKDIR /usr/src/staff-slack-hub
COPY . /usr/src/staff-slack-hub

RUN npm install

EXPOSE 3000
CMD ["npm", "start"]