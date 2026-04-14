import { PrismaService } from "src/prisma/prisma.service";

export class UserProfileRepository {
    constructor(private readonly prisma: PrismaService) { }
}