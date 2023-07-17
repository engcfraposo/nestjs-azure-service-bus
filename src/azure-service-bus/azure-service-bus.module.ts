// azure-service-bus.module.ts
import { DynamicModule, Module, Provider, Global } from '@nestjs/common';
import { ServiceBusClient } from '@azure/service-bus';
import { DefaultAzureCredential } from '@azure/identity';
import { ConfigService } from '@nestjs/config';

export type AzureSBOptions =
  | { connectionString: string }
  | { fullyQualifiedNamespace: string };

export type AzureSBSenderReceiverOptions = {
  senders?: string[];
  receivers?: string[];
};

@Global()
@Module({})
export class AzureServiceBusModule {
  static forRoot(options: AzureSBOptions): DynamicModule {
    let clientProvider: Provider;

    if ('connectionString' in options) {
      clientProvider = {
        provide: 'AZURE_SERVICE_BUS_CONNECTION',
        useValue: new ServiceBusClient(options.connectionString),
      };
    } else {
      const credential = new DefaultAzureCredential();
      clientProvider = {
        provide: 'AZURE_SERVICE_BUS_CONNECTION',
        useValue: new ServiceBusClient(
          options.fullyQualifiedNamespace,
          credential,
        ),
      };
    }

    return {
      module: AzureServiceBusModule,
      providers: [clientProvider],
      exports: [clientProvider],
    };
  }

  static forRootAsync(options: {
    imports?: any[];
    useFactory: (
      configService: ConfigService,
    ) => Promise<AzureSBOptions> | AzureSBOptions;
    inject?: any[];
  }): DynamicModule {
    const clientProvider: Provider = {
      provide: 'AZURE_SERVICE_BUS_CONNECTION',
      useFactory: async (
        configService: ConfigService,
      ): Promise<ServiceBusClient> => {
        const clientOptions = await options.useFactory(configService);

        if ('connectionString' in clientOptions) {
          return new ServiceBusClient(clientOptions.connectionString);
        } else {
          const credential = new DefaultAzureCredential();
          return new ServiceBusClient(
            clientOptions.fullyQualifiedNamespace,
            credential,
          );
        }
      },
      inject: options.inject || [],
    };

    return {
      module: AzureServiceBusModule,
      imports: options.imports || [],
      providers: [clientProvider],
      exports: [clientProvider],
    };
  }

  static forFeature(options: AzureSBSenderReceiverOptions): DynamicModule {
    const senderProviders =
      options.senders?.map((queue) => ({
        provide: `AZURE_SB_SENDER_${queue.toUpperCase()}`,
        useFactory: (client: ServiceBusClient) => client.createSender(queue),
        inject: ['AZURE_SERVICE_BUS_CONNECTION'],
      })) || [];

    const receiverProviders =
      options.receivers?.map((queue) => ({
        provide: `AZURE_SB_RECEIVER_${queue.toUpperCase()}`,
        useFactory: (client: ServiceBusClient) => client.createReceiver(queue),
        inject: ['AZURE_SERVICE_BUS_CONNECTION'],
      })) || [];

    return {
      module: AzureServiceBusModule,
      providers: [...senderProviders, ...receiverProviders],
      exports: [...senderProviders, ...receiverProviders],
    };
  }

  static forFeatureAsync(options: {
    imports?: any[];
    useFactory: (
      configService: ConfigService,
    ) => Promise<AzureSBSenderReceiverOptions> | AzureSBSenderReceiverOptions;
    inject?: any[];
  }): DynamicModule {
    const optionsProvider: Provider = {
      provide: 'AZURE_SB_OPTIONS',
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    const senderProviders = {
      provide: 'AZURE_SB_SENDERS',
      useFactory: (
        client: ServiceBusClient,
        options: AzureSBSenderReceiverOptions,
      ) => options.senders?.map((queue) => client.createSender(queue)),
      inject: ['AZURE_SERVICE_BUS_CONNECTION', 'AZURE_SB_OPTIONS'],
    };

    const receiverProviders = {
      provide: 'AZURE_SB_RECEIVERS',
      useFactory: (
        client: ServiceBusClient,
        options: AzureSBSenderReceiverOptions,
      ) => options.receivers?.map((queue) => client.createReceiver(queue)),
      inject: ['AZURE_SERVICE_BUS_CONNECTION', 'AZURE_SB_OPTIONS'],
    };

    return {
      module: AzureServiceBusModule,
      imports: options.imports || [],
      providers: [optionsProvider, senderProviders, receiverProviders],
      exports: [senderProviders, receiverProviders],
    };
  }
}
