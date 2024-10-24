import { config } from '../../config/config.js';
import { getProtoTypeNameByHandlerId } from '../../handlers/index.js';
import { getProtoMessages } from '../../init/loadProtos.js';
import CustomError from '../error/customError.js';
import { ErrorCodes } from '../error/errorCodes.js';

/**
 * * 패킷 파싱
 * @param {*} data
 */
export const packetParser = (data) => {
  // * 패킷타입 전체 조회
  const protoMessages = getProtoMessages();

  // * 공통 패킷 구조를 디코딩
  const Packet = protoMessages.common.Packet;
  let packet;
  try {
    // * 패킷 디코딩
    packet = Packet.decode(data);
  } catch (e) {
    console.error(e);
    throw new CustomError(ErrorCodes.PACKET_DECODE_ERROR, '패킷 디코딩 중 오류가 발생했습니다.');
  }

  const handlerId = packet.handlerId;
  const deviceId = packet.userId; // * deviceId
  const clientVersion = packet.version;
  const sequence = packet.sequence;

  console.log('==========');
  console.log(`handlerId => ${handlerId}`);
  console.log(`deviceId => ${deviceId}`);
  console.log(`clientVersion => ${clientVersion}`);
  console.log(`sequence => ${sequence}`);
  console.log('==========');

  console.log(`clientVersion: ${clientVersion}, ${config.client.version}`);
  console.log(`type: ${typeof clientVersion}, ${typeof config.client.version}`);
  // 여기서 클라이언트버전을 이용해서 검증을 진행
  if (clientVersion !== config.client.version) {
    console.error(`클라이언트 버전이 일치하지 않습니다 clientVersion: ${clientVersion}`);
    throw new CustomError(
      ErrorCodes.CLIENT_VERSION_MISMATCH,
      '클라이언트 버전이 일치하지 않습니다.',
    );
  }

  const protoTypeName = getProtoTypeNameByHandlerId(handlerId);
  if (!protoTypeName) {
    console.error(`알 수 없는 핸들러 ID: ${handlerId}`);
    throw new CustomError(ErrorCodes.UNKNOWN_HANDLER_ID, `알 수 없는 핸들러 ID: ${handlerId}`);
  }

  const [namespace, typeName] = protoTypeName.split('.');
  const PayloadType = protoMessages[namespace][typeName];
  let payload;

  try {
    payload = PayloadType.decode(packet.payload);
  } catch (e) {
    console.error(e);
    throw new CustomError(ErrorCodes.INVALID_PACKET, `패킷 구조가 일치하지 않습니다.`);
  }

  // 어떤 필드가 원할하게 있지않다면 에러가 발생.
  // decode에서도 진행하는 과정임
  const errorMessage = PayloadType.verify(payload);
  if (errorMessage) {
    console.error(errorMessage);
  }

  // 필드가 비어있는 경우 = 필수 필드가 누락된 경우
  const expectedFields = Object.keys(PayloadType.fields);
  const actualFields = Object.keys(payload);
  const missingFields = expectedFields.filter((fields) => !actualFields.includes(fields));

  if (missingFields.length > 0) {
    console.error(`필수 필드가 누락되었습니다.: ${missingFields.join(', ')}`);
    throw new CustomError(
      ErrorCodes.MISSING_FIELDS,
      `필수 필드가 누락되었습니다.: ${missingFields.join(', ')}`,
    );
  }

  return { handlerId, deviceId, payload, sequence };
};
