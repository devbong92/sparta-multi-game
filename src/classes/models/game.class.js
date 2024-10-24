import {
  createLocationPacket,
  gameStartNotification,
} from '../../utils/notification/game.notification.js';
import IntervalManager from '../managers/interval.manager.js';

const MAX_PLAYERS = 2;
class Game {
  constructor(id) {
    this.id = id;
    this.users = [];
    this.intervalManager = new IntervalManager();
    this.state = 'waiting'; // 'waiting', 'inProgress'
  }

  addUser(user) {
    if (this.users.length >= MAX_PLAYERS) {
      throw new Error('Game session is full');
    }
    this.users.push(user);
  }

  getUser(userId) {
    return this.users.find((user) => user.id === userId);
  }

  removeUser(userId) {
    this.users = this.users.filter((user) => user.id !== userId);
    this.intervalManager.removePlayer(userId);

    if (this.users.length < MAX_PLAYERS) {
      this.state = 'waiting';
    }
  }

  getMaxLatency() {
    let maxLatency = 0;
    this.users.forEach((user) => {
      maxLatency = Math.max(maxLatency, user.latency);
    });
    return maxLatency;
  }

  getAllLocation(deviceId) {
    const maxLatency = this.getMaxLatency();

    // TODO: 전체 위치 정보를 주게되면 내 캐릭터가 2개 스폰되는 형상으로 본인 제외처리.
    const locationData = [];
    this.users.forEach((user) => {
      if (user.id !== deviceId) {
        const { x, y } = user.calculatePosition(maxLatency);
        locationData.push({ id: user.id, x, y });
      }
    });

    return createLocationPacket(locationData);
  }
}

export default Game;
