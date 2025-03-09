const express = require("express");
const { exec } = require("child_process");

const app = express();

app.get("/update-data", (req, res) => {
  exec(
    ". venv/bin/activate && python3 extractData.py",
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return res.status(500).send("Error running script");
      }
      console.log(`Output: ${stdout}`);
      res.send("Data updated successfully");
    }
  );
});

app.listen(5000, () => console.log("Server running on port 5000"));
