import { config } from '../config/config.js';
import { createGameEnd } from '../db/user/user.db.js';
import { getGameSession } from '../session/game.session.js';
import { removeUser } from '../session/user.session.js';

// * error
export const onError = (socket) => async (err) => {
  console.error('소켓 오류:', err);
  // * 세션에서 유저 삭제
  const removedUser = removeUser(socket);

  // * 도전과제1, 게임종료 시, 유저의 마지막 위치를 저장
  await createGameEnd(removedUser);

  // * 게임세션에서도 삭제
  getGameSession(config.game.gameId).removeUser(user.id);
};
