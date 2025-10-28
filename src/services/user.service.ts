import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export class UserService {
  async createUser(email: string, name: string, password: string) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      return await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
        },
      });
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      throw new Error("Falha ao criar usuário");
    }
  }

  async getUserByEmail(email: string) {
    try {
      return await prisma.user.findUnique({
        where: { email },
      });
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

  async getAllUsers() {
    try {
      return await prisma.user.findMany();
    } catch (error) {
      console.error("Erro ao listar usuários:", error);
      throw new Error("Falha ao listar usuários");
    }
  }

  async getUserById(id: string) {
    try {
      return await prisma.user.findUnique({
        where: { id },
      });
    } catch (error) {
      console.error("Erro ao buscar usuário por ID:", error);
      throw new Error("Falha ao buscar usuário por ID");
    }
  }

  async updateUser(
    id: string,
    data: { email?: string; name?: string; password?: string }
  ) {
    try {
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }

      return await prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      throw new Error("Falha ao atualizar usuário");
    }
  }

  async deleteUser(id: string) {
    try {
      return await prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      throw new Error("Falha ao deletar usuário");
    }
  }
}
