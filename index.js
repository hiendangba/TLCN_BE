const app = require('./src/app');
const { loadModels } = require("./src/services/faceDetection.service");
const PORT = process.env.PORT || 3000;

async function startServer() {
  await loadModels();
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer();
