import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateGenreDto {
  @ApiProperty({
    description: 'Nombre del género',
    example: 'Ficción',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Descripción del género',
    example:
      'Literatura narrativa que presenta hechos, personajes y lugares imaginarios',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
