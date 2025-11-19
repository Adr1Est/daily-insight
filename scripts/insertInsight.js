import 'dotenv/config';

(async () => {
  await fetch(`${process.env.API_URL}/api/newInsight`);
})();