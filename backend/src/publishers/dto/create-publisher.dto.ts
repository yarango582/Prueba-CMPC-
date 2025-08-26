import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsUrl,
} from 'class-validator';

export class CreatePublisherDto {
  @ApiProperty({
    description: 'Nombre de la editorial',
    example: 'Editorial Planeta',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Dirección de la editorial',
    example: 'Av. Diagonal 662-664, 08034 Barcelona',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'Teléfono de contacto',
    example: '+34 93 492 80 00',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Email de contacto',
    example: 'contacto@planeta.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Sitio web',
    example: 'https://www.planetadelibros.com',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  website?: string;
}
