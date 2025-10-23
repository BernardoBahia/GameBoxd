import { Prisma, User } from "@prisma/client";
import { randomUUID } from "node:crypto";

export class InMemoryUsersRepository {
  public items: User[] = [];

  async findById(id: string) {
    const user = this.items.find((user) => user.id === id);

    if (!user) {
      return null;
    }

    return user;
  }

  async findByEmail(email: string) {
    const user = this.items.find((user) => user.email === email);

    if (!user) {
      return null;
    }

    return user;
  }

  async create(data: Prisma.UserCreateInput) {
    const user: User = {
      id: randomUUID(),
      name: (data as any).name,
      email: (data as any).email,

      password:
        (data as any).password ??
        (data as any).password_hash ??
        (data as any).passwordHash ??
        "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.items.push(user);

    return user;
  }

  async findMany() {
    return this.items;
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    const userIndex = this.items.findIndex((user) => user.id === id);

    if (userIndex === -1) {
      throw new Error("User not found");
    }

    const user = this.items[userIndex];

    this.items[userIndex] = {
      ...user,
      name: (data as any).name ?? user.name,
      email: (data as any).email ?? user.email,

      password:
        (data as any).password ??
        (data as any).password_hash ??
        (data as any).passwordHash ??
        user.password,
      updatedAt: new Date(),
    };

    return this.items[userIndex];
  }

  async delete(id: string) {
    const userIndex = this.items.findIndex((user) => user.id === id);

    if (userIndex === -1) {
      throw new Error("User not found");
    }

    const deletedUser = this.items[userIndex];
    this.items.splice(userIndex, 1);

    return deletedUser;
  }
}
