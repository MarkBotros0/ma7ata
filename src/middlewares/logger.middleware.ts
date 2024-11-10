import { Injectable, NestMiddleware, Logger } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger;
  constructor() {
    this.logger = new Logger('HTTP');
  }
  use(request: any, response: any, next: () => void) {
    const { ip, method, originalUrl } = request;

    this.logger.log(`Incoming request (${ip}): ${method} ${originalUrl}`);

    response.on('finish', () => {
      const { statusCode } = response;

      this.logger.log(`${method} ${originalUrl} ${statusCode} - ${ip}`);
    });

    next();
  }
}
