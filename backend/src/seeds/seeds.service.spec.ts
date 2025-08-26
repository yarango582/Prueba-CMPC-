import { SeedsService } from './seeds.service';

describe('SeedsService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it('no-op when SEED_DB is not true', async () => {
    process.env.SEED_DB = 'false';

    const fakeModel = {
      build: jest.fn(),
      sequelize: { query: jest.fn() },
    } as any;
    const cloud = { uploadImage: jest.fn() } as any;

    const svc = new SeedsService(
      fakeModel,
      fakeModel,
      fakeModel,
      fakeModel,
      fakeModel,
      cloud,
    );

    // Should return without throwing or calling sequelize.query
    await expect(svc.seedIfNeeded()).resolves.toBeUndefined();
    expect(fakeModel.sequelize.query).not.toHaveBeenCalled();
  });

  it('when SEED_DB=true truncates and creates records', async () => {
    process.env.SEED_DB = 'true';

    // Helper to create a mock model where build(...).save() sets an id and returns the instance
    const makeModel = () => {
      const build = jest.fn((data: any) => {
        const instance: any = { ...data };
        instance.save = jest.fn(async function () {
          if (!instance.id)
            instance.id = Math.random().toString(36).slice(2, 10);
          return instance;
        });
        return instance;
      });
      return { build, sequelize: { query: jest.fn(async () => {}) } } as any;
    };

    const userModel = makeModel();
    const authorModel = makeModel();
    const publisherModel = makeModel();
    const genreModel = makeModel();
    const bookModel = makeModel();

    const cloud = {
      uploadImage: jest.fn(async () => 'https://example.com/img.jpg'),
    } as any;

    const svc = new SeedsService(
      userModel,
      authorModel,
      publisherModel,
      genreModel,
      bookModel,
      cloud,
    );

    // Run seeding (should not throw)
    await expect(svc.seedIfNeeded()).resolves.toBeUndefined();

    // sequelize.query should have been called on the userModel.sequelize
    expect(userModel.sequelize.query).toHaveBeenCalled();

    // Users: two builds (user + admin)
    expect(userModel.build).toHaveBeenCalledTimes(2);

    // Publishers: 3 builds
    expect(publisherModel.build).toHaveBeenCalledTimes(3);

    // Genres: 6 builds
    expect(genreModel.build).toHaveBeenCalledTimes(6);

    // Authors: 6 builds
    expect(authorModel.build).toHaveBeenCalledTimes(6);

    // Books: 15 builds
    expect(bookModel.build).toHaveBeenCalledTimes(15);
  });
});
