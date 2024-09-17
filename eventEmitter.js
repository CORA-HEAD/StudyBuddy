const EventEmitter = require('events');
const myEmitter = new EventEmitter();
myEmitter.setMaxListeners(50); // Increase limit to 50
module.exports = myEmitter;
