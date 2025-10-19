import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// import { ProviderRegistryService } from './provider-registry.service';

@Module({
  imports: [ConfigModule],
  providers: [], // [ProviderRegistryService],
  exports: [], // [ProviderRegistryService],
})
export class ProvidersModule {}
