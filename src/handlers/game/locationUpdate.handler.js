import { config } from '../../config/config.js';
import { getGameSession } from '../../session/game.session.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { handleError } from '../../utils/error/errorHandler.js';

const locationUpdateHandler = ({ socket, userId, payload }) => {
  try {
    // * 유저 좌표
    const { x, y } = payload;

    // * 게임세션 조회
    const gameSession = getGameSession(config.game.gameId);
    console.log('@@@ [ locationUpdateHandler ]gameSession =>>> ,', gameSession);

    if (!gameSession) {
      throw new CustomError(ErrorCodes.GAME_NOT_FOUND, '게임 세션을 찾을 수 없습니다.');
    }

    console.log('@@@ userId =>>>  ', userId, `, (x,y) =>> (${x},${y})`);
    // * deviceId를 통해 게임세션에서 유저 조회
    const user = gameSession.getUser(userId);
    if (!user) {
      throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유저를 찾을 수 없습니다.');
    }

    // * 유저 위치정보 업데이트
    user.updatePosition(x, y);

    // * 게임세션 전체 위치정보 조회
    const packet = gameSession.getAllLocation(userId);

    // * 게임세션 전체 위치정보 전송
    socket.write(packet);
  } catch (e) {
    // * 오류 응답 처리
    handleError(socket, e);
  }
};

export default locationUpdateHandler;
