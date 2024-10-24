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

  console.log('==========');
  console.log(`handlerId => ${handlerId}`);
  console.log(`deviceId => ${deviceId}`);
  console.log(`clientVersion => ${clientVersion}`);
  console.log('==========');

  console.log(`clientVersion: ${clientVersion}, ${config.client.version}`);
  console.log(`type: ${typeof clientVersion}, ${typeof config.client.version}`);

  // * 클라이언트 버전 검증
  if (clientVersion !== config.client.version) {
    throw new CustomError(
      ErrorCodes.CLIENT_VERSION_MISMATCH,
      '클라이언트 버전이 일치하지 않습니다.',
    );
  }

  // * 핸들러아이디에 맞는 프로토타입 구하기
  const protoTypeName = getProtoTypeNameByHandlerId(handlerId);
  if (!protoTypeName) {
    throw new CustomError(ErrorCodes.UNKNOWN_HANDLER_ID, `알 수 없는 핸들러 ID: ${handlerId}`);
  }

  // * 프로토타입 패키지,메시지명 분해
  const [namespace, typeName] = protoTypeName.split('.');
  // * .proto 파일 가져오기
  const PayloadType = protoMessages[namespace][typeName];
  let payload;

  try {
    // * 해당 .proto 파일로 디코딩
    payload = PayloadType.decode(packet.payload);
  } catch (e) {
    console.error(e);
    throw new CustomError(ErrorCodes.INVALID_PACKET, `패킷 구조가 일치하지 않습니다.`);
  }

  // * 어떤 필드가 원할하게 있지않다면 에러가 발생.
  // * decode에서도 진행하는 과정임
  const errorMessage = PayloadType.verify(payload);
  if (errorMessage) {
    console.error(errorMessage);
  }

  // * .proto 파일의 필드 조회
  const expectedFields = Object.keys(PayloadType.fields);
  // * 디코딩된 필드 조회
  const actualFields = Object.keys(payload);
  // * 위 2개 비교해서 다른게 있는지 확인 ( .proto 파일을 조회한게 기준 )
  const missingFields = expectedFields.filter((fields) => !actualFields.includes(fields));

  // * 필드가 비어있는 경우 = 필수 필드가 누락된 경우
  if (missingFields.length > 0) {
    throw new CustomError(
      ErrorCodes.MISSING_FIELDS,
      `필수 필드가 누락되었습니다.: ${missingFields.join(', ')}`,
    );
  }

  // * 공통 패킷에 있는 부분 중 handlerId, deviceId, payload 반환
  return { handlerId, deviceId, payload };
};
