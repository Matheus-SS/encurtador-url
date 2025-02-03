import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '@src/modules/users/users.module';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '@src/shared/config';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = configService.get<AppConfig>('app') as AppConfig;
        return {
          global: true,
          secret: config.jwtSecret,
          signOptions: {
            expiresIn: config.jwtExpiresIn,
            issuer: config.jwtIssuer,
          },
        };
      },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
