// Single coherent mocks for NestFactory and Swagger (including PartialType)
jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(() => ({
      setGlobalPrefix: jest.fn(),
      useGlobalPipes: jest.fn(),
      useGlobalInterceptors: jest.fn(),
      useGlobalFilters: jest.fn(),
      enableCors: jest.fn(),
      use: jest.fn(),
      listen: jest.fn(() => Promise.resolve(3000)),
      get: jest.fn(() => ({ seedIfNeeded: jest.fn(() => Promise.resolve()) })),
    })),
  },
}));

jest.mock('@nestjs/swagger', () => ({
  SwaggerModule: {
    createDocument: jest.fn(() => ({})),
    setup: jest.fn(),
  },
  DocumentBuilder: function () {
    // explicit typed builder to satisfy TS/linter
    const builder: {
      setTitle: (s?: string) => any;
      setDescription: (s?: string) => any;
      setVersion: (v?: string) => any;
      addBearerAuth: () => any;
      addTag: (tag?: string, desc?: string) => any;
      build: () => any;
    } = {
      setTitle: () => builder,
      setDescription: () => builder,
      setVersion: () => builder,
      addBearerAuth: () => builder,
      addTag: () => builder,
      build: () => ({}),
    };
    return builder;
  },
  PartialType: (classRef: any) => {
    return class extends classRef {};
  },
  // decorator no-ops used across controllers and DTOs
  ApiOperation: () => () => undefined,
  ApiResponse: () => () => undefined,
  ApiOkResponse: () => () => undefined,
  ApiCreatedResponse: () => () => undefined,
  ApiTags: () => () => undefined,
  ApiBearerAuth: () => () => undefined,
  ApiProperty: () => () => undefined,
  ApiPropertyOptional: () => () => undefined,
  ApiBody: () => () => undefined,
  ApiQuery: () => () => undefined,
  ApiParam: () => () => undefined,
  ApiConsumes: () => () => undefined,
  ApiProduces: () => () => undefined,
}));

describe('main bootstrap', () => {
  it('calls bootstrap without starting real server', async () => {
    const mainModule = (await import('./main')) as {
      bootstrap: () => Promise<void>;
    };
    await expect(mainModule.bootstrap()).resolves.not.toThrow();
  });
});

import * as fs from 'fs';
import * as path from 'path';

describe('main.ts static checks', () => {
  const mainPath = path.resolve(__dirname, './main.ts');
  let source = '';

  beforeAll(() => {
    source = fs.readFileSync(mainPath, 'utf8');
  });

  it('contains bootstrap function', () => {
    expect(source).toMatch(/async function bootstrap\(/);
  });

  it('uses NestFactory.create', () => {
    expect(source).toMatch(/NestFactory.create\(/);
  });

  it('sets global prefix to api', () => {
    expect(source).toMatch(/setGlobalPrefix\('api'\)/);
  });

  it('configures SwaggerModule.setup', () => {
    expect(source).toMatch(/SwaggerModule.setup\('api\/docs',/);
  });

  it('registers health check route', () => {
    expect(source).toMatch(
      /app.use\('\/health', \(req: Request, res: Response\)/,
    );
  });
});
