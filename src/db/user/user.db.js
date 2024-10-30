import { formatTimestampToMysqlDateTime } from '../../utils/dateFormatter.js';
import CustomError from '../../utils/error/customError.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { toCamelCase } from '../../utils/transformCase.js';
import pools from '../database.js';
import { SQL_QUERIES } from './user.queries.js';
import { v4 as uuidv4 } from 'uuid';

// * deviceId를 통해 user 테이블 조회
export const findUserByDeviceId = async (deviceId) => {
  const [rows] = await pools.USER_DB.query(SQL_QUERIES.FIND_USER_BY_DEVICE_ID, [deviceId]);
  return toCamelCase(rows[0]);
};

// * user 테이블에 데이터 입력
export const createUser = async (deviceId) => {
  const id = uuidv4();
  await pools.USER_DB.query(SQL_QUERIES.CREATE_USER, [id, deviceId]);
  return { id, deviceId };
};

// * user 테이블 last_login update
export const updateUserLogin = async (id) => {
  await pools.USER_DB.query(SQL_QUERIES.UPDATE_USER_LOGIN, [id]);
};

// * game_end 테이블에 데이터 입력
export const createGameEnd = async (user) => {
  console.log('[ createGameEnd ] =>>> ', user);
  // * 유저가 없는 경우,
  if (!user) {
    throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유저를 찾을 수 없습니다.');
  }
  const id = uuidv4();
  await pools.USER_DB.query(SQL_QUERIES.CREATE_GAME_END, [
    id,
    user.id,
    formatTimestampToMysqlDateTime(user.startTime),
    user.x,
    user.y,
  ]);
};

// * game_end 테이블에서 가장 최근 유저 데이터 조회
export const findLastGameEndByUserId = async (userId) => {
  const [rows] = await pools.USER_DB.query(SQL_QUERIES.FIND_LAST_GAME_END_BY_USER_ID, [userId]);
  return toCamelCase(rows[0]);
};
