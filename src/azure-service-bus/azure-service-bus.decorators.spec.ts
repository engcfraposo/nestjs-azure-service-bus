import { Inject } from '@nestjs/common';
import { Sender, Receiver } from './azure-service-bus.decorators';

jest.mock('@nestjs/common');

describe('Decorators', () => {
  describe('Sender', () => {
    it('should call Inject with the right argument', () => {
      Sender('queue');

      expect(Inject).toHaveBeenCalledWith('AZURE_SB_SENDER_QUEUE');
    });
  });

  describe('Receiver', () => {
    it('should call Inject with the right argument', () => {
      Receiver('queue');

      expect(Inject).toHaveBeenCalledWith('AZURE_SB_RECEIVER_QUEUE');
    });
  });
});
