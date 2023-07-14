import { Test } from '@nestjs/testing';
import {
  AzureServiceBusModule,
  AzureSBOptions,
  AzureSBSenderReceiverOptions,
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

  it('should create a ServiceBusClient with a connection string using async', async () => {
    const optionsFactory = jest.fn().mockResolvedValue({
      connectionString: 'fake-connection-string',
    });

    const moduleRef = await Test.createTestingModule({
      imports: [
        AzureServiceBusModule.forRootAsync({ useFactory: optionsFactory }),
      ],
    }).compile();

    const client = moduleRef.get<ServiceBusClient>(
      'AZURE_SERVICE_BUS_CONNECTION',
    );
    expect(client).toBeInstanceOf(ServiceBusClient);
    expect(optionsFactory).toHaveBeenCalled();
  });

  it('should register sender and receiver providers correctly', async () => {
    const optionsRoot: AzureSBOptions = {
      connectionString: 'fake-connection-string',
    };

    const options: AzureSBSenderReceiverOptions = {
      senders: ['sender1', 'sender2'],
      receivers: ['receiver1', 'receiver2'],
    };

    // After you import ServiceBusClient...
    ServiceBusClient.prototype.createSender = jest
      .fn()
      .mockImplementation((queue) => `Mock sender for ${queue}`);
    ServiceBusClient.prototype.createReceiver = jest
      .fn()
      .mockImplementation((queue) => `Mock receiver for ${queue}`);

    const moduleRef = await Test.createTestingModule({
      imports: [
        AzureServiceBusModule.forRoot(optionsRoot),
        AzureServiceBusModule.forFeature(options),
      ],
    }).compile();

    const sender1 = moduleRef.get(
      `AZURE_SB_SENDER_${options.senders[0].toUpperCase()}`,
    );
    const sender2 = moduleRef.get(
      `AZURE_SB_SENDER_${options.senders[1].toUpperCase()}`,
    );
    const receiver1 = moduleRef.get(
      `AZURE_SB_RECEIVER_${options.receivers[0].toUpperCase()}`,
    );
    const receiver2 = moduleRef.get(
      `AZURE_SB_RECEIVER_${options.receivers[1].toUpperCase()}`,
    );

    expect(sender1).toBeDefined();
    expect(sender2).toBeDefined();
    expect(receiver1).toBeDefined();
    expect(receiver2).toBeDefined();
  });

  it('should register sender and receiver providers correctly using async', async () => {
    const optionsRoot: AzureSBOptions = {
      connectionString: 'fake-connection-string',
    };

    const optionsFactory = jest.fn().mockResolvedValue({
      senders: ['sender1', 'sender2'],
      receivers: ['receiver1', 'receiver2'],
    });

    // After you import ServiceBusClient...
    ServiceBusClient.prototype.createSender = jest
      .fn()
      .mockImplementation((queue) => `Mock sender for ${queue}`);
    ServiceBusClient.prototype.createReceiver = jest
      .fn()
      .mockImplementation((queue) => `Mock receiver for ${queue}`);

    const moduleRef = await Test.createTestingModule({
      imports: [
        AzureServiceBusModule.forRoot(optionsRoot),
        AzureServiceBusModule.forFeatureAsync({ useFactory: optionsFactory }),
      ],
    }).compile();

    const sender1 = moduleRef.get('AZURE_SB_SENDERS')[0];
    const sender2 = moduleRef.get('AZURE_SB_SENDERS')[1];
    const receiver1 = moduleRef.get('AZURE_SB_RECEIVERS')[0];
    const receiver2 = moduleRef.get('AZURE_SB_RECEIVERS')[1];

    expect(sender1).toBeDefined();
    expect(sender2).toBeDefined();
    expect(receiver1).toBeDefined();
    expect(receiver2).toBeDefined();
    expect(optionsFactory).toHaveBeenCalled();
  });

  it('should create a ServiceBusClient with a fully qualified namespace using async', async () => {
    const optionsFactory = jest.fn().mockResolvedValue({
      fullyQualifiedNamespace: 'fake-namespace',
    });

    const moduleRef = await Test.createTestingModule({
      imports: [
        AzureServiceBusModule.forRootAsync({ useFactory: optionsFactory }),
      ],
    }).compile();

    const client = moduleRef.get<ServiceBusClient>(
      'AZURE_SERVICE_BUS_CONNECTION',
    );

    expect(client).toBeInstanceOf(ServiceBusClient);

    // Here, you are awaiting optionsFactory() to get the resolved value
    expect(ServiceBusClient).toHaveBeenCalledWith(
      (await optionsFactory()).fullyQualifiedNamespace,
      expect.any(DefaultAzureCredential),
    );
    expect(optionsFactory).toHaveBeenCalled();
  });
});
