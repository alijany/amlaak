import {
  Body,
  Controller,
  INestApplication,
  Post,
  UsePipes,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Type } from 'class-transformer';
import { IsNumber, IsObject } from 'class-validator';
import request from 'supertest';
import { NormalizeNumbersPipe } from '../utils/pipe.normalizeNumbers';
import {
  createValidationPipe,
  formPipes,
  validationPipes,
} from './error.pipe.validation';

class AmountDto {
  @Type(() => Number)
  @IsNumber()
  amount: number;
}

class DocumentDto {
  @IsObject()
  document: Record<string, unknown>;
}

@Controller('probe')
class ProbeController {
  @Post('form')
  form(@Body(...formPipes) dto: AmountDto) {
    return dto;
  }

  @Post('document')
  document(@Body(...validationPipes) dto: DocumentDto) {
    return dto;
  }

  /** The shape this rule exists to rule out — kept here as the counter-example. */
  @Post('inverted')
  @UsePipes(createValidationPipe({ transform: true, whitelist: true }))
  inverted(@Body(NormalizeNumbersPipe) dto: AmountDto) {
    return dto;
  }
}

describe('pipe ordering on a request body', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ProbeController],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('accepts an amount typed in Persian digits', async () => {
    const response = await request(app.getHttpServer())
      .post('/probe/form')
      .send({ amount: '۱۸۹۸۰۰۰۰' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ amount: 18980000 });
  });

  it('leaves a document’s own literals byte-for-byte', async () => {
    const document = { rule: { regex: '(\\d+) شب', match: '۶ شب' } };

    const response = await request(app.getHttpServer())
      .post('/probe/document')
      .send({ document });

    expect(response.status).toBe(201);
    expect(response.body.document).toEqual(document);
  });

  it('refuses the same amount when validation runs first', async () => {
    const response = await request(app.getHttpServer())
      .post('/probe/inverted')
      .send({ amount: '۱۸۹۸۰۰۰۰' });

    expect(response.status).toBe(400);
    expect(response.body.issues).toEqual([
      { field: 'amount', rules: ['isNumber'] },
    ]);
  });
});
