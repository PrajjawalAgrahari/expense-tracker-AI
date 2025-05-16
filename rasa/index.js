const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

// Actually use the CORS middleware
app.use(cors());

app.get("/", (req, res) => {
    axios
      .get("http://localhost:3000/api/test")
      .then((response) => {
        res.json(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        res.status(500).send("Error fetching data");
      });
//   res.send("Hello from the server!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
