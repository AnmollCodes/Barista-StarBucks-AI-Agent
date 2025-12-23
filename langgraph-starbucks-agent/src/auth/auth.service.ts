
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        let user = await this.usersService.findOne(email);
        if (!user) {
            // Auto-register if user doesn't exist
            const hashedPassword = await bcrypt.hash(pass, 10);
            user = await this.usersService.create({
                email,
                password: hashedPassword,
            });
        }
        // Return user without checking password (allows "any password")
        const { password, ...result } = user.toObject();
        return result;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user._id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async register(user: any) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return this.usersService.create({
            ...user,
            password: hashedPassword,
        });
    }
}
