const app = require('./src/app');
const sequelize = require('./src/db/database');

// Import models to ensure they are registered with Sequelize before syncing
require('./src/models/RewriteItem');

const PORT = process.env.PORT || 5000;

/**
 * Initializes the database and starts the Express server.
 */
const startServer = async () => {
  try {
    // 1. Test the database connection
    await sequelize.authenticate();
    console.log('SQLite database connection has been established successfully.');
    
    // 2. Synchronize all models
    // Using { force: false } by default to ensure we NEVER delete existing data
    await sequelize.sync();
    console.log('All database models were synchronized successfully.');

    // 3. Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database or start the server:', error);
    process.exit(1); // Exit safely if the database fails to initialize
  }
};

startServer();
