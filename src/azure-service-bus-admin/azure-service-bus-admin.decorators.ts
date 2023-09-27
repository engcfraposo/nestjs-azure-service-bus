import { Inject } from '@nestjs/common';

export const Admin = () => Inject('AZURE_SERVICE_BUS_ADMIN_CLIENT');
