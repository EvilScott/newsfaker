FROM kkarczmarczyk/node-yarn
WORKDIR /app
ADD . /app
RUN yarn install
EXPOSE 4000
CMD yarn start
