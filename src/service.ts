/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  IBaseRepository,
  ICache,
  FindAllOption,
  FindAllResponse,
  ILogger,
  IBaseService,
  ServiceCache,
  UpdateOptions
} from './definitions';

const CACHE_REF_ID = '#refId_';

function isAllowecCache() {
  return process.env.NODE_ENV !== 'development';
}

export abstract class BaseService<T> implements IBaseService<T> {
  repo: IBaseRepository<T>;
  private cache?: ICache;
  private prefix?: string;
  private ttl?: number;
  protected logger?: ILogger;

  constructor(repo: IBaseRepository<T>, cache?: ServiceCache, logger: ILogger = console) {
    this.repo = repo;
    this.cache = isAllowecCache() ? cache?.cache : undefined;
    this.prefix = cache?.appName ? cache.appName + cache.uniqueKey : '';
    this.ttl = cache?.second;
    this.logger = logger;
  }

  async create(entity: Partial<T>): Promise<T> {
    const _entity = await this.repo.create(entity);
    return _entity;
  }

  async updateById(id: string, doc: Partial<T>): Promise<boolean> {
    const result = await this.repo.updateById(id, doc);

    this.deleteCache({ id } as unknown as Partial<T>);
    return result;
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.repo.deleteById(id);

    this.deleteCache({ id } as unknown as Partial<T>);
    return result;
  }

  async findOne(cond: Partial<T>): Promise<T> {
    const data = await this.getCache(cond);
    if (data) return data;

    const _entity = await this.repo.findOne(cond);

    if (_entity) this.setCache(cond, _entity);
    return _entity;
  }

  async findOneAndUpdate(cond: Partial<T>, doc: Partial<T>, options?: UpdateOptions): Promise<T> {
    const _entity = await this.repo.findOneAndUpdate(cond, doc, options);

    if (_entity) this.setCache(cond, _entity);
    return _entity;
  }

  async findAll(cond: Partial<T>, option?: Partial<FindAllOption>): Promise<FindAllResponse<T>> {
    const data = await this.repo.findAll(cond, option);
    return data;
  }

  async updateOne(filter: any, update?: any, options?: any, callback?: any): Promise<T> {
    const raw = await this.repo.updateOne(filter, update, options, callback);
    return raw;
  }

  async find(filter: Partial<T>, projection?: any, options?: any, callback?: any): Promise<T> {
    const raw = await this.repo.find(filter, projection, options, callback);
    return raw;
  }

  async aggregate(pipeline: Array<any>, options?: Array<any>): Promise<T> {
    const raw = await this.repo.aggregate(pipeline, options);
    return raw;
  }

  async populate(docs: Array<any> | any, options: any, callback?: any): Promise<T> {
    const raw = await this.repo.populate(docs, options, callback);
    return raw;
  }

  async findAndPopulate(filter: any, options: any, callback?: any): Promise<any> {
    const raw = await this.repo.findAndPopulate(filter, options, callback);
    return raw;
  }

  async insertMany(
    docs: Array<Partial<T>> | Partial<T>,
    options?: any,
    callback?: any
  ): Promise<T[]> {
    const raw = await this.repo.insertMany(docs, options, callback);
    return raw;
  }

  async deleteMany(filter: any, options: any, callback?: any): Promise<any> {
    const raw = await this.repo.deleteMany(filter, options, callback);
    return raw;
  }

  async updateMany(
    filter: Array<Partial<T>> | Partial<T>,
    update?: any,
    options?: any,
    callback?: any
  ): Promise<any> {
    const raw = await this.repo.updateMany(filter, update, options, callback);
    return raw;
  }

  protected async getCache(cond: Partial<T>): Promise<T | null> {
    if (!this.cache) return null;
    if (!Object.keys(cond).length) return null;

    const key = this.createCacheKey(cond);
    try {
      let result = await this.cache.getAsync(key);
      if (!result) return null;

      // Find again
      if (typeof result === 'string' && result.startsWith(CACHE_REF_ID)) {
        const id = result.split(CACHE_REF_ID)[1];

        result = await this.cache.getAsync(this.createCacheKey({ id }));
        if (result) return JSON.parse(result) as T;

        // Only set cache automatic with this case
        // Another case must call set cache manual
        const entity = await this.repo.findOne({ id } as unknown as Partial<T>);
        if (entity) {
          await this.setCache({ id } as unknown as Partial<T>, entity);
        }

        return entity;
      }

      // Exception
      return JSON.parse(result);
    } catch (error) {
      this.logger?.warn(`Get cache with key ${key} error: `, error);
      return null;
    }
  }

  protected deleteCache(cond: Partial<T>): void {
    if (!this.cache) return;
    if (!Object.keys(cond).length) return;

    const key = this.createCacheKey(cond);

    this.cache.delAsync(key).catch((error) => {
      this.logger?.warn(`Delete cache with key ${key} error: `, error);
    });
  }

  protected setCache(cond: Partial<T>, entity: T): void {
    if (!this.cache) return;
    if (!Object.keys(cond).length) return;

    const key = this.createCacheKey(cond);

    if ((cond as any).id) {
      this.cache.setAsync(key, JSON.stringify(entity), 'EX', this.ttl).catch((error) => {
        this.logger?.warn(`Set cache with key ${key} error: `, error);
      });
      return;
    }

    this.cache
      .setAsync(key, `${CACHE_REF_ID}${(entity as any).id}`, 'EX', this.ttl)
      .catch((error) => {
        this.logger?.warn(`Set cache with key ${key} error: `, error);
      });
    return;
  }

  protected createCacheKey(obj: Record<string, unknown>): string {
    let result = this.prefix || '';
    for (const key of Object.keys(obj)) {
      result += `|${key}_${obj[key]}`;
    }

    return result;
  }
}
