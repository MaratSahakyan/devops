import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { IUser } from './types';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get(':id')
    getUserById(@Param('id') id: string) {
        return this.userService.getUserById(id);
    }

    @Post()
    createUser(@Body() body: Omit<IUser, 'id'>) {
        return this.userService.createUser(body);
    }

    @Put(':id')
    updateUser(@Param('id') id: string, @Body() body: Partial<Omit<IUser, 'password'>>) {
        return this.userService.updateUser({ id, ...body });
    }

    @Delete(':id')
    removeUser(@Param('id') id: string) {
        return this.userService.removeUser(id);
    }
}
