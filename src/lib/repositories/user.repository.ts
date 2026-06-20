import { prisma } from "@/lib/db/prisma";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  provider: string;
}

type UserRow = UserRecord & { passwordHash: string | null };

const toRecord = (u: UserRow): UserRecord => ({
  id: u.id,
  name: u.name,
  email: u.email,
  provider: u.provider,
});

export const userRepository = {
  async findById(id: string): Promise<UserRecord | null> {
    const u = await prisma.user.findUnique({ where: { id } });
    return u ? toRecord(u) : null;
  },

  async findByEmail(email: string): Promise<UserRow | null> {
    return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  },

  async create(input: {
    name: string;
    email: string;
    passwordHash?: string | null;
    provider?: string;
  }): Promise<UserRecord> {
    const u = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash: input.passwordHash ?? null,
        provider: input.provider ?? "email",
      },
    });
    return toRecord(u);
  },
};
