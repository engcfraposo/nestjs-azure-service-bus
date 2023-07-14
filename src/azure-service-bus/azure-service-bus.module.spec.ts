import { Test } from '@nestjs/testing';
import {
  AzureServiceBusModule,
  AzureSBOptions,
} from './azure-service-bus.module';
import { ServiceBusClient } from '@azure/service-bus';
import { DefaultAzureCredential } from '@azure/identity';

jest.mock('@azure/service-bus');
jest.mock('@azure/identity');

describe('AzureServiceBusModule', () => {
  let module: AzureServiceBusModule;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        AzureServiceBusModule.forRoot({
          connectionString: 'fake-connection-string',
        }),
      ],
    }).compile();

    module = moduleRef.get<AzureServiceBusModule>(AzureServiceBusModule);
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should create a ServiceBusClient with a connection string', () => {
    const options: AzureSBOptions = {
      connectionString: 'fake-connection-string',
    };
    expect(ServiceBusClient).toHaveBeenCalledWith(options.connectionString);
  });

  it('should create a ServiceBusClient with a fullyQualifiedNamespace', () => {
    jest.resetAllMocks();

    const options: AzureSBOptions = {
      fullyQualifiedNamespace: 'fake-namespace',
    };
    AzureServiceBusModule.forRoot(options);

    expect(ServiceBusClient).toHaveBeenCalledWith(
      options.fullyQualifiedNamespace,
      expect.any(DefaultAzureCredential),
    );
  });
});
