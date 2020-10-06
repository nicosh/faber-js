
FROM ubuntu:18.04
RUN apt-get update
RUN apt-get -y install curl
RUN apt-get -qq -y install curl
RUN apt-get install --yes curl
RUN curl --silent --location https://deb.nodesource.com/setup_14.x |  bash -
RUN apt-get install --yes nodejs
RUN apt-get install --yes build-essential
RUN apt-get install --yes  sox libsox-fmt-all
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY ./app /usr/src/app
RUN cd /usr/src/app
RUN npm install
RUN npm run build
EXPOSE 3000
CMD npm run start

