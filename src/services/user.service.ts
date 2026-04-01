import prisma from "../utils/prisma";
import { IUser, IUserWithoutPassword, UserRole, UserStatus } from "../types";

export class UserService {
  /**
   * Get all users
   */
  async getAllUsers(): Promise<IUserWithoutPassword[]> {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, status: true, createdAt: true, updatedAt: true },
    });
    return users as IUserWithoutPassword[];
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<IUserWithoutPassword | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, status: true, createdAt: true, updatedAt: true },
    });
    return user as IUserWithoutPassword | null;
  }

  /**
   * Update user role and status
   */
  async updateUser(id: string, role?: UserRole, status?: UserStatus): Promise<IUserWithoutPassword> {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new Error("User not found");
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(status && { status }),
      },
      select: { id: true, email: true, role: true, status: true, createdAt: true, updatedAt: true },
    });

    return updatedUser as IUserWithoutPassword;
  }

  /**
   * Deactivate user
   */
  async deactivateUser(id: string): Promise<IUserWithoutPassword> {
    return this.updateUser(id, undefined, "INACTIVE");
  }

  /**
   * Activate user
   */
  async activateUser(id: string): Promise<IUserWithoutPassword> {
    return this.updateUser(id, undefined, "ACTIVE");
  }
}

export default new UserService();

