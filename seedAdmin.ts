import 'dotenv/config'
import { prisma } from './src/lib/prisma'
import { hash } from 'bcryptjs'

async function main() {
  const hashedPassword = await hash('Zeanokai@1', 10)
  const user = await prisma.user.upsert({
    where: { email: 'annc19324@gmail.com' },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      name: 'annc19324',
      username: 'annc19324',
    },
    create: {
      email: 'annc19324@gmail.com',
      password: hashedPassword,
      role: 'ADMIN',
      name: 'annc19324',
      username: 'annc19324',
    },
  })
  console.log('Admin user upserted:', user)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
