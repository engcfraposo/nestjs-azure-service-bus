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

  it('should create ServiceBusClient senders and receivers with the correct queues using async', async () => {
    const optionsRoot: AzureSBOptions = {
      connectionString: 'fake-connection-string',
    };

    const senders = ['sender1', 'sender2'];
    const receivers = ['receiver1', 'receiver2'];
    const optionsFactory = jest.fn().mockResolvedValue({
      senders,
      receivers,
    });

    // Mock the ServiceBusClient's createSender and createReceiver methods
    const createSenderMock = jest.fn();
    const createReceiverMock = jest.fn();
    jest
      .spyOn(ServiceBusClient.prototype, 'createSender')
      .mockImplementation(createSenderMock);
    jest
      .spyOn(ServiceBusClient.prototype, 'createReceiver')
      .mockImplementation(createReceiverMock);

    const moduleRef = await Test.createTestingModule({
      imports: [
        AzureServiceBusModule.forRoot(optionsRoot),
        AzureServiceBusModule.forFeatureAsync({ useFactory: optionsFactory }),
      ],
    }).compile();

    const sendersProvider = moduleRef.get('AZURE_SB_SENDERS');
    const receiversProvider = moduleRef.get('AZURE_SB_RECEIVERS');

    expect(sendersProvider).toBeDefined();
    expect(receiversProvider).toBeDefined();

    expect(createSenderMock).toHaveBeenCalledTimes(senders.length);
    senders.forEach((sender) => {
      expect(createSenderMock).toHaveBeenCalledWith(sender);
    });

    expect(createReceiverMock).toHaveBeenCalledTimes(receivers.length);
    receivers.forEach((receiver) => {
      expect(createReceiverMock).toHaveBeenCalledWith(receiver);
    });

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
