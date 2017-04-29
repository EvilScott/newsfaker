FROM kkarczmarczyk/node-yarn
WORKDIR /app
ADD . /app
RUN yarn install
RUN npm install -g nodemon
EXPOSE 4000
CMD yarn start
