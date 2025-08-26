import { Test } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService (unit)', () => {
  it('provides AppService without starting full AppModule', async () => {
    // crear un módulo de prueba mínimo para evitar inicializar Sequelize/Postgres
    const moduleRef = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    const svc = moduleRef.get<AppService>(AppService);
    expect(svc).toBeDefined();

    // cerrar el testing module para liberar recursos y handles abiertos
    await moduleRef.close();
  });
});
