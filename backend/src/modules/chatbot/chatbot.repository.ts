import { prisma } from '../../lib/prisma';

export const chatbotRepository = {
  async save(userId: string, message: string, response: string): Promise<string> {
    const conversation = await prisma.chatbotConversation.create({
      data: { userId, message, response },
      select: { id: true },
    });
    return conversation.id;
  },

  async countTodayByUser(userId: string, todayStart: Date): Promise<number> {
    return prisma.chatbotConversation.count({
      where: {
        userId,
        createdAt: { gte: todayStart },
      },
    });
  },
};
