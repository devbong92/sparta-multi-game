import { config } from '../config/config.js';
import { createGameEnd } from '../db/user/user.db.js';
import { getGameSession } from '../session/game.session.js';
import { removeUser } from '../session/user.session.js';

// * end
export const onEnd = (socket) => async () => {
  console.log('클라이언트 연결이 종료되었습니다.');

  // * 세션에서 유저 삭제
  const removedUser = removeUser(socket);

  // * 도전과제1, 게임종료 시, 유저의 마지막 위치를 저장
  await createGameEnd(removedUser);

  // * 게임세션에서도 삭제
  getGameSession(config.game.gameId).removeUser(removedUser.id);
};
