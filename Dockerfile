# Internet

# FROM node:20-alpine

# WORKDIR /app

# COPY package.json .

# RUN npm install --production

# COPY . .

# RUN chmod -R 755 /app

# EXPOSE 3000

# USER node

# CMD [ "node", "app.js" ]

#Non-internet
FROM node:20-alpine

WORKDIR /app

COPY 3api.tgz .
RUN npm install --production 3api.tgz

COPY . .

# Compare package.json
RUN cmp ./node_modules/backend/package.json ./package.json && \
mv ./node_modules/backend/node_modules/* ./node_modules/ && \
rm -r ./3api.tgz && \
chmod -R 755 /app

USER node

CMD [ "node", "app.js" ]