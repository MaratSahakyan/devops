import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
} from '@nestjs/common';
import { UserService } from './user.service';
import { IUser } from './types';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  getUserById(@Param('id') id: string) {
    return this.userService.getUserById(Number(id));
  }

  @Post()
  @HttpCode(201)
  createUser(@Body() body: Omit<IUser, 'id'>) {
    return this.userService.createUser(body);
  }

  @Put(':id')
  updateUser(
    @Param('id') id: string,
    @Body() body: Partial<Omit<IUser, 'password' | 'id'>>,
  ) {
    return this.userService.updateUser({ ...body, id: Number(id) });
  }

  @Delete(':id')
  removeUser(@Param('id') id: string) {
    return this.userService.removeUser(Number(id));
  }
}
