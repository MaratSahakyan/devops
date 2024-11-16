import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {IUser} from "./types";

@Injectable()
export class UserService {
    private static users: IUser[] = [
        {
            id: '1',
            userName: "John Smith",
            password: "strongPassword1!",
            age: 25,
        },
        {
            id: '2',
            userName: "Muhammed Ali",
            password: "strongPassword2!",
            age: 21,
        },
        {
            id: '3',
            userName: "Mike Tyson",
            password: "strongPassword2!",
            age: 21,
        },
        {
            id: '4',
            userName: "Mike Tyson2",
            password: "strongPassword3!",
            age: 58,
        },
    ];

    async getUserById(id: string) {
        const userData = UserService.users.find(u => u.id === id);

        if(!userData) {
            throw new NotFoundException({
                message: 'User not found.'
            });
        }

        delete userData.password;

        return userData;
    }

    async createUser(body: Omit<IUser, 'id'>) {
        const {userName, password, age} = body;
        if(userName.length < 3) {
            throw new BadRequestException({
                message: 'User name must have at least 5 length.'
            })
        }

        if(password.length < 8) {
            throw new BadRequestException({
                message: 'Password must have at least 8 length.'
            })
        }

        if(!age) {
            throw new BadRequestException({
                message: 'Age is required.'
            })
        }

        const newUser: IUser = {
            id: crypto.randomUUID(),
            userName,
            password,
            age,
        }

        UserService.users.push(newUser);
        delete newUser.password;
        return newUser;
    }

    async updateUser(body: { id: string; userName?: string; age?: number }) {
        const userIndex = UserService.users.findIndex(u => u.id === body.id);
        const userData = UserService.users[userIndex];

        if(!userData) {
            throw new NotFoundException({
                message: 'User not found.'
            })
        }

        if (body.hasOwnProperty('userName')) {
            if(body.userName?.length > 3) {
                throw new BadRequestException({
                    message: 'User name must have at least 5 length.'
                })
            }
            userData.userName = body.userName;
        }

        if (body.hasOwnProperty('age') && body.age) {
            userData.age = body.age;
        }

        UserService.users[userIndex] = userData;
        delete userData.password;
        return userData;
    }

    async removeUser(id: string) {
        const userData = UserService.users.find(u => u.id === id);

        if(!userData) {
            throw new NotFoundException({
                message: 'User not found.'
            })
        }

        UserService.users = UserService.users.filter(u => u.id === id);

        return { message: 'User has been successfully deleted.' }
    }

}
