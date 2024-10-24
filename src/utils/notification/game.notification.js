import { config } from '../../config/config.js';
import { PACKET_TYPE } from '../../constants/header.js';
import { getProtoMessages } from '../../init/loadProtos.js';

const makeNotification = (message, type) => {
  const packetLength = Buffer.alloc(config.packet.totalLength);
  packetLength.writeUint32BE(
    message.length + config.packet.totalLength + config.packet.typeLength,
    0,
  );

  const packetType = Buffer.alloc(config.packet.typeLength);
  packetType.writeUint8(type, 0);

  return Buffer.concat([packetLength, packetType, message]);
};

export const createLocationPacket = (users) => {
  const protoMessages = getProtoMessages();
  const Location = protoMessages.gameNotification.LocationUpdate;

  const payload = { users };
  const message = Location.create(payload);
  const locationPacket = Location.encode(message).finish();
  return makeNotification(locationPacket, PACKET_TYPE.LOCATION);
};

export const gameStartNotification = (gameId, timestamp) => {
  const protoMessages = getProtoMessages();
  const Start = protoMessages.gameNotification.Start;

  const payload = { gameId, timestamp };
  const message = Start.create(payload);
  const startPacket = Start.encode(message).finish();
  return makeNotification(startPacket, PACKET_TYPE.GAME_START);
};

export const createPingPacket = (timestamp) => {
  const protoMessages = getProtoMessages();
  const ping = protoMessages.common.Ping;

  const payload = { timestamp };
  const message = ping.create(payload);
  const pingPacket = ping.encode(message).finish();

  return makeNotification(pingPacket, PACKET_TYPE.PING);
};
