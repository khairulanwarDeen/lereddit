import { EntityManager, IDatabaseDriver, Connection } from '@mikro-orm/core'
import { Request, Response } from 'express';
import { Session, SessionData } from 'express-session'
import { Redis } from 'ioredis';
import { createUserLoader } from './utils/createUserLoader';

export type MyContext = {
  em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>
  req: Request & {
    session: Session & Partial<SessionData> & { userId?: number };
  };
  res: Response;
  redis: Redis
  userLoader: ReturnType<typeof createUserLoader>;
};

//ReturnType will give us the return value of a function
//  that way we dont need to type the whole return type manually