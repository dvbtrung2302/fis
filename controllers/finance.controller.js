const axios = require("axios");

const headerToken = "-Z52PS_eA8YUQ11dH7n9YfmO-nK8VKE4PMzfsJLHn6c6FU65SH1qYIYGXEFksCfyGvonsskmsDy21fI5zbt2NwCZEPbN0ygDEyOSWT9onN41";
const dataToken = "iEQmMIOsEDDTeZwtew0TX1UjMQvIQ00lEj3GigfpbpEXE6ryLUuMsoAlfHa_BI0Cu74rFB1tV-NT_zQ3v56DvQQJYFeBFXBeey-QMNhuOTA1";

const PERCENT_1 = 0.3;
const PERCENT_3 = 0.35;
const PERCENT_5 = 0.35;

const getComponentPoint = (value1, value3, value5, reference) => {
  const a = value1 >= reference ? PERCENT_1 : (value1 / reference) * PERCENT_1;
  const b = value3 >= reference ? PERCENT_3 : (value3 / reference) * PERCENT_3;
  const c = value5 >= reference ? PERCENT_5 : (value5 / reference) * PERCENT_5;
  return (a + b + c) * 100;
}

const rate = function(periods, payment, present, future, type, guess) {
  guess = (guess === undefined) ? 0.01 : guess;
  future = (future === undefined) ? 0 : future;
  type = (type === undefined) ? 0 : type;

  // Set maximum epsilon for end of iteration
  var epsMax = 1e-10;

  // Set maximum number of iterations
  var iterMax = 10;

  // Implement Newton's method
  var y, y0, y1, x0, x1 = 0,
    f = 0,
    i = 0;
  var rate = guess;
  if (Math.abs(rate) < epsMax) {
    y = present * (1 + periods * rate) + payment * (1 + rate * type) * periods + future;
  } else {
    f = Math.exp(periods * Math.log(1 + rate));
    y = present * f + payment * (1 / rate + type) * (f - 1) + future;
  }
  y0 = present + payment * periods + future;
  y1 = present * f + payment * (1 / rate + type) * (f - 1) + future;
  i = x0 = 0;
  x1 = rate;
  while ((Math.abs(y0 - y1) > epsMax) && (i < iterMax)) {
    rate = (y1 * x0 - y0 * x1) / (y1 - y0);
    x0 = x1;
    x1 = rate;
      if (Math.abs(rate) < epsMax) {
        y = present * (1 + periods * rate) + payment * (1 + rate * type) * periods + future;
      } else {
        f = Math.exp(periods * Math.log(1 + rate));
        y = present * f + payment * (1 / rate + type) * (f - 1) + future;
      }
    y0 = y1;
    y1 = y;
    ++i;
  }
  return rate;
};

const getData = (code, type, page, termType = 1) => {
  return `Code=${code}&ReportType=${type}&ReportTermType=${termType}&Unit=1000000000&Page=${page}&PageSize=4&__RequestVerificationToken=${dataToken}`
}

const getIndicators = async (code) => {
  const resp = await axios.post("https://finance.vietstock.vn/data/financeinfo", getData(code, "BCTT", 1), {
      headers: {
        "User-Agent": "abc",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Cookie": `__RequestVerificationToken=${headerToken}`
      }
    });
    // get all data
    let allYear = [ ...resp.data?.[0] ];
    let allData = { ...resp.data?.[1] };
    let index = 4;
    const divisibleNumber = Math.ceil(resp.data?.[0][0]?.TotalRow / 4) * 4 - resp.data?.[0][0]?.TotalRow;

    const getYearValue = (index, nextData, item, type) => {
      if (divisibleNumber === 0) {
        return {
          [`Value${index + 1}`]: nextData.data?.[1][type]?.find(elm => elm.ID === item.ID)[`Value1`],
          [`Value${index + 2}`]: nextData.data?.[1][type]?.find(elm => elm.ID === item.ID)[`Value2`],
          [`Value${index + 3}`]: nextData.data?.[1][type]?.find(elm => elm.ID === item.ID)[`Value3`],
          [`Value${index + 4}`]: nextData.data?.[1][type]?.find(elm => elm.ID === item.ID)[`Value4`],
        }
      }
      if (divisibleNumber === 1) {
        return {
          [`Value${index + 1}`]: index + 1 !== resp.data?.[0][0]?.TotalRow - 2 ? 
          nextData.data?.[1][type]?.find(elm => elm.ID === item.ID)[`Value1`] :
          nextData.data?.[1][type]?.find(elm => elm.ID === item.ID)[`Value${1 + divisibleNumber}`],
          [`Value${index + 2}`]: index + 2 !== resp.data?.[0][0]?.TotalRow - 1 ? 
          nextData.data?.[1][type]?.find(elm => elm.ID === item.ID)[`Value2`] :
          nextData.data?.[1][type]?.find(elm => elm.ID === item.ID)[`Value${2 + divisibleNumber}`],
          [`Value${index + 3}`]: index + 3 !== resp.data?.[0][0]?.TotalRow ? 
          nextData.data?.[1][type]?.find(elm => elm.ID === item.ID)[`Value3`] :
          nextData.data?.[1][type]?.find(elm => elm.ID === item.ID)[`Value${3 + divisibleNumber}`],
          [`Value${index + 4}`]: index + 4 <= resp.data?.[0][0]?.TotalRow ? nextData.data?.[1][type]?.find(elm => elm.ID === item.ID)[`Value4`] : undefined,
        }
      }
      if (divisibleNumber === 2) {
        return {
          [`Value${index + 1}`]: index + 1 !== resp.data?.[0][0]?.TotalRow - 1? 
          nextData.data?.[1][type]?.find(elm => elm.ID === item.ID)[`Value1`] :
          nextData.data?.[1][type]?.find(elm => elm.ID === item.ID)[`Value${1 + divisibleNumber}`],
          [`Value${index + 2}`]: index + 2 !== resp.data?.[0][0]?.TotalRow ? 
          nextData.data?.[1][type]?.find(elm => elm.ID === item.ID)[`Value2`] :
          nextData.data?.[1][type]?.find(elm => elm.ID === item.ID)[`Value${2 + divisibleNumber}`],
          [`Value${index + 3}`]: index + 3 <= resp.data?.[0][0]?.TotalRow ? nextData.data?.[1][type]?.find(elm => elm.ID === item.ID)[`Value3`] : undefined,
          [`Value${index + 4}`]: index + 4 <= resp.data?.[0][0]?.TotalRow ? nextData.data?.[1][type]?.find(elm => elm.ID === item.ID)[`Value4`] : undefined,
        }
      }
      if (divisibleNumber === 3) {
        return {
          [`Value${index + 1}`]: index + 1 !== resp.data?.[0][0]?.TotalRow ? 
          nextData.data?.[1][type]?.find(elm => elm.ID === item.ID)[`Value1`] :
          nextData.data?.[1][type]?.find(elm => elm.ID === item.ID)[`Value${1 + divisibleNumber}`],
          [`Value${index + 2}`]: index + 2 <= resp.data?.[0][0]?.TotalRow ? nextData.data?.[1][type]?.find(elm => elm.ID === item.ID)[`Value2`] : undefined,
          [`Value${index + 3}`]: index + 3 <= resp.data?.[0][0]?.TotalRow ? nextData.data?.[1][type]?.find(elm => elm.ID === item.ID)[`Value3`] : undefined,
          [`Value${index + 4}`]: index + 4 <= resp.data?.[0][0]?.TotalRow ? nextData.data?.[1][type]?.find(elm => elm.ID === item.ID)[`Value4`] : undefined,
        }
      }
    }
    for (let i = 2; i <= Math.ceil(resp.data?.[0][0]?.TotalRow / 4); i++) {
      let nextData = await axios.post("https://finance.vietstock.vn/data/financeinfo", getData(code, "BCTT", i), {
        headers: {
          "User-Agent": "abc",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "Cookie": `__RequestVerificationToken=${headerToken}`
        }
      });
      const filtedYear = nextData.data?.[0]?.filter(item => !allYear.find(elm => elm.YearPeriod === item.YearPeriod))
      allYear = [
        ...filtedYear,
        ...allYear
      ]
      allData = {
        ...allData,
        "Kết quả kinh doanh": [...allData["Kết quả kinh doanh"]].map(item => ({
          ...item,
          ...getYearValue(index, nextData, item, "Kết quả kinh doanh")
        })),
        "Cân đối kế toán": [...allData["Cân đối kế toán"]].map(item => ({
          ...item,
          ...getYearValue(index, nextData, item, "Cân đối kế toán")
        })),
        "Chỉ số tài chính": [...allData["Chỉ số tài chính"]].map(item => ({
          ...item,
          ...getYearValue(index, nextData, item, "Chỉ số tài chính")
        }))
      }
      index += 4; 
    }

    const resp2 = await axios.post("https://finance.vietstock.vn/data/financeinfo", getData(code, "LC", 1), {
      headers: {
        "User-Agent": "abc",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Cookie": `__RequestVerificationToken=${headerToken}`
      }
    });
    let allOpc = { 
      "Lưu chuyển tiền tệ gián tiếp": resp2?.data?.[1]?.["Lưu chuyển tiền tệ gián tiếp"] || [],
      "Lưu chuyển tiền tệ trực tiếp": resp2?.data?.[1]?.["Lưu chuyển tiền tệ trực tiếp"] || [],
    }
    let index2 = 4;
    for (let i = 2; i <= Math.ceil(resp2.data?.[0][0]?.TotalRow / 4); i++) {
      let nextOpc = await axios.post("https://finance.vietstock.vn/data/financeinfo", getData(code, "LC", i), {
        headers: {
          "User-Agent": "abc",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "Cookie": `__RequestVerificationToken=${headerToken}`
        }
      });
      allOpc = {
        ...allOpc,
        "Lưu chuyển tiền tệ gián tiếp": !allOpc["Lưu chuyển tiền tệ gián tiếp"]?.length && !nextOpc.data?.[1]?.["Lưu chuyển tiền tệ gián tiếp"]?.length ?
        [] :
        (
          allOpc["Lưu chuyển tiền tệ gián tiếp"]?.length > 0 && nextOpc.data?.[1]?.["Lưu chuyển tiền tệ gián tiếp"]?.length > 0 ?
          [...allOpc["Lưu chuyển tiền tệ gián tiếp"]].map(item => ({
            ...item,
            ...getYearValue(index2, nextOpc, item, "Lưu chuyển tiền tệ gián tiếp")
          })) : 
          (
            allOpc["Lưu chuyển tiền tệ gián tiếp"]?.length > 0 && !nextOpc.data?.[1]?.["Lưu chuyển tiền tệ gián tiếp"]?.length ?
            [...allOpc["Lưu chuyển tiền tệ gián tiếp"]] : 
            [...nextOpc.data?.[1]?.["Lưu chuyển tiền tệ gián tiếp"]]
          )
        ),
        "Lưu chuyển tiền tệ trực tiếp": !allOpc["Lưu chuyển tiền tệ trực tiếp"]?.length && !nextOpc.data?.[1]?.["Lưu chuyển tiền tệ trực tiếp"]?.length ?
        [] :
        (
          allOpc["Lưu chuyển tiền tệ trực tiếp"]?.length > 0 && nextOpc.data?.[1]?.["Lưu chuyển tiền tệ trực tiếp"]?.length > 0 ?
          [...allOpc["Lưu chuyển tiền tệ trực tiếp"]].map(item => ({
            ...item,
            ...getYearValue(index2, nextOpc, item, "Lưu chuyển tiền tệ trực tiếp")
          })) : 
          (
            allOpc["Lưu chuyển tiền tệ trực tiếp"]?.length > 0 && !nextOpc.data?.[1]?.["Lưu chuyển tiền tệ trực tiếp"]?.length ?
            [...allOpc["Lưu chuyển tiền tệ trực tiếp"]] : 
            [...nextOpc.data?.[1]?.["Lưu chuyển tiền tệ trực tiếp"]]
          )
        ),
      }
      index2 += 4; 
    }
    // transform data
    const result = allYear.map((item, index) => {
      const sales = allData?.["Kết quả kinh doanh"]?.[0][`Value${item.Row}`]; // doanh thu
      const totalAssets = allData?.["Cân đối kế toán"]?.find(elm => elm["NameMobile"]?.toLowerCase() === "tổng ts")?.[`Value${item.Row}`]; // tổng tài sản
      const profixAfterTax = allData?.["Kết quả kinh doanh"]?.[allData?.["Kết quả kinh doanh"]?.length - 2]?.[`Value${item.Row}`]; // lợi nhuận sau thuế
      const opc = Object.values(allOpc)?.map(elm => 
        elm.find(childElement => 
          childElement?.["Name"]?.toLowerCase().includes("lưu chuyển tiền thuần từ hoạt động kinh doanh") ||
          childElement?.["Name"]?.toLowerCase().includes("lưu chuyển tiền thuần từ hđkd") ||
          childElement?.["Name"]?.toLowerCase().includes("lưu chuyển tiền thuần từ hoạt động kinh doanh")
        )?.[`Value${item.Row}`] || 0
      )?.reduce((a, b) => a  + (b || 0), 0); // lưu chuyển tiền thuần từ hoạt động kinh doanh;
      const ownerEquity = allData?.["Cân đối kế toán"]?.find(elm => elm?.["NameMobile"]?.toLowerCase() === "vcsh")?.[`Value${item.Row}`] // vốn chủ sở hữu
      const longTermDebt = allData?.["Cân đối kế toán"]?.[allData?.["Cân đối kế toán"]?.length - 7]?.[`Value${item.Row}`]// nợ dài hạn
      return {
        id: index,
        year: item?.YearPeriod,
        sales,
        eps: allData?.["Chỉ số tài chính"]?.[0][`Value${item.Row}`],
        bvps: allData?.["Chỉ số tài chính"]?.[1][`Value${item.Row}`],
        opc,
        lastYearLongTermDebt: allData?.["Cân đối kế toán"]?.[allData?.["Cân đối kế toán"]?.length - 7]?.[`Value1`], // nợ dài hạn năm gần nhất
        lastYearProfit: allData?.["Kết quả kinh doanh"]?.[allData?.["Kết quả kinh doanh"]?.length - 2]?.[`Value1`], // lợi nhuận năm gần nhất
        effectiveness: parseFloat((sales / totalAssets).toFixed(3)),
        efficiency: parseFloat((profixAfterTax / sales).toFixed(3)),
        productivity: parseFloat((opc / profixAfterTax).toFixed(3)), 
        roa: parseFloat(((profixAfterTax / totalAssets) * 100).toFixed(2)),
        roe: parseFloat(((profixAfterTax / ownerEquity) * 100).toFixed(2)),
        roic: parseFloat(((profixAfterTax / (ownerEquity + longTermDebt)) * 100).toFixed(2)),
        ownerEquity,
        profixAfterTax
      }
    })
    return result
}

const getCanslim = async (code) => {
  const resp = await axios.post("https://finance.vietstock.vn/data/financeinfo", getData(code, "BCTT", 1, 2), {
    headers: {
      "User-Agent": "abc",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "Cookie": `__RequestVerificationToken=${headerToken}`
    }
  });
  const resp2 = await axios.post("https://finance.vietstock.vn/data/financeinfo", getData(code, "BCTT", 2, 2), {
    headers: {
      "User-Agent": "abc",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "Cookie": `__RequestVerificationToken=${headerToken}`
    }
  });
  const resp3 = await axios.post("https://finance.vietstock.vn/data/financeinfo", getData(code, "BCTT", 3, 2), {
    headers: {
      "User-Agent": "abc",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "Cookie": `__RequestVerificationToken=${headerToken}`
    }
  });
  if (!resp.data?.[0]?.length) {
    return
  }
  const latestTraillingPercent = (type) =>  (
    [
      resp.data?.[1]?.[type]?.[0]?.[`Value2`],
      resp.data?.[1]?.[type]?.[0]?.[`Value3`],
      resp.data?.[1]?.[type]?.[0]?.[`Value4`],
      resp2.data?.[1]?.[type]?.[0]?.[`Value1`],
    ].reduce((a, b) => a + (b || 0), 0) /
    [
      resp2.data?.[1]?.[type]?.[0]?.[`Value2`],
      resp2.data?.[1]?.[type]?.[0]?.[`Value3`],
      resp2.data?.[1]?.[type]?.[0]?.[`Value4`],
      resp3.data?.[1]?.[type]?.[0]?.[`Value1`],
    ].reduce((a, b) => a + (b || 0), 0) - 1).toFixed(2);

  const latestPreviousTraillingPercent = (type) => (
      [
        resp.data?.[1]?.[type]?.[0]?.[`Value3`],
        resp.data?.[1]?.[type]?.[0]?.[`Value4`],
        resp2.data?.[1]?.[type]?.[0]?.[`Value1`],
        resp2.data?.[1]?.[type]?.[0]?.[`Value2`],
      ].reduce((a, b) => a + (b || 0), 0) /
      [
        resp2.data?.[1]?.[type]?.[0]?.[`Value3`],
        resp2.data?.[1]?.[type]?.[0]?.[`Value4`],
        resp3.data?.[1]?.[type]?.[0]?.[`Value1`],
        resp3.data?.[1]?.[type]?.[0]?.[`Value2`]
      ].reduce((a, b) => a + (b || 0), 0) - 1).toFixed(2);

  const latestCSale = parseFloat(((resp.data?.[1]?.["Kết quả kinh doanh"]?.[0]?.[`Value2`] / resp2.data?.[1]?.["Kết quả kinh doanh"]?.[0]?.[`Value2`]) - 1).toFixed(2)) * 100 > 25 ?
  15 :
  parseFloat(((
    parseFloat(((resp.data?.[1]?.["Kết quả kinh doanh"]?.[0]?.[`Value2`] / resp2.data?.[1]?.["Kết quả kinh doanh"]?.[0]?.[`Value2`]) - 1).toFixed(2)) /
    0.25
  ) * 0.15).toFixed(2)) * 100;
  const latestPreviousCSale = parseFloat(((resp.data?.[1]?.["Kết quả kinh doanh"]?.[0]?.[`Value3`] / resp2.data?.[1]?.["Kết quả kinh doanh"]?.[0]?.[`Value3`]) - 1).toFixed(2)) * 100 > 25 ?
  10 :
  parseFloat(((
    parseFloat(((resp.data?.[1]?.["Kết quả kinh doanh"]?.[0]?.[`Value3`] / resp2.data?.[1]?.["Kết quả kinh doanh"]?.[0]?.[`Value3`]) - 1).toFixed(2)) /
    0.25
  ) * 0.1).toFixed(2)) * 100;
  const latestASale = (latestTraillingPercent("Kết quả kinh doanh") * 100) > 20 ?
  10 :
  parseFloat(((
    latestTraillingPercent("Kết quả kinh doanh") /
    0.2
  ) * 0.1).toFixed(2)) * 100;
  const previousLatestASale = (latestPreviousTraillingPercent("Kết quả kinh doanh") * 100) > 20 ?
  5 :
  parseFloat(((
    latestPreviousTraillingPercent("Kết quả kinh doanh") /
    0.2
  ) * 0.05).toFixed(2)) * 100;

  const latestCEps = parseFloat(((resp.data?.[1]?.["Chỉ số tài chính"]?.[0]?.[`Value2`] / resp2.data?.[1]?.["Chỉ số tài chính"]?.[0]?.[`Value2`]) - 1).toFixed(2)) * 100 > 25 ?
  20 :
  parseFloat(((
    parseFloat(((resp.data?.[1]?.["Chỉ số tài chính"]?.[0]?.[`Value2`] / resp2.data?.[1]?.["Chỉ số tài chính"]?.[0]?.[`Value2`]) - 1).toFixed(2)) /
    0.25
  ) * 0.2).toFixed(2)) * 100;
  const latestPreviousCEps = parseFloat(((resp.data?.[1]?.["Chỉ số tài chính"]?.[0]?.[`Value3`] / resp2.data?.[1]?.["Chỉ số tài chính"]?.[0]?.[`Value3`]) - 1).toFixed(2)) * 100 > 25 ?
  15 :
  parseFloat(((
    parseFloat(((resp.data?.[1]?.["Chỉ số tài chính"]?.[0]?.[`Value3`] / resp2.data?.[1]?.["Chỉ số tài chính"]?.[0]?.[`Value3`]) - 1).toFixed(2)) /
    0.25
  ) * 0.15).toFixed(2)) * 100;
  const latestAEps = (latestTraillingPercent("Chỉ số tài chính") * 100) > 20 ?
  15 :
  parseFloat(((
    latestTraillingPercent("Chỉ số tài chính") /
    0.2
  ) * 0.15).toFixed(2)) * 100;
  const previousLatestEps = ((latestPreviousTraillingPercent("Chỉ số tài chính")) * 100) > 20 ?
  10 :
  parseFloat(((
    latestPreviousTraillingPercent("Chỉ số tài chính") /
    0.2
  ) * 0.1).toFixed(2)) * 100;


  const result = {
    sales: {
      2021: {
        Q2: resp.data?.[1]?.["Kết quả kinh doanh"]?.[0]?.[`Value2`],
        Q1: resp.data?.[1]?.["Kết quả kinh doanh"]?.[0]?.[`Value3`],
      },
      2020: {
        Q4: resp.data?.[1]?.["Kết quả kinh doanh"]?.[0]?.[`Value4`],
        Q3: resp2.data?.[1]?.["Kết quả kinh doanh"]?.[0]?.[`Value1`],
        Q2: resp2.data?.[1]?.["Kết quả kinh doanh"]?.[0]?.[`Value2`],
        Q1: resp2.data?.[1]?.["Kết quả kinh doanh"]?.[0]?.[`Value3`],
      },
      2019: {
        Q4: resp2.data?.[1]?.["Kết quả kinh doanh"]?.[0]?.[`Value4`],
        Q3: resp3.data?.[1]?.["Kết quả kinh doanh"]?.[0]?.[`Value1`],
        Q2: resp3.data?.[1]?.["Kết quả kinh doanh"]?.[0]?.[`Value2`],
      },
      latestQuarter: {
        percent: parseFloat(((resp.data?.[1]?.["Kết quả kinh doanh"]?.[0]?.[`Value2`] / resp2.data?.[1]?.["Kết quả kinh doanh"]?.[0]?.[`Value2`]) - 1).toFixed(2)) * 100,
        reference: 25,
        proportion: 15,
        C: parseFloat(latestCSale).toFixed(2),
      },
      latestPreviousQuarter: {
        percent: parseFloat(((resp.data?.[1]?.["Kết quả kinh doanh"]?.[0]?.[`Value3`] / resp2.data?.[1]?.["Kết quả kinh doanh"]?.[0]?.[`Value3`]) - 1).toFixed(2)) * 100,
        reference: 25,
        proportion: 10,
        C: latestPreviousCSale.toFixed(2),
      },
      latestTrailling: {
        percent: latestTraillingPercent("Kết quả kinh doanh") * 100,
        reference: 20,
        proportion: 10,
        A: latestASale.toFixed(2)
      },
      latestPreviousTrailling: {
        percent: latestPreviousTraillingPercent("Kết quả kinh doanh") * 100,
        reference: 20,
        proportion: 5,
        A: previousLatestASale.toFixed(2)
      }
    },
    eps: {
      2021: {
        Q2: resp.data?.[1]?.["Chỉ số tài chính"]?.[0]?.[`Value2`],
        Q1: resp.data?.[1]?.["Chỉ số tài chính"]?.[0]?.[`Value3`],
      },
      2020: {
        Q4: resp.data?.[1]?.["Chỉ số tài chính"]?.[0]?.[`Value4`],
        Q3: resp2.data?.[1]?.["Chỉ số tài chính"]?.[0]?.[`Value1`],
        Q2: resp2.data?.[1]?.["Chỉ số tài chính"]?.[0]?.[`Value2`],
        Q1: resp2.data?.[1]?.["Chỉ số tài chính"]?.[0]?.[`Value3`],
      },
      2019: {
        Q4: resp2.data?.[1]?.["Chỉ số tài chính"]?.[0]?.[`Value4`],
        Q3: resp3.data?.[1]?.["Chỉ số tài chính"]?.[0]?.[`Value1`],
        Q2: resp3.data?.[1]?.["Chỉ số tài chính"]?.[0]?.[`Value2`],
      },
      latestQuarter: {
        percent: parseFloat(((resp.data?.[1]?.["Chỉ số tài chính"]?.[0]?.[`Value2`] / resp2.data?.[1]?.["Chỉ số tài chính"]?.[0]?.[`Value2`]) - 1).toFixed(2)) * 100,
        reference: 25,
        proportion: 20,
        C: latestCEps.toFixed(2)
      },
      latestPreviousQuarter: {
        percent: parseFloat(((resp.data?.[1]?.["Chỉ số tài chính"]?.[0]?.[`Value3`] / resp2.data?.[1]?.["Chỉ số tài chính"]?.[0]?.[`Value3`]) - 1).toFixed(2)) * 100,
        reference: 25,
        proportion: 15,
        C: latestPreviousCEps.toFixed(2)
      },
      latestTrailling: {
        percent: latestTraillingPercent("Chỉ số tài chính") * 100,
        reference: 20,
        proportion: 15,
        A: latestAEps.toFixed(2)
      },
      latestPreviousTrailling: {
        percent: latestPreviousTraillingPercent("Chỉ số tài chính") * 100,
        reference: 20,
        proportion: 10,
        A: previousLatestEps.toFixed(2)
      }
    },
    totalC: latestCSale + latestPreviousCSale + latestCEps + latestPreviousCEps,
    totalA: latestASale + previousLatestASale + latestAEps + previousLatestEps,
    total: latestCSale + latestPreviousCSale + latestASale + previousLatestASale + latestCEps + latestPreviousCEps + latestAEps + previousLatestEps
  }
  return result;
}

const getBalanceSheet = async (code) => {
  const resp = await axios.post("https://finance.vietstock.vn/data/financeinfo", getData(code, "CDKT", 1, 2), {
    headers: {
      "User-Agent": "abc",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "Cookie": `__RequestVerificationToken=${headerToken}`
    }
  });
  const resp2 = await axios.post("https://finance.vietstock.vn/data/financeinfo", getData(code, "CDKT", 2, 2), {
    headers: {
      "User-Agent": "abc",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "Cookie": `__RequestVerificationToken=${headerToken}`
    }
  });
  if (!resp?.data?.["1"]?.["Cân đối kế toán"]?.length && !resp2?.data?.["1"]?.["Cân đối kế toán"]?.length) return;
  return {
    header: {
      1: [
        ...resp?.data?.["0"]
      ],
      2: [
        ...resp2?.data?.["0"]
      ]
    },
    data: {
      1: [
        ...resp?.data?.["1"]?.["Cân đối kế toán"]
      ],
      2: [
        ...resp2?.data?.["1"]?.["Cân đối kế toán"]
      ]
    }
  }
}

// search company
module.exports.search = async (req, res) => {
  try {
    const { code } = req.params;
    const resp = await axios.get(`https://finance.vietstock.vn/search/${code}/3`, {
      headers: {
        "User-Agent": "abc",
      }
    });
    if (resp.data.code === 0) {
      const data = resp.data?.data ? resp.data?.data?.split(/\n/)?.map(item => ({
        code: item.split("|")?.[0],
        label: `${item.split("|")?.[1]} - ${item.split("|")?.[4]}`
      })) : []
      res.json({
        status: 1,
        message: "Thành công",
        data
      })
    }
  } catch (error) {
    console.log(error)
    res.json({
      status: 0,
      message: "Lỗi không xác định"
    })
  }
}

module.exports.index = async (req, res) => {
  try {
    const { code } = req.params;
    // transform data
    const result = await getIndicators(code)
    res.json({
      status: 1,
      message: "Thành công",
      data: {
        indicators: {
          indicators: result,
        },
      },
      // originalData: resp.data,
      // lc: resp2.data
    })
  } catch (error) {
    console.log(error)
    res.json({
      status: 0,
      message: "Lỗi không xác định"
    })
  }
}

// canslim
module.exports.canslim = async (req, res) => {
  try {
    const { code } = req.params;
    
    const result = await getCanslim(code)
    if (!result) {
      return res.json({
        status: 0,
        data: [],
        messange: "Không có data"
      })
    }
    res.json({
      status: 1,
      data: result
    })
  } catch (error) {
    console.log(error)
    res.json({
      status: 0,
      message: "Lỗi không xác định"
    })
  }
}

// filter 
module.exports.filter = async (req, res) => {
  try {
    const { codes } = req.query;
    const codesList = typeof codes === "string" ? [codes] : codes
    if (!codesList?.length) {
      return res.json({
        status: 0,
        message: "Thiếu mã doanh nghiệp"
      })
    }

    let fourM = [];
    let canslim = [];
    for (let code of codesList) {
      // 4M
      const companyName = code.split("__")[1];
      const companyCode = code.split("__")[0];
      const indicators = await getIndicators(companyCode);
      const fitedIndicator = indicators?.length <= 5 ? indicators : indicators.slice(-6)
      const calculatedData = [
        {
          id: "sales",
          totalComponentPoint: 0.15 * getComponentPoint(
            rate(1, null, -fitedIndicator[fitedIndicator?.length - 2]?.["sales"], fitedIndicator[fitedIndicator?.length - 1]?.["sales"]),
            rate(3, null, -fitedIndicator[fitedIndicator?.length - 4]?.["sales"], fitedIndicator[fitedIndicator?.length - 1]?.["sales"]),
            rate(5, null, -fitedIndicator[0]?.["sales"], fitedIndicator[fitedIndicator?.length - 1]?.["sales"]),
            0.2
          ),
        },
        {
          id: "eps",
          totalComponentPoint: 0.2 * getComponentPoint(
            rate(1, null, -fitedIndicator[fitedIndicator?.length - 2]?.["eps"], fitedIndicator[fitedIndicator?.length - 1]?.["eps"]),
            rate(3, null, -fitedIndicator[fitedIndicator?.length - 4]?.["eps"], fitedIndicator[fitedIndicator?.length - 1]?.["eps"]),
            rate(5, null, -fitedIndicator[0]?.["eps"], fitedIndicator[fitedIndicator?.length - 1]?.["eps"]),
            0.2
          ),
        },
        {
          id: "bvps",
          totalComponentPoint: 0.05 * getComponentPoint(
            rate(1, null, -fitedIndicator[fitedIndicator?.length - 2]?.["bvps"], fitedIndicator[fitedIndicator?.length - 1]?.["bvps"]),
            rate(3, null, -fitedIndicator[fitedIndicator?.length - 4]?.["bvps"], fitedIndicator[fitedIndicator?.length - 1]?.["bvps"]),
            rate(5, null, -fitedIndicator[0]?.["bvps"], fitedIndicator[fitedIndicator?.length - 1]?.["bvps"]),
            0.15
          ),
        },
        {
          id: "opc",
          totalComponentPoint: 0.15 * getComponentPoint(
            rate(1, null, -fitedIndicator[fitedIndicator?.length - 2]?.["opc"], fitedIndicator[fitedIndicator?.length - 1]?.["opc"]),
            rate(3, null, -fitedIndicator[fitedIndicator?.length - 4]?.["opc"], fitedIndicator[fitedIndicator?.length - 1]?.["opc"]),
            rate(5, null, -fitedIndicator[0]?.["opc"], fitedIndicator[fitedIndicator?.length - 1]?.["opc"]),
            0.15
          ),
        },
        {
          id: "effectiveness",
          totalComponentPoint: 0.05 * getComponentPoint(
            rate(1, null, -fitedIndicator[fitedIndicator?.length - 2]?.["effectiveness"], fitedIndicator[fitedIndicator?.length - 1]?.["effectiveness"]),
            rate(3, null, -fitedIndicator[fitedIndicator?.length - 4]?.["effectiveness"], fitedIndicator[fitedIndicator?.length - 1]?.["effectiveness"]),
            rate(5, null, -fitedIndicator[0]?.["effectiveness"], fitedIndicator[fitedIndicator?.length - 1]?.["effectiveness"]),
            0.1
          ),
        },
        {
          id: "efficiency",
          totalComponentPoint: 0.05 * getComponentPoint(
            rate(1, null, -fitedIndicator[fitedIndicator?.length - 2]?.["efficiency"], fitedIndicator[fitedIndicator?.length - 1]?.["efficiency"]),
            rate(3, null, -fitedIndicator[fitedIndicator?.length - 4]?.["efficiency"], fitedIndicator[fitedIndicator?.length - 1]?.["efficiency"]),
            rate(5, null, -fitedIndicator[0]?.["efficiency"], fitedIndicator[fitedIndicator?.length - 1]?.["efficiency"]),
            0.1
          ),
        },
        {
          id: "productivity",
          totalComponentPoint: 0.05 * getComponentPoint(
            rate(1, null, -fitedIndicator[fitedIndicator?.length - 2]?.["productivity"], fitedIndicator[fitedIndicator?.length - 1]?.["productivity"]),
            rate(3, null, -fitedIndicator[fitedIndicator?.length - 4]?.["productivity"], fitedIndicator[fitedIndicator?.length - 1]?.["productivity"]),
            rate(5, null, -fitedIndicator[0]?.["productivity"], fitedIndicator[fitedIndicator?.length - 1]?.["productivity"]),
            0.1
          ),
        },
        {
          id: "roa",
          totalComponentPoint: 0.1 * getComponentPoint(
            rate(1, null, -fitedIndicator[fitedIndicator?.length - 2]?.["roa"], fitedIndicator[fitedIndicator?.length - 1]?.["roa"]),
            rate(3, null, -fitedIndicator[fitedIndicator?.length - 4]?.["roa"], fitedIndicator[fitedIndicator?.length - 1]?.["roa"]),
            rate(5, null, -fitedIndicator[0]?.["roa"], fitedIndicator[fitedIndicator?.length - 1]?.["roa"]),
            0.15
          ),
        },
        {
          id: "roe",
          totalComponentPoint: 0.05 * getComponentPoint(
            rate(1, null, -fitedIndicator[fitedIndicator?.length - 2]?.["roe"], fitedIndicator[fitedIndicator?.length - 1]?.["roe"]),
            rate(3, null, -fitedIndicator[fitedIndicator?.length - 4]?.["roe"], fitedIndicator[fitedIndicator?.length - 1]?.["roe"]),
            rate(5, null, -fitedIndicator[0]?.["roe"], fitedIndicator[fitedIndicator?.length - 1]?.["roe"]),
            0.2
          ),
        },
        {
          id: "roic",
          totalComponentPoint: 0.15 * getComponentPoint(
            rate(1, null, -fitedIndicator[fitedIndicator?.length - 2]?.["roic"], fitedIndicator[fitedIndicator?.length - 1]?.["roic"]),
            rate(3, null, -fitedIndicator[fitedIndicator?.length - 4]?.["roic"], fitedIndicator[fitedIndicator?.length - 1]?.["roic"]),
            rate(5, null, -fitedIndicator[0]?.["roic"], fitedIndicator[fitedIndicator?.length - 1]?.["roic"]),
            0.15
          ),
        },
      ]
      const totalPoint = (
        0.1 * (
        fitedIndicator?.[0]?.["lastYearLongTermDebt"] < (3 * fitedIndicator?.[0]?.["lastYearProfit"]) ?
        100 : 0) +
        calculatedData.reduce((a, b) => a +( b.totalComponentPoint || 0), 0)
      )?.toFixed(2)
      fourM = [
        ...fourM,
        {
          id: companyCode,
          name: companyName,
          value: totalPoint ? parseFloat(totalPoint) : 0
        }
      ]

      // canslim 
      const totalCanslimPoint = await getCanslim(companyCode);
      canslim = [
        ...canslim,
        {
          id: companyCode,
          name: companyName,
          value: totalCanslimPoint ? parseFloat(totalCanslimPoint.total) : 0
        }
      ]
    }
    
    res.json({
      status: 1,
      data: {
        fourM: fourM.sort((a, b) => b.value - a.value),
        canslim: canslim.sort((a, b) => b.value - a.value)
      }
    })
  } catch (error) {
    console.log(error)
    res.json({
      status: 0,
      message: "Lỗi không xác định"
    })
  }
} 

// balance sheel
module.exports.balanceSheet = async (req, res) => {
  try {
    const { code } = req.params;
    const result = await getBalanceSheet(code);
    if (!result) {
      return res.json({
        status: 0,
        data: [],
        messange: "Không có data"
      })
    }
    res.json({
      status: 1,
      data: result
    })
  } catch (error) {
    console.log(error)
    res.json({
      status: 0,
      message: "Lỗi không xác định"
    })
  }
}