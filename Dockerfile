FROM node:24-alpine

COPY . .

EXPOSE 3000

CMD ["node", "dist/src/main.js"]