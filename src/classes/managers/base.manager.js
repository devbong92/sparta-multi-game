class BaseManager {
  constructor() {
    // BaseManager로 생성할 수 없게끔 막는 조건문
    if (new.target === BaseManager) {
      throw new TypeError('Cannot construct BaseManager instances');
    }
  }

  addPlayer(playerId, ...args) {
    throw new Error('Method not implemented.');
  }
  removePlayer(playerId) {
    throw new Error('Method not implemented.');
  }
  clearAll() {
    throw new Error('Method not implemented.');
  }
}

export default BaseManager;
