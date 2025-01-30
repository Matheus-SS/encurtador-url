import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  private log = new Logger(OptionalJwtAuthGuard.name);
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(
      request.headers.authorization as string,
    );

    if (!token) {
      request['user'] = { user_id: null };
      return true;
    }

    try {
      const payload = new JwtService().verify(token, {
        secret: this.configService.get('app.jwtSecret'),
      });
      // esta nesse formato para ser o mesmo formato de quando volta
      // usando o JwtAuthGuard junto com o decorator de pegar user id
      request['user'] = { user_id: payload.sub };
    } catch (error) {
      this.log.error(error.message);
      throw new UnauthorizedException(error.message);
    }

    return true;
  }

  private extractTokenFromHeader(authorizationHeader: string): string | null {
    if (!authorizationHeader) {
      return null;
    }
    const [bearer, token] = authorizationHeader.split(' ');

    return bearer === 'Bearer' && token ? token : null;
  }
}
