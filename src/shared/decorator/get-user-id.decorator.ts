import { UnauthorizedException, createParamDecorator } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { JwtService } from '@nestjs/jwt';
import { configuration } from '@src/shared/config';

export const GetUserId = createParamDecorator(
  (data: { allowNull?: boolean } = {}, context: ExecutionContextHost) => {
    const request = context.switchToHttp().getRequest();
    const { allowNull } = data;
    const token = extractTokenFromHeader(
      request.headers.authorization as string,
    );

    if (!token) {
      if (allowNull) {
        return null;
      } else {
        throw new UnauthorizedException('Token not provided');
      }
    }

    try {
      const payload = new JwtService().verify(token, {
        secret: configuration().app.jwtSecret,
      });
      // esta nesse formato para ser o mesmo formato de quando volta
      // usando o JwtAuthGuard junto com o decorator de pegar user id
      return payload.sub;
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  },
);

function extractTokenFromHeader(authorizationHeader: string): string | null {
  if (!authorizationHeader) {
    return null;
  }
  const [bearer, token] = authorizationHeader.split(' ');

  return bearer === 'Bearer' && token ? token : null;
}
