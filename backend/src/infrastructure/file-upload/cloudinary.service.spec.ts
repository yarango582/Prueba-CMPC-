import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryService } from './cloudinary.service';
import { Readable, PassThrough } from 'stream';

jest.mock('cloudinary', () => ({
  v2: {
    uploader: {
      upload_stream: jest.fn(),
      destroy: jest.fn(),
    },
  },
}));

describe('CloudinaryService', () => {
  let service: CloudinaryService;

  beforeEach(() => {
    service = new CloudinaryService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('uploadImage resolves with secure_url when upload_stream returns result', async () => {
    const fakeResult = { secure_url: 'https://cloud/new.jpg' } as any;

    // Mock upload_stream to invoke callback with (null, result)
    (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
      (opts, cb) => {
        const passthrough = new PassThrough();

        // simulate callback asynchronously
        process.nextTick(() => cb(null, fakeResult));
        return passthrough as unknown as NodeJS.WritableStream;
      },
    );

    const file = { buffer: Buffer.from('abc') } as Express.Multer.File;
    const url = await service.uploadImage(file, 'test-folder');
    expect(url).toBe('https://cloud/new.jpg');
    expect(cloudinary.uploader.upload_stream).toHaveBeenCalled();
  });

  it('uploadImage rejects when upload_stream errors', async () => {
    (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
      (opts, cb) => {
        const passthrough = new PassThrough();
        process.nextTick(() => cb(new Error('upload failed'), null));
        return passthrough as unknown as NodeJS.WritableStream;
      },
    );

    const file = { buffer: Buffer.from('abc') } as Express.Multer.File;
    await expect(service.uploadImage(file, 'test')).rejects.toThrow(
      'upload failed',
    );
  });

  it('deleteImage calls cloudinary.uploader.destroy with public id', async () => {
    (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({
      result: 'ok',
    });
    const url =
      'https://res.cloudinary.com/demo/image/upload/test-folder/abc123.jpg';
    await service.deleteImage(url);
    expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
      'test-folder/abc123',
    );
  });
});
