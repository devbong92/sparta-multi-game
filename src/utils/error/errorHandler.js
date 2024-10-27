import { createResponse } from '../response/createResponse.js';
import { ErrorCodes } from './errorCodes.js';

// * 에러처리
export const handleError = (socket, error) => {
  console.error('[ handlerError ] ==>> ', error);

  let responseCode;
  let message;

  if (error.code) {
    responseCode = error.code;
    message = error.message;
    console.error(`에러 코드: ${error.code}, 메시지: ${error.message}`);
  } else {
    responseCode = ErrorCodes.SOCKET_ERROR;
    message = error.message;
    console.error(`일반 에러: ${error.message}`);
  }

  // * 응답용 패킷 생성, handlerId: -1
  const errorResponse = createResponse(-1, responseCode, { message }, null);

  // * 연결되어있는 소켓에 전달
  socket.write(errorResponse);
};
