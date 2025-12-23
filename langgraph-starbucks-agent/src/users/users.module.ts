
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';

@Module({
    imports: [],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }
