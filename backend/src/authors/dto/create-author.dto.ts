import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateAuthorDto {
  @ApiProperty({
    description: 'Nombre del autor',
    example: 'Gabriel',
  })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({
    description: 'Apellido del autor',
    example: 'García Márquez',
  })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({
    description: 'Biografía del autor',
    example: 'Escritor, periodista, editor y premio Nobel de Literatura...',
    required: false,
  })
  @IsOptional()
  @IsString()
  biography?: string;

  @ApiProperty({
    description: 'Fecha de nacimiento',
    example: '1927-03-06',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  birth_date?: string;

  @ApiProperty({
    description: 'Nacionalidad del autor',
    example: 'Colombiana',
    required: false,
  })
  @IsOptional()
  @IsString()
  nationality?: string;
}
