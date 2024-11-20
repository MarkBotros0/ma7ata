import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async findOneByPhoneNumber(phoneNumber: string): Promise<User> {
    return this.usersRepository.findOne({ where: { phoneNumber } });
  }

  async findOneById(id: number): Promise<User> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async create(
    phoneNumber: string,
    data?: Partial<Omit<User, 'phoneNumber'>>
  ): Promise<User> {
    return this.usersRepository.save({ phoneNumber, ...data });
  }
}
