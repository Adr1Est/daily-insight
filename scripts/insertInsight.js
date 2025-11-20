(async () => {
  await fetch(`${process.env.API_URL}/api/newInsight`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${process.env.INTERNAL_TOKEN}`
    }
  });
})();