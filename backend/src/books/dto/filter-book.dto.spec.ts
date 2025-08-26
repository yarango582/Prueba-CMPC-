import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { FilterBookDto } from './filter-book.dto';

describe('FilterBookDto', () => {
  it('parses comma-separated genres string into array of strings (UUIDs)', async () => {
    const payload = {
      genres:
        '550e8400-e29b-41d4-a716-446655440000,550e8400-e29b-41d4-a716-446655440001',
    };

    const dto = plainToInstance(FilterBookDto, payload);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(Array.isArray(dto.genres)).toBe(true);
    expect(dto.genres).toHaveLength(2);
    expect(dto.genres![0]).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('accepts genres as array and validates UUIDs', async () => {
    const payload = {
      genres: [
        '550e8400-e29b-41d4-a716-446655440002',
        '550e8400-e29b-41d4-a716-446655440003',
      ],
    };

    const dto = plainToInstance(FilterBookDto, payload);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.genres).toEqual(payload.genres);
  });

  it('rejects invalid UUIDs in genres', async () => {
    const payload = { genres: 'not-a-uuid' };
    const dto = plainToInstance(FilterBookDto, payload);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    // find genres error
    const genresError = errors.find((e) => e.property === 'genres');
    expect(genresError).toBeDefined();
  });

  it('transforms is_available string "true" to boolean true', async () => {
    const payload = { is_available: 'true' };
    const dto = plainToInstance(FilterBookDto, payload);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.is_available).toBe(true);
  });

  it('transforms is_available string "false" to boolean false', async () => {
    const payload = { is_available: 'false' };
    const dto = plainToInstance(FilterBookDto, payload);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.is_available).toBe(false);
  });

  it('converts numeric strings to numbers for min_price/max_price and validates Min(0)', async () => {
    const payload = { min_price: '10', max_price: '20' };
    const dto = plainToInstance(FilterBookDto, payload);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(typeof dto.min_price).toBe('number');
    expect(typeof dto.max_price).toBe('number');
    expect(dto.min_price).toBe(10);
    expect(dto.max_price).toBe(20);
  });

  it('validates page and limit numeric conversion and min constraint', async () => {
    const payload = { page: '1', limit: '10' };
    const dto = plainToInstance(FilterBookDto, payload);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(10);
  });

  it('fails when page is less than 1', async () => {
    const payload = { page: '0' };
    const dto = plainToInstance(FilterBookDto, payload);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const pageError = errors.find((e) => e.property === 'page');
    expect(pageError).toBeDefined();
  });
});
