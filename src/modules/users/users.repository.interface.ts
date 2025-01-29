export type User = {
  id: number;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date | null;
};

export type CreateUser = {
  email: string;
  password: string;
};

export interface IUsersRepository {
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUser): Promise<User>;
}
