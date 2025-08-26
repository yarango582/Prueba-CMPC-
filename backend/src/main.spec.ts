// Mock NestFactory and SwaggerModule before importing main so bootstrap won't start a real server
jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn().mockResolvedValue({
      setGlobalPrefix: jest.fn(),
      useGlobalPipes: jest.fn(),
      useGlobalInterceptors: jest.fn(),
      useGlobalFilters: jest.fn(),
      enableCors: jest.fn(),
      use: jest.fn(),
      listen: jest.fn().mockResolvedValue(undefined),
    }),
  },
}));

jest.mock('@nestjs/swagger', () => {
  const noopDecorator = () => () => undefined;
  return {
    SwaggerModule: {
      createDocument: jest.fn().mockReturnValue({}),
      setup: jest.fn(),
    },
    ApiOperation: noopDecorator,
    ApiTags: noopDecorator,
    ApiBearerAuth: noopDecorator,
    ApiProperty: noopDecorator,
    ApiResponse: noopDecorator,
  };
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
