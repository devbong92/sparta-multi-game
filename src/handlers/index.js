import { HANDLER_IDS } from '../constants/handlerIds.js';
import CustomError from '../utils/error/customError.js';
import { ErrorCodes } from '../utils/error/errorCodes.js';
import locationUpdateHandler from './game/locationUpdate.handler.js';
import initialHandler from './user/initial.handler.js';

const handlers = {
  [HANDLER_IDS.INITIAL]: {
    handler: initialHandler, // 핸들러에 대한 함수
    protoType: 'initial.InitialPacket', // 페이로드에 구성되어있는 프로토버프 구조체의 이름
  },
  [HANDLER_IDS.LOCATION_UPDATE]: {
    handler: locationUpdateHandler, // 핸들러에 대한 함수
    protoType: 'game.LocationUpdatePayload', // 페이로드에 구성되어있는 프로토버프 구조체의 이름
  },
};

export const getHandlerById = (handlerId) => {
  if (!handlers[handlerId]) {
    console.error(`핸들러를 찾을 수 없습니다 : handlerId : ${handlerId}`);
    throw new CustomError(
      ErrorCodes.UNKNOWN_HANDLER_ID,
      `핸들러를 찾을 수 없습니다 : handlerId : ${handlerId}`,
    );
  }
  return handlers[handlerId].handler;
};

export const getProtoTypeNameByHandlerId = (handlerId) => {
  if (!handlers[handlerId]) {
    console.error(`프로토타입을 찾을 수 없습니다 : handlerId: ${handlerId}`);
    throw new CustomError(
      ErrorCodes.UNKNOWN_HANDLER_ID,
      `프로토타입을 찾을 수 없습니다 : handlerId : ${handlerId}`,
    );
  }
  console.log('eee =>> ', handlers[handlerId], handlerId);
  return handlers[handlerId].protoType;
};
