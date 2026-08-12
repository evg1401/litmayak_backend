export const cors = {
  origin: 'http://localhost:3000',
  allowedHeaders: 'Content-Type, Accept, Authorization, Device-Uid',
  exposedHeaders: 'Content-Type, Device-Uid',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  credentials: true,
  optionsSuccessStatus: 204,
  maxAge: 86400,
};
