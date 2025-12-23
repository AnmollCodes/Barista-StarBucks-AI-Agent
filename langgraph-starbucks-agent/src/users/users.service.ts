
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
    private users = [];

    constructor() { }

    async create(createUserDto: any): Promise<any> {
        const user = { ...createUserDto, _id: 'user_' + Date.now() };
        // Add toObject for compatibility with AuthService
        user.toObject = () => user;
        this.users.push(user);
        return user;
    }

    async findOne(email: string): Promise<any | undefined> {
        const user = this.users.find(u => u.email === email);
        if (user) {
            // Ensure toObject exists if retrieving
            return {
                ...user,
                toObject: () => user
            }
        }
        return undefined;
    }
}
