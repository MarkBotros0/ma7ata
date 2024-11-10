import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ApiKeyMiddleware } from "./auth/middlewares/apikey.middleware";
import { LoggerMiddleware } from "./middlewares/logger.middleware";

@Module({
  imports: [AuthModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');

    consumer.apply(ApiKeyMiddleware).forRoutes('*');
  }
}
