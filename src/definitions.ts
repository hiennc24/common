export type UpdateOptions = {
  new?: boolean;
  upsert?: boolean;
};

export interface IBaseService<T> {
  create(entity: Partial<T>, session?: any): Promise<T>;
  updateById(id: string, doc: Partial<T>): Promise<boolean>;
  deleteById(id: string): Promise<boolean>;
  find(filter?: Partial<T>, projection?: any, options?: any | null, callback?: any): Promise<T>;
  findOne(cond: Partial<T>): Promise<T>;
  findOneAndUpdate(cond: Partial<T>, doc: Partial<T>, options?: UpdateOptions): Promise<T>;
  findAll(cond: Partial<T>, option?: Partial<FindAllOption>): Promise<FindAllResponse<T>>;
  updateOne(filter?: any, update?: any, options?: any | null, callback?: any): Promise<T>;
  aggregate(pipeline: Array<any>, options?: any | null): Promise<T>;
  populate(docs: Array<any> | any, options: any, callback?: any): Promise<T>;
  findAndPopulate(filter: any, options: any, projection?: any, callback?: any): Promise<any>;
  insertMany(docs: Array<Partial<T>> | Partial<T>, options?: any, callback?: any): Promise<T[]>;
  deleteMany(filter?: any, options?: any, callback?: any): Promise<any>;
  updateMany(filter: any, update?: any, options?: any, callback?: any): Promise<T>;
}

export interface IBaseRepository<T> {
  create(entity: Partial<T>, session?: any): Promise<T>;
  updateById(id: string, doc: Partial<T>): Promise<boolean>;
  deleteById(id: string): Promise<boolean>;
  find(filter?: Partial<T>, projection?: any, options?: any | null, callback?: any): Promise<T>;
  findOne(cond: Partial<T>): Promise<T>;
  findOneAndUpdate(cond: Partial<T>, doc: Partial<T>, options?: UpdateOptions): Promise<T>;
  findAll(cond: Partial<T>, option?: Partial<FindAllOption>): Promise<FindAllResponse<T>>;
  updateOne(filter?: any, update?: any, options?: any | null, callback?: any): Promise<T>;
  aggregate(pipeline: Array<any>, options?: any | null): Promise<T>;
  populate(docs: Array<any> | any, options: any, callback?: any): Promise<T>;
  findAndPopulate(filter: any, options: any, projection?: any, callback?: any): Promise<any>;
  insertMany(docs: Array<Partial<T>> | Partial<T>, options?: any, callback?: any): Promise<T[]>;
  deleteMany(filter?: any, options?: any, callback?: any): Promise<any>;
  updateMany(filter: any, update?: any, options?: any, callback?: any): Promise<T>;
}

export interface ILogger {
  info(message?: string, details?: any): void;
  error(message?: string, details?: any): void;
  warn(message?: string, details?: any): void;
  debug(message?: string, details?: any): void;
}

export interface ILoggerConfig {
  service?: string;
  level?: string;
  transportsToConsole?: boolean;
  transportsToFile?: boolean;
}

export interface ITelegramConfig {
  chanelId: string;
  botToken: string;
  isAllowSendMessage: string;
  prefix: string;
}

export type PartialDeep<T> = { [P in keyof T]?: PartialDeep<T[P]> };

export type FindAllOption = {
  fields: string;
  limit: number;
  page: number;
  sort: any;
};

export type FindAllResponse<T> = {
  total: number;
  limit: number;
  page: number;
  totalPages: number;
  data: T[];
};

export interface ErrorDetails {
  platform?: string;
  code?: number;
  message?: string;
  fields?: string[];
}

export type ServiceCache = {
  appName: string;
  uniqueKey: string;
  cache: ICache;
  second: number;
};

export interface ICache {
  getAsync: (key: string) => Promise<string | null>;
  setAsync: (
    key: string,
    value: string,
    mode?: SetAsyncMode,
    duration?: number
  ) => Promise<unknown>;
  delAsync: (key: string) => Promise<number>;
  expireAsync: (key: string, second: number) => Promise<number>;
  incrByAsync: (key: string, increment: number) => Promise<number>;
  decrByAsync: (key: string, decrement: number) => Promise<number>;
}

export type SetAsyncMode = 'EX' | 'PX' | 'KEEPTTL';

export interface ISystemNotify {
  sendErrorToTelegram(title: string, error?: any): Promise<void>;
  sendSuccessMessageToTelegram(title: string): Promise<void>;
}
