import 'dotenv/config';

(async () => {
  const response = await fetch(`${process.env.API_URL}/api/askAgent`);
  const { output } = await response.json();
  console.log(output);
})();