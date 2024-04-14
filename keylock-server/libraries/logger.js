const pino = require('pino');
module.exports = logger = pino({
  transport: {
    target: 'pino-pretty'
  },
});


