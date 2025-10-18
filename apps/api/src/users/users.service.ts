import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException(`User with email ${createUserDto.email} already exists`);
    }

    // TODO: Hash password before saving
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        name: createUserDto.name,
        bio: createUserDto.bio,
        // password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        createdAt: true,
      },
    });

    this.logger.log(`User created: ${user.id}`);
    return user;
  }

  async findAll(skip = 0, take = 10) {
    const users = await this.prisma.user.findMany({
      skip,
      take,
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        createdAt: true,
      },
    });

    const total = await this.prisma.user.count();

    return {
      data: users,
      total,
      skip,
      take,
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    // Check if new email is already taken
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });
      if (existingUser) {
        throw new ConflictException(
          `Email ${updateUserDto.email} is already taken`
        );
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        createdAt: true,
      },
    });

    this.logger.log(`User updated: ${id}`);
    return updated;
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    await this.prisma.user.delete({ where: { id } });
    this.logger.log(`User deleted: ${id}`);

    return { message: `User ${id} deleted successfully` };
  }
}
