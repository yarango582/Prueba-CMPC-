import { LoggingService } from './logging.service';

describe('LoggingService', () => {
  it('delegates to underlying winston logger methods', () => {
    const service = new LoggingService();
    const mockLogger = {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };

    // replace private logger to avoid file/console IO in tests
    (service as any).logger = mockLogger;

    service.error('e', 'trace', 'ctx');
    service.warn('w', 'ctx');
    service.info('i', 'ctx');
    service.debug('d', 'ctx');
    service.verbose('v', 'ctx');

    expect(mockLogger.error).toHaveBeenCalledWith(
      'e',
      expect.objectContaining({ trace: 'trace', context: 'ctx' }),
    );
    expect(mockLogger.warn).toHaveBeenCalledWith(
      'w',
      expect.objectContaining({ context: 'ctx' }),
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      'i',
      expect.objectContaining({ context: 'ctx' }),
    );
    expect(mockLogger.debug).toHaveBeenCalledWith(
      'd',
      expect.objectContaining({ context: 'ctx' }),
    );
    expect(mockLogger.verbose).toHaveBeenCalledWith(
      'v',
      expect.objectContaining({ context: 'ctx' }),
    );
  });
});
