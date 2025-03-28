import { Logger } from '@nestjs/common';
import { hash } from 'argon2';

import { Prisma, PrismaClient } from '../../../prisma/generated';

import { CATEGORIES } from './data/categories.data';
import { STREAMS } from './data/streams.data';
import { USERNAMES } from './data/usernames.data';

const prisma = new PrismaClient({
  transactionOptions: {
    maxWait: 5000,
    timeout: 10000,
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  },
});

const main = async () => {
  try {
    Logger.log('Seeding database');

    await prisma.$transaction([
      prisma.user.deleteMany(),
      prisma.socialLink.deleteMany(),
      prisma.stream.deleteMany(),
      prisma.category.deleteMany(),
    ]);

    await prisma.category.createMany({
      data: CATEGORIES,
    });

    Logger.log('Categories seeded');

    const categories = await prisma.category.findMany();

    const categoriesBySlug = Object.fromEntries(
      categories.map(category => [category.slug, category]),
    );

    await prisma.$transaction(async tx => {
      for (const username of USERNAMES) {
        const randomCategory =
          categoriesBySlug[
            Object.keys(categoriesBySlug)[
              Math.floor(Math.random() * Object.keys(categoriesBySlug).length)
            ]
          ];

        const userExists = await tx.user.findUnique({
          where: {
            username,
          },
        });

        if (!userExists) {
          const createdUser = await tx.user.create({
            data: {
              email: `${username}@lumenway.com`,
              password: await hash('12345678'),
              username,
              displayName: username,
              avatar: `/channels/${username}.webp`,
              isEmailVerified: true,
              socialLinks: {
                createMany: {
                  data: [
                    {
                      title: 'TWITCH',
                      url: `https://www.twitch.tv/${username}`,
                      position: 1,
                    },
                    {
                      title: 'TWITTER',
                      url: `https://www.twitter.com/${username}`,
                      position: 2,
                    },
                  ],
                },
              },
              notificationSettings: {
                create: {},
              },
            },
          });

          const randomTitles = STREAMS[randomCategory.slug];
          const randomTitle =
            randomTitles[Math.floor(Math.random() * randomTitles.length)];

          await tx.stream.create({
            data: {
              title: randomTitle,
              thumbnailUrl: `/streams/${createdUser.username}.webp`,
              user: {
                connect: {
                  id: createdUser.id,
                },
              },
              category: {
                connect: {
                  id: randomCategory.id,
                },
              },
            },
          });

          Logger.log(`Created stream for user ${createdUser.username}`);
        }
      }
    });

    Logger.log('Seeded database');
  } catch (error) {
    Logger.error(error);
    throw new Error('Failed to seed database');
  } finally {
    Logger.log('Closing database connection');
    await prisma.$disconnect();
    Logger.log('Database connection closed');
  }
};

void main();
