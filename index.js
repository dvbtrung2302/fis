const express = require('express')
const axios = require('axios');
const app = express()
const port = 5000

app.get('/finance/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const resp = await axios.get(`https://api4.fialda.com/api/services/app/TechnicalAnalysis/GetFinancialHighlights?symbol=${code}`);
    res.json(resp.data.result.map(item => ({
      year: item.year,
      quarter: item.quarter,
      sale: item.netSale,
      eps: item.eps
    })))
  } catch (error) {
    console.log(error);
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})