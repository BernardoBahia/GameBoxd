import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class UserService {
  async createUser(email: string, name: string, password: string) {
    return prisma.user.create({
      data: {
        email,
        name,
        password,
      },
    });
  }

  async getAllUsers() {
    return prisma.user.findMany();
  }

  async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async deleteUser(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }
}
