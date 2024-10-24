class User {
  /**
   * 유저 생성자
   * @param {*} id 유저아이디
   * @param {*} socket 소켓
   */
  constructor(id, socket, deviceId) {
    this.id = id;
    this.socket = socket;
    // * 좌표 값
    this.x = 0;
    this.y = 0;
    //
    this.sequence = 0;
    this.lastUpdateTime = Date.now();
    this.latency = 0;
    //
    this.deviceId = '';
  }

  updatePosition(x, y) {
    this.x = x;
    this.y = y;
    this.lastUpdateTime = Date.now();
  }

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
