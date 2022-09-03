FROM node:12.13.1

ENV APP_DIR /src/app

RUN mkdir -p $APP_DIR

WORKDIR ${APP_DIR}

RUN apt-get update && apt-get install -y graphicsmagick=1.3.30+hg15796-1~deb9u2 

ADD ./package.json .

RUN npm install

COPY . .

RUN chown -R node:node client api

USER node

