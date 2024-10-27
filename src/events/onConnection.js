import { onData } from './onData.js';
import { onEnd } from './onEnd.js';
import { onError } from './onError.js';

// * connection
export const onConnection = (socket) => {
  console.log(`Client connected from: ${socket.remoteAddress}:${socket.remotePort}`);

  // * 각 클라이언트마다 고유한 버퍼를 유지시키기 위함
  socket.buffer = Buffer.alloc(0);

  socket.on('data', onData(socket));
  socket.on('end', onEnd(socket));
  socket.on('error', onError(socket));
};
