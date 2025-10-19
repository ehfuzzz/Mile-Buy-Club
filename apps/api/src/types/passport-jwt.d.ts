declare module 'passport-jwt' {
  export interface StrategyOptions {
    jwtFromRequest: (...args: unknown[]) => string | null;
    secretOrKey?: string | Buffer;
    secretOrKeyProvider?: (...args: unknown[]) => string | Buffer;
    issuer?: string;
    audience?: string;
    algorithms?: string[];
    ignoreExpiration?: boolean;
    passReqToCallback?: boolean;
  }

  export interface StrategyOptionsWithRequest extends StrategyOptions {
    passReqToCallback: true;
  }

  export type VerifyCallback = (
    payload: unknown,
    done: (error: unknown, user?: unknown, info?: unknown) => void
  ) => void;

  export class Strategy {
    constructor(
      options: StrategyOptions | StrategyOptionsWithRequest,
      verify: VerifyCallback
    );
  }

  export const ExtractJwt: {
    fromAuthHeaderAsBearerToken(): () => string | null;
    fromBodyField(field: string): () => string | null;
    fromHeader(headerName: string): () => string | null;
    fromUrlQueryParameter(paramName: string): () => string | null;
  };
}
