import { createLocationPacket } from '../../utils/notification/game.notification.js';
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
    // * 세션 유저 최대 인원수 체크
    if (this.users.length >= MAX_PLAYERS) {
      throw new Error('Game session is full');
    }
    // * 게임 세션에 유저 추가
    this.users.push(user);

    // * 추가 유저 PING 호출
    this.intervalManager.addPlayer(user.id, user.ping.bind(user), 1000);
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

  getAllLocation(userId) {
    // * 최대 레이턴시값 계산
    const maxLatency = this.getMaxLatency();

    const locationData = [];
    this.users.forEach((user) => {
      // * 전체 위치 정보를 주게되면 내 캐릭터가 2개 스폰되는 형상으로 본인 제외처리.
      if (user.id !== userId) {
        const { x, y } = user.calculatePosition(maxLatency);
        locationData.push({ id: user.id, playerId: user.playerId, x, y });
      }
    });

    // * LocationUpdate 패킷 생성
    return createLocationPacket(locationData);
  }
}

export default Game;
