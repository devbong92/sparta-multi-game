import { config } from '../config/config.js';
import { PACKET_TYPE } from '../constants/header.js';
import { getHandlerById } from '../handlers/index.js';
import { getProtoMessages } from '../init/loadProtos.js';
import { getUserByDeviceId, getUserBySocket } from '../session/user.session.js';
import CustomError from '../utils/error/customError.js';
import { ErrorCodes } from '../utils/error/errorCodes.js';
import { handleError } from '../utils/error/errorHandler.js';
import { packetParser } from '../utils/parser/packetParser.js';

// * data
export const onData = (socket) => async (data) => {
  console.log('\n ### [ onData ] ===>>> ');

  // * 자기자신과 새로들어온 버퍼와 합침
  socket.buffer = Buffer.concat([socket.buffer, data]);

  // 4 + 1
  const totalHeaderLength = config.packet.totalLength + config.packet.typeLength;

  // * 버퍼가 정해진 헤더의길이 만큼 쌓일때 까지 기다림
  while (socket.buffer.length >= totalHeaderLength) {
    /**
     * * buf.readUInt32BE([offset])
     * * https://nodejs.org/api/buffer.html#bufreaduint32beoffset
     * * 지정된 위치(offset)에서 부호 없는 빅 엔디언 32비트 정수를 읽습니다
     */
    const length = socket.buffer.readUInt32BE(0);
    /**
     * * buf.readUInt8([offset])
     * * https://nodejs.org/api/buffer.html#bufreaduint8offset
     * * 지정된 위치에서 부호 없는 8비트 정수를 읽습니다
     *
     * * config.packet.totalLength :  4
     * * length에서 4바이트의 값을 통해 전체 버퍼 값 확인하고 남은 값으로 패킷 타입 내용 확인
     */
    const packetType = socket.buffer.readUInt8(config.packet.totalLength);

    // * 지금 버퍼에 쌓인 길이가, 해당 버퍼에서 예정한 전체 길이보다 큰지 확인
    if (socket.buffer.length >= length) {
      // * 테스트 주석 PING 제외
      if (packetType !== PACKET_TYPE.PING) {
        console.log(`### [ onData : IF ] length: ${length}, packetType: ${packetType}`);
      }

      /**
       * * buf.subarray([start[, end]])
       * * https://nodejs.org/api/buffer.html#bufsubarraystart-end
       * * 원본과 동일한 메모리를 참조하지만 시작 및 끝 인덱스로 상쇄되고 자르는 새 Buffer view를 반환합니다
       * * 반환된 버퍼는 원본 버퍼와 메모리를 공유합니다. 즉, 새로운 버퍼에서 값을 변경하면 원본 버퍼에도 영향을 미칩니다
       * * subarray 는 단순히 새로운 view 만 생성하는것이고, slice() 는 buffer 까지 복사하는 차이점이 있습니다.
       * // slice에서 subarray로 변경
       */
      const packet = socket.buffer.subarray(totalHeaderLength, length);
      socket.buffer = socket.buffer.subarray(length);

      // console.log(`### [IF] packet: ${packet} ###`);

      try {
        switch (packetType) {
          case PACKET_TYPE.PING: {
            // * const user 중복사용을 위한 scope 지정

            // * 전체 proto message 조회
            const protoMessages = getProtoMessages();
            // * Ping message
            const Ping = protoMessages.common.Ping;
            // * Ping message로 디코딩
            const pingMessage = Ping.decode(packet);
            // * 유저세션에서 소켓으로 유저조회
            const user = getUserBySocket(socket);
            if (!user) {
              throw new CustomError(ErrorCodes.USER_NOT_FOUND, '유저를 찾을 수 없습니다.');
            }
            // * Ping 패킷 받아서, 유저의 latency 처리
            user.handlePong(pingMessage);

            break;
          }
          case PACKET_TYPE.NORMAL:
            // * 패킷을 파싱함
            const { handlerId, deviceId, payload } = packetParser(packet);

            // * deviceId를 통해 유저 세션의 정보 조회
            let user = getUserByDeviceId(deviceId);
            let userId;

            if (user) {
              userId = user.id;

              console.log(
                ' [onData getUserById] ============>>> deviceId: ',
                deviceId,
                ' userId =>> ',
                userId,
              );
            }

            // * handlerId를 통해서 핸들러 정보 불러오기
            const handler = getHandlerById(handlerId);

            // * 위에서 불러온 핸들러 실행
            await handler({ socket, userId, payload });

            console.log('[ packet Parser ]S ======================= ');
            console.log(`handlerId: ${handlerId}`);
            console.log(`deviceId: ${deviceId}`);
            console.log(`payload: ${payload}`);
            console.log('[ packet Parser ]E ======================= ');

            break;
        }
      } catch (e) {
        // * 에러처리 응답
        handleError(socket, e);
      }
    } else {
      // * 아직 전체 패킷이 도착하지 않았음!
      break;
    }
  }
};
