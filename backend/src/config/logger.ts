import pino, { LoggerOptions } from 'pino';
import pinoHttp from 'pino-http';
import { AppEnv } from './env';

export function createLogger(env: Pick<AppEnv, 'LOG_LEVEL' | 'NODE_ENV'>) {
  const options: LoggerOptions = {
    level: env.LOG_LEVEL,
    base: undefined,
    redact: {
      paths: ['req.headers.authorization', 'res.headers.set-cookie'],
      remove: true
    }
  };

  if (env.NODE_ENV !== 'production') {
    options.transport = {
      target: 'pino-pretty',
      options: {
        colorize: true,
        singleLine: true,
        translateTime: 'HH:MM:ss.l'
      }
    } as any;
  }

  return pino(options);
}

export function createHttpLogger(env: Pick<AppEnv, 'LOG_LEVEL' | 'NODE_ENV'>) {
  return pinoHttp({
    logger: createLogger(env),
    useLevel: 'info',
    customSuccessMessage(_, res) {
      return `completed ${res.statusCode}`;
    },
    customErrorMessage(_req, _res, error) {
      return error instanceof Error ? error.message : 'request failed';
    }
  });
}
