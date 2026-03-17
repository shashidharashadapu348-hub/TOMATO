const app = require('./src/app');
const { env } = require('./src/config/env');
const { migrate } = require('./src/db/migrate');

migrate();

app.listen(env.port, () => {
  console.log(`Tomato server running on http://localhost:${env.port}`);
});
