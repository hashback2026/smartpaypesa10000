require("dotenv").config();
const express = require("express");
const axios = require("axios");
const PQueue = require("p-queue").default;
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

const queue = new PQueue({
  interval: 1000,
  intervalCap: 3
});

const API_URL = "https://api.smartpaypesa.com/v1/stkpush";

async function sendSTK(phone, amount, reference) {
  try {
    const response = await axios.post(
      API_URL,
      {
        phone,
        amount,
        accountReference: reference,
        transactionDesc: "Bulk Payment"
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return { phone, status: "success", data: response.data };
  } catch (error) {
    return {
      phone,
      status: "failed",
      error: error.response?.data || error.message
    };
  }
}

app.post("/bulk-stk", async (req, res) => {
  const { numbers, amount, reference } = req.body;

  if (!numbers || !amount) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const phoneList = numbers.split(",").map(n => n.trim());

  const results = [];

  await Promise.all(
    phoneList.map(phone =>
      queue.add(async () => {
        const result = await sendSTK(phone, amount, reference);
        results.push(result);
      })
    )
  );

  res.json(results);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
