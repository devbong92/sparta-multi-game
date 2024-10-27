import Game from '../classes/models/game.class.js';
import { gameSessions } from './sessions.js';

// * 게임 세션 추가
export const addGameSession = (id) => {
  const session = new Game(id);
  gameSessions.push(session);
  return session;
};

// * 게임 세션 삭제
export const removeGameSession = (id) => {
  const index = gameSessions.findIndex((game) => game.id === id);
  if (index !== -1) {
    return gameSessions.splice(index, 1)[0];
  }
};

// * 게임 세션 조회
export const getGameSession = (id) => {
  return gameSessions.find((game) => game.id === id);
};

// * 전체 게임 세션 조회
export const getAllGameSessions = () => {
  return gameSessions;
};
