import { createPingPacket } from '../../utils/notification/game.notification.js';

class User {
  constructor(id, socket, deviceId, playerId, latency) {
    this.id = id;
    this.socket = socket;
    this.deviceId = deviceId;
    this.playerId = playerId; // * 캐릭터 타입
    this.latency = latency;
    // * 좌표 값
    this.x = 0;
    this.y = 0;
    // TODO: 추후 사용?
    this.sequence = 0;
    this.startTime = Date.now();
    this.lastUpdateTime = Date.now();
  }

  // * 좌표 업데이트
  updatePosition(x, y) {
    this.x = x;
    this.y = y;
    this.lastUpdateTime = Date.now();
  }

  // * 위치 계산
  calculatePosition(latency) {
    // const timeDiff = latency / 1000; // 초 단위
    // const speed = 1; // 속력은 1로 고정함, 원래는 게임 데이터 테이블에 저장되어있음.
    // const distance = speed * timeDiff; // 거속시 공식

    return {
      // x: this.x + distance,
      x: this.x,
      y: this.y,
    };
  }

  // * 유저에게 PING
  ping() {
    const now = Date.now();

    this.socket.write(createPingPacket(now));
  }

  // * 라운드 트립 레이턴시, 클라이언트에서 반환
  handlePong(data) {
    const now = Date.now();
    // * 왕복이니까 반으로 나눔
    this.latency = (now - data.timestamp) / 2;
    // * 확인용 로그
    console.log(`Received pong from user ${this.id} at ${now} with latency ${this.latency}ms`);
  }
}

export default User;
