import { Test } from '@nestjs/testing';
import {
  AzureServiceBusAdminModule,
  AzureSBAAdminOptions,
} from './azure-service-bus-admin.module';
import { ServiceBusAdministrationClient } from '@azure/service-bus';
import { DefaultAzureCredential } from '@azure/identity';

jest.mock('@azure/service-bus');
jest.mock('@azure/identity');

describe('AzureServiceBusAdminModule', () => {
  let module: AzureServiceBusAdminModule;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        AzureServiceBusAdminModule.forRoot({
          connectionString: 'fake-connection-string',
        }),
      ],
    }).compile();

    module = moduleRef.get<AzureServiceBusAdminModule>(
      AzureServiceBusAdminModule,
    );
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should create a ServiceBusClient with a connection string', () => {
    const options: AzureSBAAdminOptions = {
      connectionString: 'fake-connection-string',
    };
    expect(ServiceBusAdministrationClient).toHaveBeenCalledWith(
      options.connectionString,
    );
  });

  it('should create a ServiceBusClient with a fullyQualifiedNamespace', () => {
    jest.resetAllMocks();

    const options: AzureSBAAdminOptions = {
      fullyQualifiedNamespace: 'fake-namespace',
    };
    AzureServiceBusAdminModule.forRoot(options);

    expect(ServiceBusAdministrationClient).toHaveBeenCalledWith(
      options.fullyQualifiedNamespace,
      expect.any(DefaultAzureCredential),
    );
  });

  it('should create a ServiceBusClient with a connection string using async', async () => {
    const optionsFactory = jest.fn().mockResolvedValue({
      connectionString: 'fake-connection-string',
    });

    const moduleRef = await Test.createTestingModule({
      imports: [
        AzureServiceBusAdminModule.forRootAsync({ useFactory: optionsFactory }),
      ],
    }).compile();

    const client = moduleRef.get<ServiceBusAdministrationClient>(
      'AZURE_SERVICE_BUS_ADMIN_CLIENT',
    );
    expect(client).toBeInstanceOf(ServiceBusAdministrationClient);
    expect(optionsFactory).toHaveBeenCalled();
  });

  it('should create a ServiceBusClient with a fully qualified namespace using async', async () => {
    const optionsFactory = jest.fn().mockResolvedValue({
      fullyQualifiedNamespace: 'fake-namespace',
    });

    const moduleRef = await Test.createTestingModule({
      imports: [
        AzureServiceBusAdminModule.forRootAsync({ useFactory: optionsFactory }),
      ],
    }).compile();

    const client = moduleRef.get<ServiceBusAdministrationClient>(
      'AZURE_SERVICE_BUS_ADMIN_CLIENT',
    );

    expect(client).toBeInstanceOf(ServiceBusAdministrationClient);

    // Here, you are awaiting optionsFactory() to get the resolved value
    expect(ServiceBusAdministrationClient).toHaveBeenCalledWith(
      (await optionsFactory()).fullyQualifiedNamespace,
      expect.any(DefaultAzureCredential),
    );
    expect(optionsFactory).toHaveBeenCalled();
  });
});
