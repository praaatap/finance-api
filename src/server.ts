import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

import logger from './utils/logger';

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
