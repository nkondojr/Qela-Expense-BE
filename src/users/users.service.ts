import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

// ***********************************************************************************************************************************************
  async create(createUserDto: CreateUserDto): Promise<{ message: string; user: Partial<User> }> {
    const { fullName, email, mobile, password } = createUserDto;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User();
    user.fullName = fullName;
    user.email = email;
    user.mobile = mobile;
    user.password = hashedPassword;

    const savedUser = await this.userRepository.save(user);

    const { password: _, ...userWithoutPassword } = savedUser;
    
    return {
      message: 'User registered successfully',
      user: userWithoutPassword,
    };
  }

// ***********************************************************************************************************************************************
  async findByMobile(mobile: string): Promise<User> {
    return this.userRepository.findOne({ where: { mobile } });
  }

// ***********************************************************************************************************************************************
  async getUserProfile(id: string): Promise<Partial<User> | undefined> {
    const user = await this.userRepository.findOne({ where: { id } });
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

// ***********************************************************************************************************************************************
  async findAll(searchTerm?: string, page: number = 1, pageSize: number = 10): Promise<any> {
    const query = this.userRepository.createQueryBuilder('user')
      .select(['user.id', 'user.fullName', 'user.email', 'user.mobile']);

    if (searchTerm) {
      query.where('user.fullName LIKE :searchTerm OR user.email LIKE :searchTerm', { searchTerm: `%${searchTerm}%` });
    }

    query.skip((page - 1) * pageSize).take(pageSize);

    const [data, total] = await query.getManyAndCount();
    const lastPage = Math.ceil(total / pageSize);

    return {
      links: {
        next: page < lastPage ? `/users?page=${page + 1}&pageSize=${pageSize}` : null,
        previous: page > 1 ? `/users?page=${page - 1}&pageSize=${pageSize}` : null
      },
      count: total,
      lastPage: lastPage,
      currentPage: page,
      data: data
    };
  }

// ***********************************************************************************************************************************************
  async findOne(id: string): Promise<Partial<User> | undefined> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

}
