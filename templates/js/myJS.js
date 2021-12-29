var stockTypeIndUpdate = false;
var updateTypeIndTimer;//3s
var showUpdateTimes = 0;
var updatePeriod = 5000;
var allDate = [31,28,31,30,31,30,31,31,30,31,30,31];
var allDateSpecial = [31,29,31,30,31,30,31,31,30,31,30,31];

function onLoadFun(){
    //request to python to get markets data (5s update)
    getMarketsData();//ajax

    //set today in markets
    setDate();

    //set color change in stocks type indicator change and market indicator change
    changeFontColor();

    //draw stocks type indicator histogram
    drawStocksTypeHist();
    updateMyBarChart();
    //Chart.defaults.global.defaultFontColor = "white";

   // updateStocksTypeData();//ajax

}
$( "#testUpdate" ).click(function() {
    if(stockTypeIndUpdate){
        stockTypeIndUpdate=false;
        $('#testUpdate').val("update now : off");
        clearTimeout(updateTypeIndTimer);
    }else{
        stockTypeIndUpdate=true;
        updateTypeIndTimer = setInterval(updateStocksTypeData, updatePeriod);
        $('#testUpdate').val("update now : on");
    }
});
$("#UpdateHistBtn").click(function() {
    drawStocksTypeHist();
    updateMyBarChart();
});

function changeFontColor(){
// 類股全部表格
    var table=document.getElementById('typeIndictorTblBody');
    var array = table.getElementsByTagName("tr");//所有tr
    for(var i = 0; i < array.length; i++ ) {
        if(parseFloat(table.rows[i].cells[4].innerHTML)>0){
            table.rows[i].cells[3].style.color = "pink";
            table.rows[i].cells[4].style.color = "pink";
            table.rows[i].cells[2].style.color = "pink";
        }else{
           table.rows[i].cells[3].style.color = "Lime";
           table.rows[i].cells[4].style.color = "Lime";
           table.rows[i].cells[2].style.color = "Lime";
        }
    }
    //大盤指數
    var marketsInd=document.getElementById('marketsInd');
    //console.log(parseFloat(marketsInd.rows[1].cells[1].innerHTML));
    if (parseFloat(marketsInd.rows[1].cells[3].innerHTML)>0){
        marketsInd.rows[1].cells[1].style.color = "pink";
        marketsInd.rows[2].cells[3].style.color = "pink";
        marketsInd.rows[2].cells[1].style.color = "pink";
        marketsInd.rows[3].cells[1].style.color = "pink";
        marketsInd.rows[4].cells[1].style.color = "pink";
    }else{
        marketsInd.rows[1].cells[1].style.color = "Lime";
        marketsInd.rows[2].cells[3].style.color = "Lime";
        marketsInd.rows[2].cells[1].style.color = "Lime";
        marketsInd.rows[3].cells[1].style.color = "Lime";
        marketsInd.rows[4].cells[1].style.color = "Lime";
    }
}

function drawStocksTypeHist(){
    var table=document.getElementById('typeIndictorTblBody');
    var array = table.getElementsByTagName("tr");//所有tr
    var n = array.length;
    if ($("#stocksTypeHist").length) {
        myCtxBar = document.getElementById("stocksTypeHist").getContext("2d");
        myOptionsBar = {
          responsive: true,
          scales: {
            yAxes: [
              {
                barPercentage: 0.2,
                ticks: {
                  beginAtZero: true
                },
                scaleLabel: {
                  display: true,
                  labelString: "Hits"
                }
              }
            ]
          }
        };
        temp = getColumn("typeIndictorTblBody",4,true);
        myColor = [];
        for( i = 0 ; i<temp.length;i++){
            if(temp[i]>0){
                myColor[i]="red";
            }else{
                myColor[i]="green";
            }

        }
        myOptionsBar.maintainAspectRatio =$(window).width() < width_threshold ? false : true;
        myConfigBar = {
          type: "bar",
          data: {
            labels: getColumn("typeIndictorTblBody",0,false),
            datasets: [
              {
                data: getColumn("typeIndictorTblBody",4,true),
                borderWidth: 0,
                backgroundColor : myColor
              }
            ]
          },
          options: myOptionsBar
        };
        myBarChart = new Chart(myCtxBar, myConfigBar);
      }
}

function updateMyBarChart() {
  if (myBarChart) {
    myBarChart.options = myOptionsBar;
    myBarChart.update();
  }
}
function getColumn(table_id, col,isFloat) {
    var tab = document.getElementById(table_id);
    var n = tab.rows.length;
    var i, s = null, tr, td;
    var arr = [];
    // First check that col is not less then 0
    if (col < 0) {
        return null;
    }

    for (i = 0; i < n; i++) {
        tr = tab.rows[i];
        if (tr.cells.length > col) {
            if (isFloat)
                 arr.push(parseFloat(tr.cells[col].innerText));
            else
                 arr.push(tr.cells[col].innerText);
        }
    }
    return arr;
}
function updateStocksTypeData(){
    $( "#updateTimes" ).html("update follow data "+showUpdateTimes+" times.");
    showUpdateTimes++;
    console.log("in testAjax : "+showUpdateTimes);
    /*$.ajax({
        url:"/aaa/",
        type:'POST',
        tradition:true,
        data:{data:JSON.stringify(data_list)},
        success: function (arg) { //如果程式執行成功就會執行這裡的函式
            var callback_dic = $.parseJSON(arg);
            if(callback_dic.status){
                console.log("Success in testAjax");
                console.log(callback_dic);
             }else{
                console.log("ERROR in testAjax : "+String(callback_dic.error)); //把錯誤的資訊從後臺提出展示出來
            }
        }
    });*/
    $.post("/updataStocksType/", { "data":"whatever" },
       function(serverResponse){
          var table=document.getElementById('typeIndictorTblBody');
          console.log("SUCCESS in stocks type indictor data");
          //console.log("Data Loaded: " + data);
          myResponse = JSON.parse(serverResponse);
          myTableData = myResponse["data"];
          //console.log(myTableData);
          //console.log("================");
          myTableData = JSON.parse(myTableData);
          var cell = 0;
          for( col in myTableData){
            var row=0;
            for(value in myTableData[col]){
                //console.log("value : "+myTableData[col][value]);
                //console.log("reference : "+table.rows[row].cells[cell].innerText);
                table.rows[row].cells[cell].innerText = myTableData[col][value];
                row++;
                changeFontColor();
            }
            cell++;
          }
   });
}
function setDate(){
    var today = new Date();
    var nowd = String(today.getDate()).padStart(2, '0');
    var nowm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var nowy = today.getFullYear();
    for(i=nowy-20;i<=nowy;i++){
        $('#marketsYear').append(new Option(i, i));
     }
    for(i=1;i<=12;i++){
        $('#marketsMonth').append(new Option(i, i));
    }
    //set today
    $('#marketsYear option[value='+nowy+']').attr('selected','selected');
    $('#marketsMonth option[value='+parseInt(nowm)+']').attr('selected','selected');
    dateChange();
    $('#marketsDate option[value='+parseInt(nowd)+']').attr('selected','selected');
}
function dateChange(){
    var y = $( "#marketsYear option:selected" ).text();
    var m = $( "#marketsMonth option:selected" ).text();
    $('#marketsDate').empty();
    var thisMonth =  ((isSpecialYear(y)) ? allDateSpecial[m-1] : allDate[m-1]);
    for(i=1;i<=thisMonth;i++){
        $('#marketsDate').append(new Option(i, i));
    }
}
function isSpecialYear(year){
    year = parseInt(year);
    if(year%4==0){
        if(year%100!=0){
            return(true)
        }else{
            if(year%400==0){
                return(true)
            }else{
                return(false)
            }
        }
    }else{
        return (false)
    }
}
function getMarketsData(){
    var y = $( "#marketsYear option:selected" ).text();
    if(parseInt($( "#marketsMonth option:selected" ).text())<10){
        var m = "0"+$( "#marketsMonth option:selected" ).text();
    }else{
       var  m=$( "#marketsMonth option:selected" ).text();
    }
    if(parseInt($( "#marketsDate option:selected" ).text())<10){
       var  d = "0"+$( "#marketsDate option:selected" ).text();
    }else{
        var d=$( "#marketsDate option:selected" ).text();
    }

    $.post("/getMarketsData/", { "data":y+m+d },
       function(serverResponse){
          console.log("SUCCESS in getMarketsData");
          var myResponse = JSON.parse(serverResponse);
          var marketsData = myResponse["data"];
          var std = myResponse["std"];
          var mean = myResponse["mean"];
          marketsData = JSON.parse(marketsData);
          var n = Object.keys(marketsData[0]).length;
          //console.log("marketsData :"+marketsData[0][12]);
          var timeArray = new Array(n);
          var IndArray = new Array(n);
           for(i=0;i<n;i++){
                timeArray[i] = marketsData[0][i];
           }
           for(i=0;i<n;i++){
                IndArray[i] = marketsData[1][i];
           }
           //console.log(IndArray);
           drawMarketsLine(timeArray,IndArray,mean,std);
           updateLineChart();
   });
}
function drawMarketsLine(myLabel,myData,mean,std){
    var stat = 3;
    if ($("#myLineChart").length) {
    myCtxLine = document.getElementById("myLineChart").getContext("2d");
    if(mean <= myData[0]){
         var lowerBound = mean-stat*std;
         var upperBound = myData[0]+stat*std;
    }else{
        var lowerBound = myData[0]-stat*std;
        var upperBound = mean+stat*std;
    }
    startData = new Array(myData.length);
    myColor = new Array(myData.length);
    for(i=0;i<myData.length;i++){
        startData[i] = myData[0];
        if(myData[i]<myData[0]){
            myColor[i]="Lime";
        }else{
            myColor[i]="red";
        }
    }

    myOptionsLine = {
       scales: {
            yAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: "Hits"
                },
               ticks: {
                        beginAtZero: false,
                        min:lowerBound,
                        stepSize:std,
                        max:upperBound
                    },
            }],
            xAxes: [{
               ticks: {
                        beginAtZero: true,
                        min:0,
                        stepSize:10,
                        max:3500
                    },
            }]
        }
    };

    // Set aspect ratio based on window width
    myOptionsLine.maintainAspectRatio =
      $(window).width() < width_threshold ? false : true;


    console.log(myData);
    myConfigLine = {
      type: "line",
      data: {
        labels: myLabel,//mylabel
        datasets: [
          {
            label: "大盤指數",
            data: myData,
            fill: {
                target:{value: myData[0]},
                above: "rgba(255,0,0,0.5)",   // Area will be red above the origin
                below: '	rgb(50,205,50,0.5)'    // And blue below the origin
              },
            borderColor: "black",
            pointRadius: 0,
            borderWidth:0.5,
            backgroundColor: 'Lime'
          },{
            label: "開盤",
            fill:"-1",
            data: startData,
            borderColor: "white",
            pointRadius: 0,
            borderWidth:0.5
          }
        ]
      },
      options: myOptionsLine
    };

    myLineChart = new Chart(myCtxLine, myConfigLine);
  }
}
function updateLineChart() {
  if (myLineChart) {
    myLineChart.options = myOptionsLine;
    myLineChart.update();
  }
}