import { describe, it } from 'mocha';
import { expect } from 'chai';
import { BaseRepository, MongoDB, Schema } from '@hiennc/mongoose';
import { RedisCache } from '@hiennc/cache';
import { BaseEntity, BaseService, Logger } from '../src';

import userData from './user.json';

class UserEntity extends BaseEntity {
  name!: string;
  email!: string;
}

const logger = new Logger({ service: 'Test' });

// Cache
const cache = new RedisCache({});

// MongoDB
const userSchema = new Schema({
  name: String,
  email: String
});

class UserRepository extends BaseRepository<UserEntity> {
  constructor() {
    super('user', userSchema, 'users');
  }
}

class UserService extends BaseService<UserEntity> {
  constructor() {
    const userRepo = new UserRepository();
    super(
      userRepo,
      {
        cache,
        appName: 'Example',
        uniqueKey: 'user',
        second: 60
      },
      logger
    );
  }
}

const userService = new UserService();
const user = userData[0];
let findUser: UserEntity;

before((done) => {
  const mongodb = new MongoDB({}, logger);
  mongodb
    .connect()
    .then(() => done())
    .catch((error) => done(error));
});

describe('CREATE User', () => {
  it('should be return user info', (done) => {
    userService
      .create(user)
      .then((result) => {
        expect(result).has.ownProperty('id');
        expect(result.email).to.eqls(user.email);
        expect(result.name).to.eqls(user.name);
        done();
      })
      .catch((err) => done(err));
  });
});

describe('FIND user', () => {
  it('should be found user', (done) => {
    userService
      .findOne({ email: user.email })
      .then((result) => {
        expect(result.email).to.eqls(user.email);
        findUser = result;
        done();
      })
      .catch((err) => done(err));
  });
});

describe('FIND MANY user', () => {
  it('should be found list of user', (done) => {
    userService
      .findMany({ email: user.email })
      .then((result) => {
        expect(result).to.be.a('array');
        done();
      })
      .catch((err) => done(err));
  });
});

describe('FIND ALL user', () => {
  it('should be found list or user with paging', (done) => {
    userService
      .findAll({ email: user.email }, { sort: '-id' })
      .then((result) => {
        expect(result.limit).to.be.a('number');
        expect(result.page).to.be.a('number');
        expect(result.total).to.be.a('number');
        expect(result.totalPages).to.be.a('number');
        expect(result.data).to.be.a('array');
        done();
      })
      .catch((err) => done(err));
  });
});

describe('FIND ONE AND UPDATE user', () => {
  it('should be return updated user', (done) => {
    userService
      .findOneAndUpdate({ email: user.email }, { name: 'NVT' })
      .then((result) => {
        expect(result.name).to.eqls('NVT');
        done();
      })
      .catch((err) => done(err));
  });
});

describe('UPDATE user', () => {
  it('should be found users', (done) => {
    userService
      .findMany({ email: user.email })
      .then((result) => {
        expect(result).to.be.a('array');
        done();
      })
      .catch((err) => done(err));
  });
});

describe('UPDATE user', () => {
  it('should be updated user', (done) => {
    userService
      .updateById(findUser.id, { name: 'Tuan' })
      .then((result) => {
        expect(result).to.eqls(true);
        done();
      })
      .catch((err) => done(err));
  });
});

describe('DELETE user', () => {
  it('should be deleted user', (done) => {
    userService
      .deleteById(findUser.id)
      .then((result) => {
        expect(result).to.eqls(true);
        done();
      })
      .catch((err) => done(err));
  });
});
