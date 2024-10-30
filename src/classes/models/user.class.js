import { createPingPacket } from '../../utils/notification/game.notification.js';

class User {
  constructor(id, socket, deviceId, playerId, latency, lastX, lastY) {
    this.id = id;
    this.socket = socket;
    this.deviceId = deviceId;
    this.playerId = playerId; // * 캐릭터 타입
    this.latency = latency;
    // * 좌표 값
    this.x = lastX;
    this.y = lastY;

    this.startTime = Date.now();
    this.lastUpdateTime = Date.now();

    // * 이전 위치, 방향 계산을 위함
    this.lastX = 0;
    this.lastY = 0;
    // * 클라이언트 코드 값 (Player.cs)
    this.speed = 3;
  }

  // * 좌표 업데이트
  updatePosition(x, y) {
    // * 이전 좌표 업데이트
    this.lastX = this.x;
    this.lastY = this.y;
    // * 신규 좌표 업데이트
    this.x = x;
    this.y = y;
    this.lastUpdateTime = Date.now();
  }

  // * 위치 계산
  calculatePosition(latency) {
    // * 위치 변화 없을 떄,
    if (this.x === this.lastX && this.y === this.lastY) {
      return {
        x: this.x,
        y: this.y,
      };
    }

    // * 시간 계산 : 초 단위
    const timeDiff = (Date.now() - this.lastUpdateTime + latency) / 1000;
    // * 예상 이동 거리
    const distance = this.speed * timeDiff; // 거속시 공식
    // * 예상 방향 계산
    const directionX = this.x !== this.lastX ? Math.sign(this.x - this.lastX) : 0;
    const directionY = this.y !== this.lastY ? Math.sign(this.y - this.lastY) : 0;

    return {
      x: this.x + directionX * distance,
      y: this.y + directionY * distance,
    };
  }

  // * 유저에게 PING
  ping() {
    const now = Date.now();

    console.log(`[ ping ] =>>> `, now);
    this.socket.write(createPingPacket(now));
  }

  // * 라운드 트립 레이턴시, 클라이언트에서 반환
  handlePong(data) {
    const now = Date.now();
    // * 왕복이니까 반으로 나눔
    this.latency = (now - data.timestamp) / 2;
    // * 확인용 로그
    console.log(
      `${data.timestamp} ::: Received pong from user ${this.id} at ${now} with latency ${this.latency}ms`,
    );
  }
}

export default User;
