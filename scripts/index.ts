import 'dotenv/config';
// import { PrismaClient } from '../lib/generated/prisma/client';

(async () => {
  const response = await fetch(`${process.env.API_URL}/api/askAgent`);
  const data = await response.json();
  console.log(data);
})();