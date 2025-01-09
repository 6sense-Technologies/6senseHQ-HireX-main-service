import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { pagination } from 'prisma-extension-pagination';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  public readonly prismaExtended;
  constructor() {
    super();

    // This will install the extension to all models. You can also install the extension on some models only, see: https://github.com/deptyped/prisma-extension-pagination#install-extension-on-some-models
    this.prismaExtended = this.$extends(pagination());
  }
  async onModuleInit() {
    await this.$connect();
  }
}
