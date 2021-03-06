var o  = require('socket.io/lib/socket').prototype.onevent;

function KirigamiIOServer(io, bus) {
  this.io = io;
  this.bus = bus;

  bus.addDecorator('io.connection', function (namespace, socket, next) {
    socket.bus = bus;

    next();
  });

  io.on('connection', function (socket) {
    socket.constructor.prototype.onevent = function (event) {
      if (event) {
        if (event.type === require('socket.io-parser').EVENT) {
          if (this.bus) {
            this.bus.process('io.message', {
              socketId: this.id,
              nsp: event.nsp,
              event: event.data[0],
              args: event.data.slice(1)
            });
          }
        }
      }

      o.apply(this, Array.prototype.slice.call(arguments));
    }

    bus
    .process('io.connection', socket)
    .catch(function (err) {
      socket.close();
    });
  });
}


module.exports = KirigamiIOServer;
