import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../trace/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async validateUser(username: string, pass: string) {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) return null;
    let ok = false;
    try {
      if (typeof user.passwordHash === 'string' && user.passwordHash.startsWith('$2')) {
        ok = await bcrypt.compare(pass, user.passwordHash);
      } else {
        ok = pass === user.passwordHash;
      }
    } catch (err) {
      ok = pass === user.passwordHash;
    }
    if (ok) return user;
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId, roles: [user.role] };
    return { access_token: this.jwtService.sign(payload) };
  }

  async register(username: string, password: string, role = 'user') {
    const exists = await this.userRepo.findOne({ where: { username } });
    if (exists) throw new BadRequestException('User exists');
    const hash = await bcrypt.hash(password, 10);
    const u = this.userRepo.create({ username, passwordHash: hash, role, createdAt: new Date() } as any);
    return this.userRepo.save(u as any);
  }
}
