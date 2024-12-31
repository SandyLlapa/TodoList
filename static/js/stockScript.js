var stocks = new Stocks('AMNNR2XNBK2OJML4'); // replace XXXX with your API Key

document.getElementById("stock-form").addEventListener('submit',async function(event){
  event.preventDefault();
  
  const ticker = document.getElementById('ticker').value;

  try{
    const result = await stocks.timeSeries({ symbol:ticker, interval:'1min', amount:10});
    document.getElementById('output').value=JSON.stringify(result,null,2);

  }
  catch (error) {
    alert("Error fetching stock data:" + error);
  }
});