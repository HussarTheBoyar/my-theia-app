FROM node:18
WORKDIR /app
RUN npm install -g yo generator-theia-extension
CMD ["yo", "theia-extension"]