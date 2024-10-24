import BaseManager from './base.manager.js';

class IntervalManager extends BaseManager {
  constructor() {
    super();
    this.intervals = new Map();
  }

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

  removeInterval(playerId, type) {
    if (this.intervals.has(playerId)) {
      const userIntervals = this.intervals.get(playerId);
      if (userIntervals.has(type)) {
        clearInterval(userIntervals.get(type));
        userIntervals.delete(type);
      }
    }
  }

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
