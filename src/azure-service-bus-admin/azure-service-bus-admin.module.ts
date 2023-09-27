// azure-service-bus-admin.module.ts
import { DynamicModule, Module, Provider, Global } from '@nestjs/common';
import { ServiceBusAdministrationClient } from '@azure/service-bus';
import { DefaultAzureCredential } from '@azure/identity';
import { ConfigService } from '@nestjs/config';

export type AzureSBAAdminOptions =
  | { connectionString: string }
  | { fullyQualifiedNamespace: string };

@Global()
@Module({})
export class AzureServiceBusAdminModule {
  static forRoot(options: AzureSBAAdminOptions): DynamicModule {
    let adminClientProvider: Provider;

    if ('connectionString' in options) {
      adminClientProvider = {
        provide: 'AZURE_SERVICE_BUS_ADMIN_CLIENT',
        useValue: new ServiceBusAdministrationClient(options.connectionString),
      };
    } else {
      const credential = new DefaultAzureCredential();
      adminClientProvider = {
        provide: 'AZURE_SERVICE_BUS_ADMIN_CLIENT',
        useValue: new ServiceBusAdministrationClient(
          options.fullyQualifiedNamespace,
          credential,
        ),
      };
    }

    return {
      module: AzureServiceBusAdminModule,
      providers: [adminClientProvider],
      exports: [adminClientProvider],
    };
  }

  static forRootAsync(options: {
    imports?: any[];
    useFactory: (
      configService: ConfigService,
    ) => Promise<AzureSBAAdminOptions> | AzureSBAAdminOptions;
    inject?: any[];
  }): DynamicModule {
    const adminClientProvider: Provider = {
      provide: 'AZURE_SERVICE_BUS_ADMIN_CLIENT',
      useFactory: async (
        configService: ConfigService,
      ): Promise<ServiceBusAdministrationClient> => {
        const adminClientOptions = await options.useFactory(configService);

        if ('connectionString' in adminClientOptions) {
          return new ServiceBusAdministrationClient(
            adminClientOptions.connectionString,
          );
        } else {
          const credential = new DefaultAzureCredential();
          return new ServiceBusAdministrationClient(
            adminClientOptions.fullyQualifiedNamespace,
            credential,
          );
        }
      },
      inject: options.inject || [],
    };

    return {
      module: AzureServiceBusAdminModule,
      imports: options.imports || [],
      providers: [adminClientProvider],
      exports: [adminClientProvider],
    };
  }
}
