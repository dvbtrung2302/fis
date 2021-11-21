const axios = require("axios");

const headerToken = "-Z52PS_eA8YUQ11dH7n9YfmO-nK8VKE4PMzfsJLHn6c6FU65SH1qYIYGXEFksCfyGvonsskmsDy21fI5zbt2NwCZEPbN0ygDEyOSWT9onN41";
const dataToken = "iEQmMIOsEDDTeZwtew0TX1UjMQvIQ00lEj3GigfpbpEXE6ryLUuMsoAlfHa_BI0Cu74rFB1tV-NT_zQ3v56DvQQJYFeBFXBeey-QMNhuOTA1";

const getData = (code, type, page) => {
  return `Code=${code}&ReportType=${type}&ReportTermType=1&Unit=1000000000&Page=${page}&PageSize=4&__RequestVerificationToken=${dataToken}`
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
