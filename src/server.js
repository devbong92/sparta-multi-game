import net from 'net';
import { config } from './config/config.js';
import initServer from './init/index.js';
import { onConnection } from './events/onConnection.js';

const server = net.createServer(onConnection);

// * 사전기능 .proto 파일로드, DB연결 등
// * 서버 기동시 필요한 기능이 정상적으로 된다면 서버를 띄움
initServer()
  .then(() => {
    server.listen(config.server.port, config.server.host, () => {
      console.log(`@@@ 서버가 [ ${config.server.host}:${config.server.port} ]에서 실행 중입니다.`);
      console.log('@@@ Address : ', server.address());
    });
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
