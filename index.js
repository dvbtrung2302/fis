const express = require('express');
// const mongoose = require('mongoose');

// routes
const financeRoute = require('./routes/finance.route');

const app = express();
const port = process.env.PORT || 5000

// mongoose.connect(process.env.MONGO_URL || "mongodb+srv://dvbt2302:dvbt230220@fis.ierr9.mongodb.net/FIS?retryWrites=true&w=majority");

// app.get('/finance/:code', async (req, res) => {
//   try {
//     const { code } = req.params;
//     const resp = await axios.get(`https://api4.fialda.com/api/services/app/TechnicalAnalysis/GetFinancialHighlights?symbol=${code}`);
//     res.json(resp.data.result.map(item => ({
//       year: item.year,
//       quarter: item.quarter,
//       sale: item.netSale,
//       eps: item.eps
//     })))
//   } catch (error) {
//     console.log(error);
//   }
// })
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use("/api/finance", financeRoute);

app.get('/', (req, res) => {
  res.send("Hello world!")
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})