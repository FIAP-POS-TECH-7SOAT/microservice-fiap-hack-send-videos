import { TokenPayload } from '@adapters/drivens/infra/auth/jwt.strategy';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

@Injectable()
export class MockJWTStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: () => 'fake-jwt-token', // Ignora o token real
      secretOrKeyProvider: async (request, rawJwtToken, done) => {
        done(null, 'fake-public-key'); // Ignora a chave pública real
      },
      algorithms: ['RS256'],
      ignoreExpiration: true, // Ignora a expiração do token
    });
  }

  // Nunca executa validação, sempre retorna o usuário mockado
  async validate(payload: TokenPayload) {
    return {
      sub: '7fe45dc4-35cd-4e9d-82f4-c60e0e669401',
      user_email: 'tsrocha901@gmail.com',
      phone: '+5511999999999',
    };
  }
}
