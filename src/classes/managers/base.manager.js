class BaseManager {
  constructor() {
    // * BaseManager로 생성할 수 없게끔 막는 조건문
    if (new.target === BaseManager) {
      throw new TypeError('Cannot construct BaseManager instances');
    }
  }

  // * 필수 메소드, 오버라이딩하지 않고 쓰면 오류
  addPlayer(playerId, ...args) {
    throw new Error('Method not implemented.');
  }
  // * 필수 메소드, 오버라이딩하지 않고 쓰면 오류
  removePlayer(playerId) {
    throw new Error('Method not implemented.');
  }
  // * 필수 메소드, 오버라이딩하지 않고 쓰면 오류
  clearAll() {
    throw new Error('Method not implemented.');
  }
}

export default BaseManager;
