import BaseManager from './base.manager.js';

// * 인터벌 매니저
class IntervalManager extends BaseManager {
  constructor() {
    super();
    this.intervals = new Map();
  }

  // * 플레이어 추가
  addPlayer(playerId, callback, interval, type = 'user') {
    if (!this.intervals.has(playerId)) {
      this.intervals.set(playerId, new Map());
    }
    this.intervals.get(playerId).set(type, setInterval(callback, interval));
  }

  // 참고사항
  addGame(gameId, callback, interval) {
    this.addPlayer(gameId, callback, interval, 'game');
  }

  // * 플레이어 삭제
  removePlayer(playerId) {
    if (this.intervals.has(playerId)) {
      const userIntervals = this.intervals.get(playerId);
      userIntervals.forEach((intervalId) => clearInterval(intervalId));
      this.intervals.delete(playerId);
    }
  }

  addUpdatePosition(gameId, callback, interval) {
    this.addPlayer(gameId, callback, interval, 'updatePosition');
  }

  // * 인터벌 삭제
  removeInterval(playerId, type) {
    if (this.intervals.has(playerId)) {
      const userIntervals = this.intervals.get(playerId);
      if (userIntervals.has(type)) {
        clearInterval(userIntervals.get(type));
        userIntervals.delete(type);
      }
    }
  }

  // * 전체 삭제
  clearAll() {
    this.intervals.forEach((userIntervals) => {
      userIntervals.forEach((intervalId) => {
        clearInterval(intervalId);
      });
    });

    this.intervals.clear();
  }
}

export default IntervalManager;
