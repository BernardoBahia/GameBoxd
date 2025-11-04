import { PrismaClient, User as PrismaUser } from "@prisma/client";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model";

const prisma = new PrismaClient();

export class UserService {
  private toUserModel(prismaUser: PrismaUser): User {
    return {
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.name,
      passwordHash: prismaUser.password,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt ?? prismaUser.createdAt,
    };
  }

  async createUser(
    email: string,
    name: string,
    password: string
  ): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const createdUser = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
        },
      });

      return this.toUserModel(createdUser);
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      throw new Error("Falha ao criar usuário");
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      return user ? this.toUserModel(user) : null;
    } catch (error) {
      console.error("Erro ao buscar usuário por e-mail:", error);
      throw new Error("Falha ao buscar usuário por e-mail");
    }
  }

  async validatePassword(plainPassword: string, hashedPassword: string) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error("Erro ao validar senha do usuário:", error);
      throw new Error("Falha ao validar senha do usuário");
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const users = await prisma.user.findMany();
      return users.map((user) => this.toUserModel(user));
    } catch (error) {
      console.error("Erro ao listar usuários:", error);
      throw new Error("Falha ao listar usuários");
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
      });

      return user ? this.toUserModel(user) : null;
    } catch (error) {
      console.error("Erro ao buscar usuário por ID:", error);
      throw new Error("Falha ao buscar usuário por ID");
    }
  }

  async updateUser(
    id: string,
    data: { email?: string; name?: string; password?: string }
  ): Promise<User> {
    try {
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data,
      });

      return this.toUserModel(updatedUser);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      throw new Error("Falha ao atualizar usuário");
    }
  }

  async deleteUser(id: string): Promise<User> {
    try {
      const deletedUser = await prisma.user.delete({
        where: { id },
      });

      return this.toUserModel(deletedUser);
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      throw new Error("Falha ao deletar usuário");
    }
  }
}
