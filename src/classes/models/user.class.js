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
}

export default User;
