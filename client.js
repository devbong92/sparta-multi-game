import net from 'net';
import { getProtoMessages, loadProtos } from './src/init/loadProtos.js';
import { v4 as uuidv4 } from 'uuid';
import Long from 'long';

const HOST = '127.0.0.1';
const PORT = 5555;
const CLIENT_VERSION = '1.0.0';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// * 전체 길이
const TOTAL_LENGTH = 4;
// * 패킷 타입 길이
const PACKET_TYPE_LENGTH = 1;

const createPacket = (handlerId, userId, payload, clientVersion = '1.0.0', type, name) => {
  // console.log('[ createPacket ] type,name =>>> ', type, name);

  const protoMessages = getProtoMessages();
  const PayloadType = protoMessages[type][name];

  if (!PayloadType) {
    throw new Error('PayloadType을 찾을 수 없습니다.');
  }

  const payloadMessage = PayloadType.create(payload);
  const payloadBuffer = PayloadType.encode(payloadMessage).finish();

  // console.log('[ createPacket ] =>>>  ', handlerId, userId, clientVersion);

  return {
    handlerId,
    userId,
    version: clientVersion,
    payload: payloadBuffer,
  };
};

const sendPacket = (socket, packet) => {
  const protoMessages = getProtoMessages();
  const Packet = protoMessages.common.Packet;
  if (!Packet) {
    console.error('Packet 메시지를 찾을 수 없습니다.');
    return;
  }

  const buffer = Packet.encode(packet).finish();

  // 패킷 길이 정보를 포함한 버퍼 생성
  const packetLength = Buffer.alloc(TOTAL_LENGTH);
  packetLength.writeUInt32BE(buffer.length + TOTAL_LENGTH + PACKET_TYPE_LENGTH, 0); // 패킷 길이에 타입 바이트 포함

  // 패킷 타입 정보를 포함한 버퍼 생성
  const packetType = Buffer.alloc(PACKET_TYPE_LENGTH);
  packetType.writeUInt8(1, 0); // NORMAL TYPE

  // 길이 정보와 메시지를 함께 전송
  const packetWithLength = Buffer.concat([packetLength, packetType, buffer]);

  socket.write(packetWithLength);
};

const sendPong = (socket, timestamp) => {
  const protoMessages = getProtoMessages();
  const Ping = protoMessages.common.Ping;

  const pongMessage = Ping.create({ timestamp });
  const pongBuffer = Ping.encode(pongMessage).finish();
  // 패킷 길이 정보를 포함한 버퍼 생성
  const packetLength = Buffer.alloc(TOTAL_LENGTH);
  packetLength.writeUInt32BE(pongBuffer.length + TOTAL_LENGTH + PACKET_TYPE_LENGTH, 0);

  // 패킷 타입 정보를 포함한 버퍼 생성
  const packetType = Buffer.alloc(1);
  packetType.writeUInt8(0, 0);

  // 길이 정보와 메시지를 함께 전송
  const packetWithLength = Buffer.concat([packetLength, packetType, pongBuffer]);

  socket.write(packetWithLength);
};

const PACKET_TYPE = {
  PING: 0,
  NORMAL: 1,
  LOCATION: 3,
};

class Client {
  _protoMessages = getProtoMessages();
  _userId;
  _deviceId;
  _socket;
  _latency;
  _x;
  _y;
  _speed = 3;

  constructor(deviceId) {
    //
    this._socket = new net.Socket();
    this._deviceId = deviceId;
    this._x = 0;
    this._y = 0;
    this._latency = 30 + Math.random() * 100;
    this._framerate = this._generateInitalFramerate();
    this._direction = Math.random() * 2 * Math.PI; // 랜덤한 초기 각도
  }

  init() {
    //
    // * connect
    this._socket.connect(PORT, HOST, async () => {
      const successPacket = createPacket(
        0,
        this._deviceId,
        {
          deviceId: this._deviceId,
          playerId: Math.floor(Math.random() * 4),
          latency: this._latency,
        },
        CLIENT_VERSION,
        'initial',
        'InitialPacket',
      );
      await sendPacket(this._socket, successPacket);
      await delay(500);
    });

    // * onData
    this._socket.on('data', (data) => {
      //
      // * 1. 길이 정보 수신 (4바이트)
      const length = data.readUInt32BE(0);
      const totalHeaderLength = TOTAL_LENGTH + PACKET_TYPE_LENGTH;
      // * 2. 패킷 타입 정보 수신 (1바이트)
      const packetType = data.readUInt8(4);
      const packet = data.subarray(totalHeaderLength, totalHeaderLength + length); // 패킷 데이터
      const protoMessages = getProtoMessages();

      if (packetType === PACKET_TYPE.NORMAL) {
        const Response = protoMessages.response.Response;

        try {
          const response = Response.decode(packet);
          const responseData = JSON.parse(Buffer.from(response.data).toString());

          // console.log('[ responseData ] =>>>  ', responseData);

          if (response.handlerId === 0) {
            this._userId = responseData.userId;
          }
          // console.log('응답 데이터:', responseData);
          //   sequence = response.sequence;
        } catch (e) {
          console.error(e);
        }
      } else if (packetType === PACKET_TYPE.PING) {
        // PING
        try {
          const Ping = protoMessages.common.Ping;
          const pingMessage = Ping.decode(packet);
          const timestampLong = new Long(
            pingMessage.timestamp.low,
            pingMessage.timestamp.high,
            pingMessage.timestamp.unsigned,
          );
          // console.log('Received ping with timestamp:', timestampLong.toNumber());
          sendPong(this._socket, timestampLong.toNumber());
        } catch (pongError) {
          console.error('Ping 처리 중 오류 발생:', pongError);
        }
      } else if (packetType === 3) {
        try {
          const locationUpdate = protoMessages.gameNotification.LocationUpdate;
          // const locationUpdateMessage = locationUpdate.decode(packet);

          // console.log('응답 데이터:', locationUpdateMessage);
        } catch (error) {
          console.error(error);
        }
      }

      // * 위치 정보 전달
      this._sendLocationUpdate();
    });

    // * onClose
    this._socket.on('close', () => {
      console.log('Connection closed');
    });

    // * onError
    this._socket.on('error', (err) => {
      console.error('Client error:', err);
    });
  }

  // * 프레임레이트 설정
  _generateInitalFramerate() {
    // * 10 ~ 30fps
    return 10 + Math.random() * 20;
  }

  // * 위치정보 업데이트
  _sendLocationUpdate() {
    if (!this._userId) {
      return;
    }

    setTimeout(() => {
      //

      const deltaTime = 1 / this._framerate;

      const distance = this._speed * deltaTime;

      //
      this._x += distance * Math.cos(this._direction);
      this._y += distance * Math.sin(this._direction);

      // console.log(this._deviceId + '] Math.cos(this._direction) =>>> ', Math.cos(this._direction));
      // console.log(this._deviceId + '] distance => ', distance);
      // console.log(
      //   this._deviceId + '] [ _sendLocationUpdate ] =>> ',
      //   this._x,
      //   this._y,
      //   this._direction,
      // );

      const checkDistance = Math.sqrt((this._x - 0) ** 2 + (this._y - 0) ** 2);
      // console.log(this._deviceId + '] checkDistance => ', checkDistance);
      if (checkDistance >= 20) {
        // 각도 180도 변경
        this._direction += Math.PI;
      } else if (Math.random() < 0.05) {
        // -45도 ~ 45도 사이 랜덤 회전
        this._direction += ((Math.random() - 0.5) * Math.PI) / 4;
        // console.log(this._deviceId + '] IS RANDOM _DIRECTION =>> ', this._direction);
      }

      const packet = createPacket(
        2,
        this._deviceId,
        { x: this._x, y: this._y },
        CLIENT_VERSION,
        'game',
        'LocationUpdatePayload',
      );
      //
      sendPacket(this._socket, packet);
    }, this._latency);
  }
}

// *  --------------------------------------------------------------

(async () => {
  console.log('### [ TEST CLIENT : START :] ### ');

  await loadProtos();
  let LIMIT = 10;
  let dummies = [];

  for (let i = 0; i < LIMIT; i++) {
    const deviceId = uuidv4().slice(0, 5);
    console.log('deviceId =>> ', deviceId);
    const dummy = new Client(deviceId);
    dummies.push(dummy);
    dummy.init();
  }

  console.log(`${LIMIT}개의 클라이언트가 추가되었습니다.`);
})();
