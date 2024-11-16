import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserController } from "../src/user/user.controller";
import { UserService } from "../src/user/user.service";
import {IUser} from "../src/user/types";

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserById', () => {
    it('should return user data when user is found', async () => {
      const mockUser = {
        id: '1',
        userName: 'John Smith',
        password: 'strongPassword1!',
        age: 25,
      };
      jest.spyOn(service, 'getUserById').mockResolvedValue(mockUser);

      const result = await controller.getUserById('1');
      delete result.password
      expect(result).toEqual({
        id: '1',
        userName: 'John Smith',
        age: 25,
      });
    });

    it('should throw NotFoundException when user is not found', async () => {
      jest.spyOn(service, 'getUserById').mockRejectedValue(new NotFoundException('User not found.'));

      try {
        await controller.getUserById('999');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('User not found.');
      }
    });
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const createUserDto = {
        userName: 'Jane Doe',
        password: 'password123',
        age: 30,
      };
      const mockUser = {
        id: crypto.randomUUID(),
        userName: 'Jane Doe',
        password: 'password123',
        age: 30,
      };
      jest.spyOn(service, 'createUser').mockResolvedValue(mockUser);

      const result = await controller.createUser(createUserDto);
      delete result.password;
      expect(result).toEqual({
        id: expect.any(String),
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

      try {
        await controller.createUser(createUserDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('User name must have at least 5 length.');
      }
    });

    it('should throw BadRequestException for invalid password length', async () => {
      const createUserDto = {
        userName: 'Jane Doe',
        password: '123',
        age: 25,
      };

      try {
        await controller.createUser(createUserDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Password must have at least 8 length.');
      }
    });

    it('should throw BadRequestException if age is not provided', async () => {
      const createUserDto = {
        userName: 'Jane Doe',
        password: 'password123',
      };

      try {
        await controller.createUser(createUserDto as IUser);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Age is required.');
      }
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updateUserDto = {
        userName: 'Jane Updated',
        age: 26,
      };
      const mockUpdatedUser = {
        id: '1',
        userName: 'Jane Updated',
        age: 26,
      };

      jest.spyOn(service, 'updateUser').mockResolvedValue(mockUpdatedUser as IUser);

      const result = await controller.updateUser('1', updateUserDto);
      expect(result).toEqual({
        id: '1',
        userName: 'Jane Updated',
        age: 26,
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const updateUserDto = {
        userName: 'Jane Updated',
        age: 26,
      };

      jest.spyOn(service, 'updateUser').mockRejectedValue(new NotFoundException('User not found.'));

      try {
        await controller.updateUser('999', updateUserDto);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('User not found.');
      }
    });

    it('should throw BadRequestException for invalid userName length', async () => {
      const updateUserDto = {
        userName: 'Jo',
        age: 25,
      };

      try {
        await controller.updateUser('1', updateUserDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('User name must have at least 5 length.');
      }
    });
  });

  describe('removeUser', () => {
    it('should remove user successfully', async () => {
      const mockUser = {
        id: '1',
        userName: 'John Smith',
        password: 'strongPassword1!',
        age: 25,
      };
      jest.spyOn(service, 'removeUser').mockResolvedValue({ message: 'User has been successfully deleted.' });

      const result = await controller.removeUser('1');
      expect(result).toEqual({ message: 'User has been successfully deleted.' });
    });

    it('should throw NotFoundException when user is not found', async () => {
      jest.spyOn(service, 'removeUser').mockRejectedValue(new NotFoundException('User not found.'));

      try {
        await controller.removeUser('999');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('User not found.');
      }
    });
  });
});
