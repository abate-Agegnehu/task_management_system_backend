require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const productRoutes = require("./routes/product.route");

const app = express();
connectDB();
app.use(express.json());
app.use(cors());

app.use("/api/products", productRoutes);

if (!process.env.MONGO_URI || !process.env.PORT) {
  console.error("Missing required environment variables.");
  process.exit(1);
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Export the Express app for Vercel
module.exports = app;
