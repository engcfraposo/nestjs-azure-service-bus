import { Inject } from '@nestjs/common';

export const Sender = (queue: string) =>
  Inject(`AZURE_SB_SENDER_${queue.toUpperCase()}`);

export const Receiver = (queue: string) =>
  Inject(`AZURE_SB_RECEIVER_${queue.toUpperCase()}`);
