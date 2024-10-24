import { config } from '../config/config.js';
import { addGameSession } from '../session/game.session.js';
import CustomError from '../utils/error/customError.js';

export const createGameSession = () => {
  try {
    const gameSession = addGameSession(config.game.gameId);
    console.log('### 게임 세션 생성 완료 : ', gameSession);
  } catch (error) {
    console.error(`### 게임 세션 생성 실패 : ${error}`);
    throw new CustomError(ErrorCodes.SERVER_BUILD_ERROR, '게임 세션 생성 실패.');
  }
};
