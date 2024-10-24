import { config } from '../../config/config.js';
import { PACKET_TYPE } from '../../constants/header.js';
import { getProtoMessages } from '../../init/loadProtos.js';

/**
 * * 응답형태 패킷 생성
 * @param {*} handlerId
 * @param {*} responseCode
 * @param {*} data
 * @param {*} userId
 * @returns { Buffer }
 */
export const createResponse = (handlerId, responseCode, data = null, userId) => {
  // * 프로토버프 전체 조회
  const protoMessages = getProtoMessages();
  // * 응답용 프로토버프 메시지
  const Response = protoMessages.response.Response;

  // * 응답용 페이로드 생성
  const responsePayload = {
    handlerId,
    responseCode,
    timestamp: Date.now(),
    data: data ? Buffer.from(JSON.stringify(data)) : null,
  };

  /**
   * * Message.encode(message: Message|Object [, writer: Writer]): Writer
   * * > AwesomeMessage.encode(message).finish();
   * * https://www.npmjs.com/package/protobufjs#additional-documentation
   * * 메시지 인스턴스 또는 유효한 일반 JavaScript 객체를 인코딩합니다
   */
  const buffer = Response.encode(responsePayload).finish();

  /**
   * * Buffer.alloc(size[, fill[, encoding]])
   * * https://nodejs.org/api/buffer.html#static-method-bufferallocsize-fill-encoding
   * * 새 버퍼를 할당합니다
   * * fill이 정의되지 않은 경우 버퍼는 0으로 채워집니다.
   */
  const packetLength = Buffer.alloc(config.packet.totalLength);

  /**
   * * buf.writeUInt32BE(value[, offset])
   * * https://nodejs.org/api/buffer.html#bufwriteuint32bevalue-offset
   * * [ buffer.length + config.packet.totalLength + config.packet.typeLength ] 값을 가진 UInt32BE 타입으로 입력
   */
  packetLength.writeUint32BE(
    buffer.length + config.packet.totalLength + config.packet.typeLength,
    0,
  );

  // * 패킷 타입 길이의 패킷 생성
  const packetType = Buffer.alloc(config.packet.typeLength);

  /**
   * * buf.writeUInt8(value[, offset])
   * * https://nodejs.org/api/buffer.html#bufwriteuint8value-offset
   * * [ PACKET_TYPE.NORMAL ] 값을 가진 UInt8 타입으로 입력
   */
  packetType.writeUint8(PACKET_TYPE.NORMAL, 0);

  return Buffer.concat([packetLength, packetType, buffer]);
};
