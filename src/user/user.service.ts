import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IUser } from './types';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getUserById(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException({
        message: 'User not found.',
      });
    }

    delete user.password;

    return user;
  }

  async createUser(body: Omit<IUser, 'id'>) {
    const { userName, password, age } = body;
    if (userName?.length < 5) {
      throw new BadRequestException({
        message: 'User name must have at least 5 length.',
      });
    }

    if (password?.length < 8) {
      throw new BadRequestException({
        message: 'Password must have at least 8 length.',
      });
    }

    if (!age) {
      throw new BadRequestException({
        message: 'Age is required.',
      });
    }

    const user = new UserEntity();
    user.userName = userName;
    user.password = password;
    user.age = age;

    return this.userRepository.save(user);
  }

  async updateUser(body: { id: number; userName?: string; age?: number }) {
    const user = await this.userRepository.findOne({ where: { id: body.id } });

    if (!user) {
      throw new NotFoundException({
        message: 'User not found.',
      });
    }

    if (body.hasOwnProperty('userName')) {
      if (body.userName?.length < 5) {
        throw new BadRequestException({
          message: 'User name must have at least 5 length.',
        });
      }
      user.userName = body.userName;
    }

    if (body.hasOwnProperty('age') && body.age) {
      user.age = body.age;
    }

    return this.userRepository.save(user);
  }

  async removeUser(id: number) {
    const deleted = await this.userRepository.delete(id);

    if (!deleted.affected) {
      throw new NotFoundException({
        message: 'User not found.',
      });
    }

    return { message: 'User has been successfully deleted.' };
  }
}
