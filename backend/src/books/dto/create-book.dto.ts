import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsNumber,
  Min,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsUrl,
  IsArray,
} from 'class-validator';

export class CreateBookDto {
  @ApiProperty({
    description: 'Título del libro',
    example: 'Cien años de soledad',
    maxLength: 300,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'ISBN del libro',
    example: '978-84-376-0494-7',
    required: false,
  })
  @IsOptional()
  @IsString()
  isbn?: string;

  @ApiProperty({
    description: 'Precio del libro',
    example: 25.99,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Cantidad en stock',
    example: 10,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock_quantity?: number;

  @ApiProperty({
    description: 'Fecha de publicación',
    example: '2021-01-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  publication_date?: string;

  @ApiProperty({
    description: 'Número de páginas',
    example: 350,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  pages?: number;

  @ApiProperty({
    description: 'Idioma del libro',
    example: 'Español',
    default: 'Español',
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({
    description: 'Descripción del libro',
    example: 'Una novela magistral de Gabriel García Márquez...',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'URL de la imagen del libro',
    example: 'https://example.com/book-cover.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  image_url?: string;

  @ApiProperty({
    description: 'ID del autor',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  author_id: string;

  @ApiProperty({
    description: 'ID de la editorial',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  @IsNotEmpty()
  publisher_id: string;

  @ApiProperty({
    description: 'ID del género',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsOptional()
  @IsUUID()
  genre_id?: string; // Clarified genre_id

  @ApiProperty({
    description:
      'IDs de géneros (alternativa a genre_id). Se acepta para compatibilidad con clientes antiguos; el servidor usará el primer ID si se envía un array.',
    example: ['550e8400-e29b-41d4-a716-446655440002'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  genre_ids?: string[];

  @ApiProperty({
    description: 'Resumen corto del libro (alias summary)',
    example: 'Resumen breve...',
    required: false,
  })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiProperty({
    description: 'Disponibilidad del libro',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_available?: boolean;
}
