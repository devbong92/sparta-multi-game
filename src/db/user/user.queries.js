export const SQL_QUERIES = {
  FIND_USER_BY_DEVICE_ID: 'SELECT * FROM user WHERE device_id = ?',
  CREATE_USER: 'INSERT INTO user (id, device_id) VALUES (?,?)',
  UPDATE_USER_LOGIN: 'UPDATE user SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
  CREATE_GAME_END:
    'INSERT INTO game_end (id,user_id, start_time, end_time, x, y) VALUES (?,?,?,CURRENT_TIMESTAMP,?,?)',
  FIND_LAST_GAME_END_BY_USER_ID:
    'SELECT * FROM game_end WHERE user_id = ? ORDER BY end_time DESC LIMIT 1',
};
