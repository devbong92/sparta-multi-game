import pools from '../db/database.js';
import { testAllConnections } from '../utils/db/testConnection.js';
import CustomError from '../utils/error/customError.js';
import { ErrorCodes } from '../utils/error/errorCodes.js';
import { createGameSession } from './createGameSession.js';
import { loadProtos } from './loadProtos.js';

const initServer = async () => {
  try {
    // * proto 파일 로드
    await loadProtos();

    // * db 연결 테스트
    await testAllConnections(pools);

    // * 게임 세션 생성
    createGameSession();
  } catch (e) {
    console.error('@@@ [initServer] load Error =>> ', e);
    // process.exit(1);
    throw new CustomError(ErrorCodes.SERVER_BUILD_ERROR, '[*] [initServer] load Error ');
  }
};

export default initServer;
