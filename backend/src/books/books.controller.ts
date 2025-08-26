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
  Req,
  Res,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
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
  create(@Body() createBookDto: CreateBookDto, @Req() req) {
    return this.booksService.create(createBookDto, req.user.sub);
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
    @Req() req,
  ) {
    return this.booksService.update(id, updateBookDto, req.user.sub);
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
  remove(@Param('id') id: string, @Req() req) {
    return this.booksService.remove(id, req.user.sub);
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
  uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // TODO: Implementar lógica de subida de archivo
    return { image_url: `/uploads/${file.filename}` };
  }
}
