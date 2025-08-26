import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Res,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { FilterBookDto } from './dto/filter-book.dto';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { Book } from '../infrastructure/database/models/book.model';
import { Response } from 'express';
import { CurrentUser } from '../shared/decorators/current-user.decorator';

@ApiTags('Books')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo libro',
    description:
      'Crea un nuevo libro en el sistema con toda la información requerida',
  })
  @ApiResponse({
    status: 201,
    description: 'El libro ha sido creado exitosamente.',
    type: Book,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado.',
  })
  create(
    @Body() createBookDto: CreateBookDto,
    @CurrentUser('sub') userId: string,
  ) {
    // ValidationPipe with `transform: true` turns the body into a class instance.
    // Destructuring a class instance may not include all fields when they're non-enumerable.
    // Convert to a plain object to safely normalize aliases coming from older clients.
    const dtoPlain = JSON.parse(JSON.stringify(createBookDto || {}));

    const { summary, genre_ids, ...rest } = dtoPlain as any;
    const normalized: Partial<CreateBookDto> = {
      ...(rest as Partial<CreateBookDto>),
    };

    if (summary && !normalized.description) normalized.description = summary;
    if (!normalized.genre_id && Array.isArray(genre_ids) && genre_ids.length) {
      normalized.genre_id = genre_ids[0];
    }

    return this.booksService.create(normalized as CreateBookDto, userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener lista de libros',
    description: 'Obtiene una lista paginada de libros con filtros opcionales',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de libros obtenida exitosamente.',
    schema: {
      type: 'object',
      properties: {
        books: {
          type: 'array',
          items: { $ref: '#/components/schemas/Book' },
        },
        pagination: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            pages: { type: 'number' },
            hasNext: { type: 'boolean' },
            hasPrev: { type: 'boolean' },
          },
        },
      },
    },
  })
  findAll(@Query() filterDto: FilterBookDto) {
    return this.booksService.findAll(filterDto);
  }

  @Get('export/csv')
  @ApiOperation({
    summary: 'Exportar libros a CSV',
    description: 'Exporta la lista de libros filtrada a formato CSV',
  })
  @ApiResponse({
    status: 200,
    description: 'Archivo CSV generado exitosamente.',
    headers: {
      'Content-Type': {
        description: 'Tipo de contenido',
        schema: { type: 'string', example: 'text/csv' },
      },
      'Content-Disposition': {
        description: 'Disposición del contenido',
        schema: { type: 'string', example: 'attachment; filename="books.csv"' },
      },
    },
  })
  async exportCsv(@Query() filterDto: FilterBookDto, @Res() res: Response) {
    const csvData = await this.booksService.exportToCsv(filterDto);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="books.csv"');
    res.send(csvData);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un libro por ID',
    description: 'Obtiene la información detallada de un libro específico',
  })
  @ApiResponse({
    status: 200,
    description: 'Libro encontrado exitosamente.',
    type: Book,
  })
  @ApiResponse({
    status: 404,
    description: 'Libro no encontrado.',
  })
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar un libro',
    description: 'Actualiza la información de un libro existente',
  })
  @ApiResponse({
    status: 200,
    description: 'El libro ha sido actualizado exitosamente.',
    type: Book,
  })
  @ApiResponse({
    status: 404,
    description: 'Libro no encontrado.',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos.',
  })
  update(
    @Param('id') id: string,
    @Body() updateBookDto: UpdateBookDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.booksService.update(id, updateBookDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar un libro',
    description: 'Elimina un libro del sistema (soft delete)',
  })
  @ApiResponse({
    status: 204,
    description: 'El libro ha sido eliminado exitosamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'Libro no encontrado.',
  })
  remove(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.booksService.remove(id, userId);
  }

  @Post(':id/upload-image')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Subir imagen de libro',
    description: 'Sube una imagen para un libro específico',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Imagen subida exitosamente.',
    schema: {
      type: 'object',
      properties: {
        image_url: { type: 'string' },
      },
    },
  })
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('sub') userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('No se recibió ningún archivo');
    }

    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      throw new BadRequestException('El archivo debe ser una imagen');
    }

    if (file.size === 0) {
      throw new BadRequestException('El archivo está vacío');
    }

    try {
      return await this.booksService.uploadImage(id, file, userId);
    } catch (err: any) {
      const message =
        typeof err === 'string' ? err : err instanceof Error ? err.message : '';
      if (
        message.includes('Invalid image file') ||
        message.includes('error uploading')
      ) {
        throw new BadRequestException(
          'Archivo de imagen inválido o con formato no soportado',
        );
      }
      throw err;
    }
  }
}
