import net from 'net';
import { config } from './config/config.js';

const server = net.createServer();

server.listen(config.server.port, config.server.host, () => {
  console.log(`서버가 [ ${config.server.host}:${config.server.port} ]에서 실행 중입니다.`);
  console.log(server.address());
});
