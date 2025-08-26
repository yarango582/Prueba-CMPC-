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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { PaginationDto } from '../shared/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';

@ApiTags('Authors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear nuevo autor',
    description: 'Crea un nuevo autor en el sistema',
  })
  @ApiResponse({ status: 201, description: 'Autor creado exitosamente' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un autor con este nombre',
  })
  create(@Body() createAuthorDto: CreateAuthorDto) {
    return this.authorsService.create(createAuthorDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener lista de autores',
    description: 'Obtiene una lista paginada de autores con búsqueda opcional',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Término de búsqueda',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de autores obtenida exitosamente',
  })
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query('search') search?: string,
  ) {
    return this.authorsService.findAll(paginationDto, search);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener autor por ID',
    description: 'Obtiene la información detallada de un autor específico',
  })
  @ApiResponse({ status: 200, description: 'Autor encontrado exitosamente' })
  @ApiResponse({ status: 404, description: 'Autor no encontrado' })
  findOne(@Param('id') id: string) {
    return this.authorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar autor',
    description: 'Actualiza la información de un autor existente',
  })
  @ApiResponse({ status: 200, description: 'Autor actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Autor no encontrado' })
  update(@Param('id') id: string, @Body() updateAuthorDto: UpdateAuthorDto) {
    return this.authorsService.update(id, updateAuthorDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar autor',
    description: 'Elimina un autor del sistema (soft delete)',
  })
  @ApiResponse({ status: 200, description: 'Autor eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Autor no encontrado' })
  remove(@Param('id') id: string) {
    return this.authorsService.remove(id);
  }
}
