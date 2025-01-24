import { Injectable } from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';
import axios from 'axios';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { z } from 'zod';

const tokenPayloadSchema = z.object({
  sub: z.string().uuid(),
  user_email: z.string(),
  phone: z.string(),
});

export type TokenPayload = z.infer<typeof tokenPayloadSchema>;

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
  constructor() {
    // const jwt_public_key = env.get('JWT_PUBLIC_KEY');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      //   ignoreExpiration: true,
      secretOrKeyProvider: async (request, rawJwtToken, done) => {
        try {
          // Buscando a chave pública do endpoint estático
          const response = await axios.get(
            'https://teste-hak-fiap.s3.us-east-1.amazonaws.com/public_key.pem',
          );
          const publicKey = response.data; // A chave pública vem como texto
          done(null, publicKey);
        } catch (error) {
          done(error, '');
        }
      },
      algorithms: ['RS256'],
    });
  }
  async validate(payload: TokenPayload) {
    return tokenPayloadSchema.parse(payload);
  }
}
