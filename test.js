const bcrypt = require("bcryptjs");

(async () => {
  const password = await bcrypt.hash("123456789", 10);
  console.log(password);
})();