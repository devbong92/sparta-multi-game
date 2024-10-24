import { config } from '../../config/config.js';
import { HANDLER_IDS, RESPONSE_SUCCESS_CODE } from '../../constants/handlerIds.js';
import {
  createUser,
  findLastGameEndByUserId,
  findUserByDeviceId,
  updateUserLogin,
} from '../../db/user/user.db.js';
import { getGameSession } from '../../session/game.session.js';
import { addUser } from '../../session/user.session.js';
import { handleError } from '../../utils/error/errorHandler.js';
import { createResponse } from '../../utils/response/createResponse.js';

const initialHandler = async ({ socket, userId, payload }) => {
  //

  try {
    // * playerId
    const { deviceId, playerId, latency } = payload;
    // TODO: deviceId === payload.deviceId
    console.log('[ initial ] deviceId  payload =>>> ', deviceId, payload);

    // * MySQL.User테이블에서 deviceId를 통해서 유저 조회
    let user = await findUserByDeviceId(deviceId);

    console.log('[ findUserByDeviceId =>> ', user);
    if (!user) {
      // * 유저 테이블에 신규 유저 저장
      user = await createUser(deviceId);
    } else {
      // * 유저 테이블 로그인 이력 최신화
      await updateUserLogin(user.id);
    }

    // * User클래스 생성 및 userSessions에 저장
    let cUser = addUser(socket, user.id, user.deviceId, playerId, latency);

    // * 게임 세션에 유저 추가
    const gameSession = getGameSession(config.game.gameId);
    gameSession.addUser(cUser);

    // TODO: 도전과제1 마지막위치 전달
    let lastX = config.game.defaultX,
      lastY = config.game.defaultY;
    const lastGameEndData = await findLastGameEndByUserId(user.id);
    console.log('@@@ lastGameEndData =>>> ', lastGameEndData);
    if (lastGameEndData) {
      lastX = lastGameEndData.x;
      lastY = lastGameEndData.y;
    }

    // * 응답 처리
    const initialResponse = createResponse(
      HANDLER_IDS.INITIAL,
      RESPONSE_SUCCESS_CODE,
      { userId: user.id, x: lastX, y: lastY },
      deviceId,
    );

    // 뭔가 처리가 끝났을때 보내는 것
    socket.write(initialResponse);
  } catch (e) {
    handleError(socket, e);
  }
};

export default initialHandler;
