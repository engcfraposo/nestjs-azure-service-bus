# NestJS Azure Service Bus

[![npm version](https://img.shields.io/npm/v/nestjs-azure-service-bus.svg)](https://www.npmjs.com/package/nestjs-azure-service-bus)
[![license](https://img.shields.io/npm/l/nestjs-azure-service-bus.svg)](https://github.com/engcfraposo/nestjs-azure-service-bus/blob/08d728f7e13b1efc51bd05c34e7d550b4cef23fb/LICENSE)
[![coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen.svg)](https://github.com/engcfraposo/nestjs-azure-service-bus/blob/8e7abef3ab8c7df28c9ad9a8483ae7f52a4233fb/README.md) | 100% (39/39) | 83.33% (10/12) | 100% (15/15) |

A dynamic module for NestJS that provides integration with Azure Service Bus.

## Installation

```bash
npm install nestjs-azure-service-bus
```

## Description

The NestJS Azure Service Bus package allows you to easily integrate Azure Service Bus into your NestJS applications. It provides decorators for injecting Azure Service Bus senders and receivers, as well as a dynamic module for configuring the Azure Service Bus client.

## Usage

### Importing the module

To use the Azure Service Bus module, import it into your NestJS application's root module:

```typescript
import { Module } from '@nestjs/common';
import { AzureServiceBusModule } from 'nestjs-azure-service-bus';

@Module({
  imports: [
    AzureServiceBusModule.forRoot({
      connectionString: '<your-connection-string>',
    }),
  ],
})
export class AppModule {}
```

Replace `<your-connection-string>` with your Azure Service Bus connection string.

### Injecting Senders and Receivers

You can use the `Sender` and `Receiver` decorators provided by the module to inject Azure Service Bus senders and receivers into your classes:

```typescript
import { Injectable } from '@nestjs/common';
import { Sender, Receiver } from 'nestjs-azure-service-bus';

@Injectable()
export class MyService {
  constructor(
    @Sender('my-queue') private readonly sender: ServiceBusSender,
    @Receiver('my-queue') private readonly receiver: ServiceBusReceiver,
  ) {}
  
  // Use the sender and receiver in your methods
}
```

Replace `'my-queue'` with the name of your Azure Service Bus queue.

### Configuration Options

The `forRoot` method of the `AzureServiceBusModule` accepts a configuration object with two possible options:

- `connectionString`: The connection string for your Azure Service Bus namespace.
- `fullyQualifiedNamespace`: The fully qualified namespace of your Azure Service Bus namespace.

You can provide either the `connectionString` or the `fullyQualifiedNamespace`, but not both.

### Dynamic Module Options

The `forFeature` method of the `AzureServiceBusModule` allows you to configure senders and receivers dynamically. It accepts an options object with two properties:

- `senders`: An array of sender names.
- `receivers`: An array of receiver names.

```typescript
import { Module } from '@nestjs/common';
import { AzureServiceBusModule } from 'nestjs-azure-service-bus';

@Module({
  imports: [
    AzureServiceBusModule.forFeature({
      senders: ['queue-example'],
      receivers: ['queue-example'],
    }),
  ],
})
export class QueueModule {}
```

This will create senders and receivers for the specified queues.

```typescript
import { ServiceBusSender } from '@azure/service-bus';
import { Injectable } from '@nestjs/common';
import { Sender } from 'nestjs-azure-service-bus';

@Injectable()
export class QueueSenderService {
  constructor(
    @Sender('test-queue') private readonly sender: ServiceBusSender,
  ) {}
  async sendMessage(body: string) {
    await this.sender.sendMessages({ body });
  }
}
```

```typescript
import { ServiceBusReceiver } from '@azure/service-bus';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Receiver } from 'nestjs-azure-service-bus';

@Injectable()
export class QueueReceiverService implements OnModuleInit {
  constructor(
    @Receiver('test-queue') private readonly receiver: ServiceBusReceiver,
  ) {}
  onModuleInit() {
    this.receiver.subscribe({
      processMessage: async (message) => {
        console.log(`message.body: ${message.body}`);
      },
      processError: async (args) => {
        console.log(
          `Error occurred with ${args.entityPath} within ${args.fullyQualifiedNamespace}: `,
          args.error,
        );
      },
    });
  }
}
```

```typescript
import { Module } from '@nestjs/common';
import { QueueSenderService } from './queue-sender.service';
import { AzureServiceBusModule } from 'nestjs-azure-service-bus';
import { QueueReceiverService } from './queue-receiver.service';

@Module({
  imports: [
    AzureServiceBusModule.forFeature({
      receivers: ['test-queue'],
      senders: ['test-queue'],
    }),
  ],
  providers: [QueueSenderService, QueueReceiverService],
  exports: [QueueSenderService],
})
export class QueueModule {}

```

for another method the `ServiceBusReceiver` and `ServiceBusSender` see the [azure sdk](https://www.npmjs.com/package/@azure/service-bus)

## Support

- For issues or feature requests, please open an [issue](https://github.com/engcfraposo/nestjs-azure-service-bus/issues).
- For contributions, please refer to the [contribution guide](https://github.com/engcfraposo/nestjs-azure-service-bus/blob/main/CONTRIBUTING.md).

## License

This package is [MIT licensed](https://github.com/engcfraposo/nestjs-azure-service-bus/blob/main/LICENSE).
