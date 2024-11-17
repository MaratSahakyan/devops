import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TestModule } from '../src/TestModule';
import * as request from 'supertest';
import { clearDb } from './db/utils';
import { DataSource } from 'typeorm';
import { UserModule } from '../src/user/user.module';

let app: INestApplication;

describe('UserController (e2e)', () => {
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestModule, UserModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    const dataSource: DataSource = moduleFixture.get<DataSource>(DataSource);
    await clearDb(dataSource);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('POST /users', () => {
    it('should create a new user successfully', async () => {
      const mockUser = {
        userName: 'Jane Doe',
        password: 'strongPassword1!',
        age: 30,
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(mockUser)
        .expect(201);

      delete response.body.password;
      expect(response.body).toEqual({
        id: expect.any(Number),
        userName: 'Jane Doe',
        age: 30,
      });
    });

    it('should throw BadRequestException for invalid userName length', async () => {
      const createUserDto = {
        userName: 'Jo',
        password: 'password123',
        age: 25,
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(400);

      expect(response.body.message).toBe(
        'User name must have at least 5 length.',
      );
    });

    it('should throw BadRequestException for invalid password length', async () => {
      const createUserDto = {
        userName: 'Jane Doe',
        password: '123',
        age: 25,
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(400);

      expect(response.body.message).toBe(
        'Password must have at least 8 length.',
      );
    });

    it('should throw BadRequestException if age is not provided', async () => {
      const createUserDto = {
        userName: 'Jane Doe',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(400);

      expect(response.body.message).toBe('Age is required.');
    });
  });

  describe('GET /users/:id', () => {
    it('should return user data when user is found', async () => {
      await request(app.getHttpServer()).post('/users').send();

      const response = await request(app.getHttpServer())
        .get('/users/1')
        .expect(200);

      delete response.body.password;
      expect(response.body).toEqual({
        id: 1,
        userName: 'Jane Doe',
        age: 30,
      });
    });

    it('should return 404 when user is not found', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/999')
        .expect(404);

      expect(response.body.message).toBe('User not found.');
    });
  });

  describe('PUT /users/:id', () => {
    it('should update user successfully', async () => {
      const updateUserDto = {
        userName: 'Jane Updated',
        age: 26,
      };

      const response = await request(app.getHttpServer())
        .put('/users/1')
        .send(updateUserDto)
        .expect(200);

      delete response.body.password;
      expect(response.body).toEqual({
        id: 1,
        userName: 'Jane Updated',
        age: 26,
      });
    });

    it('should return 404 if user does not exist', async () => {
      const updateUserDto = {
        userName: 'Jane Updated',
        age: 26,
      };

      const response = await request(app.getHttpServer())
        .put('/users/999')
        .send(updateUserDto)
        .expect(404);

      expect(response.body.message).toBe('User not found.');
    });

    it('should return 400 for invalid userName length', async () => {
      const updateUserDto = {
        userName: 'Jo',
        age: 25,
      };

      const response = await request(app.getHttpServer())
        .put('/users/1')
        .send(updateUserDto)
        .expect(400);

      expect(response.body.message).toBe(
        'User name must have at least 5 length.',
      );
    });
  });

  describe('DELETE /users/:id', () => {
    it('should remove user successfully', async () => {
      const response = await request(app.getHttpServer())
        .delete('/users/1')
        .expect(200);

      expect(response.body).toEqual({
        message: 'User has been successfully deleted.',
      });
    });

    it('should return 404 when user is not found', async () => {
      const response = await request(app.getHttpServer())
        .delete('/users/999')
        .expect(404);

      expect(response.body.message).toBe('User not found.');
    });
  });
});
