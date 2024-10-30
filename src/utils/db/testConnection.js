import CustomError from '../error/customError.js';
import { ErrorCodes } from '../error/errorCodes.js';
import { handleError } from '../error/errorHandler.js';

// * DB 연결 테스트
const testDbConnection = async (pool, dbName) => {
  try {
    const [rows] = await pool.query(`SELECT 1 + 1 AS solution `);
    console.log(`${dbName} 테스트 쿼리 결과 ${rows[0].solution}`);
  } catch (e) {
    console.error(`${dbName} 테스트 쿼리 실행 중 오류 발생 ${e}`);
    throw new CustomError(ErrorCodes.DB_CONNECTION_ERROR, '데이터 베이스 연결에 실패했습니다.');
  }
};

// * 전체 DB 연결 테스트
const testAllConnections = async (pools) => {
  // await testDbConnection(pools.GAME_DB, 'GAME_DB');
  await testDbConnection(pools.USER_DB, 'USER_DB');
};

export { testDbConnection, testAllConnections };
