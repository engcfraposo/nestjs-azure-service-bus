import { Inject } from '@nestjs/common';
import { Admin } from './azure-service-bus-admin.decorators';

jest.mock('@nestjs/common');

describe('Decorators', () => {
  describe('Admin', () => {
    it('should call Inject with the right argument', () => {
      Admin();

      expect(Inject).toHaveBeenCalledWith('AZURE_SERVICE_BUS_ADMIN_CLIENT');
    });
  });
});
