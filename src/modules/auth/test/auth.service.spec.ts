import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '@src/modules/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { USERS_REPOSITORY } from '@src/shared/constants';

const mockUsersRepository = {
  findByEmail: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
};

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: USERS_REPOSITORY, useValue: mockUsersRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    jest.resetAllMocks();
  });

  it('should sign up a new user successfully', async () => {
    mockUsersRepository.findByEmail.mockResolvedValue(null);
    mockUsersRepository.create.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      created_at: new Date(),
    });

    const bcryptHash = jest.fn().mockResolvedValueOnce('hashedPassword');

    (bcrypt.hash as jest.Mock) = bcryptHash;

    const result = await authService.signup({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('email', 'test@example.com');
    expect(mockUsersRepository.create).toHaveBeenCalled();
    expect(mockUsersRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@example.com',
        password: 'hashedPassword',
      }),
    );
  });

  it('should throw ConflictException if user already exists', async () => {
    mockUsersRepository.findByEmail.mockResolvedValueOnce({
      id: 1,
      email: 'test@example.com',
    });

    await expect(
      authService.signup({
        email: 'test@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('should sign in a user successfully', async () => {
    mockUsersRepository.findByEmail.mockResolvedValueOnce({
      id: 1,
      email: 'test@example.com',
      password: 'hashedPassword',
      created_at: new Date(),
    });

    const compareHash = jest.fn().mockResolvedValueOnce(true);

    (bcrypt.compare as jest.Mock) = compareHash;

    jest.spyOn(jwtService, 'sign').mockReturnValueOnce('mocked_token');

    const result = await authService.signin({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result).toHaveProperty('access_token', 'mocked_token');
    expect(result.user).toHaveProperty('id', 1);
    expect(result.user).toHaveProperty('email', 'test@example.com');
  });

  it('should throw NotFoundException if email is incorrect', async () => {
    mockUsersRepository.findByEmail.mockResolvedValue(null);

    await expect(
      authService.signin({
        email: 'wrong@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if password is incorrect', async () => {
    mockUsersRepository.findByEmail.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      password: 'hashedPassword',
      created_at: new Date(),
    });

    const compareHash = jest.fn().mockResolvedValueOnce(false);

    (bcrypt.compare as jest.Mock) = compareHash;

    await expect(
      authService.signin({
        email: 'test@example.com',
        password: 'wrongpassword',
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
