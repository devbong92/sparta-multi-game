import { config } from '../../config/config.js';
import { PACKET_TYPE } from '../../constants/header.js';
import { getProtoMessages } from '../../init/loadProtos.js';

// * 알림용 패킷 생성 [ 헤더 + 알림용 패킷 ]
// * [ 일일퀘스트 5 ] serializer라는 메소드명이 더 자연스러울 수 있음
const makeNotification = (message, type) => {
  // * 총 길이를 담은 패킷 생성
  const packetLength = Buffer.alloc(config.packet.totalLength);
  // * 위에서 만든 패킷에 부호 없는 빅 엔디언 32비트 정수로 길이 데이터 쓰기.
  packetLength.writeUint32BE(
    message.length + config.packet.totalLength + config.packet.typeLength,
    0,
  );

  // * 패킷타입을 담은 패킷 생성
  const packetType = Buffer.alloc(config.packet.typeLength);
  // * 위에서 만든 패킷에 type값 넣기
  packetType.writeUint8(type, 0);

  // * 전체길이 패킷 + 패킷타입 패킷 + 메시지 패킷 합쳐서 반환
  return Buffer.concat([packetLength, packetType, message]);
};

// * 세션 내 유저 좌표 패킷
export const createLocationPacket = (users) => {
  // * 프로토 메시지 조회
  const protoMessages = getProtoMessages();
  // * 전체 좌표 프로토파일
  const Location = protoMessages.gameNotification.LocationUpdate;

  // * 전체 유저 좌표 payload에 담기
  const payload = { users };
  // * 메시지 생성
  const message = Location.create(payload);
  // * protobuf로 인코딩
  const locationPacket = Location.encode(message).finish();

  // * 위치 패킷 담아서, 알림 패킷 생성
  return makeNotification(locationPacket, PACKET_TYPE.LOCATION);
};

// * PING용 패킷 생성
export const createPingPacket = (timestamp) => {
  // * 전체 프로토 메시지 조회
  const protoMessages = getProtoMessages();
  // * 핑용 프로토파일
  const ping = protoMessages.common.Ping;
  // * timestamp 필드 payload에 담기
  const payload = { timestamp };
  // * 메시지 생성
  const message = ping.create(payload);
  // * 인코딩
  const pingPacket = ping.encode(message).finish();

  // * 핑 패킷 담아서, 알림 패킷 생성
  return makeNotification(pingPacket, PACKET_TYPE.PING);
};
