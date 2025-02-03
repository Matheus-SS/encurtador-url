import { Module } from '@nestjs/common';
import { AuthService } from './application/auth.service';
import { UsersModule } from '@src/modules/users/users.module';
import { AuthController } from './presentation/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '@src/shared/config';

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
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
