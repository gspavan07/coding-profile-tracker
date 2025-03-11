const express = require("express");
const { exec } = require("child_process");
const cron = require("node-cron");

const app = express();

function updateData() {
  exec(
    ". venv/bin/activate && python3 extractData.py",
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }
      console.log(`Output: ${stdout}`);
    }
  );
}

// Schedule the task to run every 2 hours
cron.schedule("0 */1 * * *", () => {
  console.log("Running scheduled data update...");
  updateData();
});

app.listen(5000, () => console.log("Server running on port 5000"));
