//--初期化--//
function initializeCS(){
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0,0,350,400);

  ctx.fillStyle = "#000000";
  ctx.fillRect(197.5,0,5,400);
  ctx.fillRect(0,0,350,40);
  ctx.fillRect(0,360,350,40);

  ctx.fillStyle = "#D8D8D8";
  for(var i = 0; i < 6; i++){
    ctx.fillRect(36.5 + 25 * i,50,1,300);
  }
  for(var j = 0; j < 7; j++){
    if(j % 2 == 1){
      ctx.fillStyle = "#0000FF";
    }else{
      ctx.fillStyle = "#3366FF";
    }
    ctx.fillRect(12.5,87 + 37.5 * j,175,1);
  }

  ctx.fillStyle = "#000000";
  ctx.strokeRect(12.5,50,175,300);

  ctx.font = "18px 'Arial'";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "left";
  ctx.fillText("Chapter:",210,70);
  ctx.fillText("Page:",210,100);
  ctx.fillText("Interval:",210,130);
  ctx.fillText("Fix:",210,170)
  ctx.fillText("BPM:",210,200);
  ctx.fillText("FirstNum:",210,230);

  //テキストボックスの生成
  var canvasParent = document.getElementById("canvasParent");
  var t1 = document.createElement("textarea");
  t1.name = "textbox";
  t1.rows = 1;
  t1.cols = 5;
  t1.maxLength = 7;
  var t2 = t1.cloneNode();
  t1.className = "bpm";
  t2.className = "firstNum";
  canvasParent.appendChild(t1);
  canvasParent.appendChild(t2);
}

//--メイン--//
function createScore(audio,saveD,infoD2,nowPage){
  initializeCS();
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  var layer1 = document.getElementById("layer1");
  var l1 = layer1.getContext("2d");
  var layer2 = document.getElementById("layer2");
  layer2.setAttribute("tabindex",0);
  var l2 = layer2.getContext("2d");

  var side = [12.5,37.5,62.5,87.5,112.5,137.5,162.5]; //ノーツの横位置
  var intervalArray = [24,12,6,8,4,2,3]; //192分割
  var intervalString = ["1/4","1/8","1/16","1/12","1/24","1/48","1/32"];
  var keyCode = [83,68,70,71,74,75,76]; //S,D,F,G,J,K,L (D+E,G+H,K+I)
  var intervalCode = [49,50,51,52,53,54,55]; //1,2,3,4,5,6
  var size = [24,5];

  var chapter = 1;
  var page = nowPage;
  var maxPage = 400; //最大ページ数
  var pos = 0; //現在位置(0 - 47)
  var locate = function(x){return 350 - 300 * x / 192};
  var interval = 24; //移動幅(24,12,6,8,4,2,3)
  var fixedText = ["OFF","ON"];
  var fixed = 0; //0 = OFF, 1 = ON
  var mp = ""; //曲の再生状態の管理

  var textbox = document.getElementsByName("textbox");
  for(var i = 0; i < textbox.length; i++){
    textbox[i].style.zIndex = 3;
  }

  var keyType = 7;
  var emp2d = create2d(keyType);
  var mdf = sessionStorage.modify;
  if(mdf >= 2 && (saveD === "" || saveD === emp2d)){
    var pack = JSON.parse(sessionStorage.pack);
    if(!audio){
      audio = new Audio();
      audio.src = "./music/" + zeroPadding(pack.id,6) + ".mp3";
      audio.load();
    }
    var req = new XMLHttpRequest();
    var url = "./data/" + zeroPadding(pack.id,6) + ".txt";
    req.open("GET",url,false);
    req.send("");
    var txt = req.responseText;
    var saveData = fileCheck(txt,"&jsonPosData=","&");
    var infoData2 = fileCheck(txt,"&jsonInfoData2=","&");
  }else{
    var saveData = saveD;
    var infoData2 = infoD2;
  }

  var data = posLoad(saveData,maxPage);
  var pageData = data[page - 1]; //今のページ(2次元配列)
  var infoData = create2d(maxPage);//チャプターとBPM,firstNumの管理(2次元配列)
  var c = 0 //chapter
  for(var i = 0; i < maxPage; i++){
    var len = infoData2.length;
    if(c != len - 1 && infoData2[c + 1][0] == i + 1){
      c++;
    }
    infoData[i].push(c + 1);
    infoData[i].push(infoData2[c][1]);
    infoData[i].push(infoData2[c][2]);
  }

  var bpm = 0;
  var firstNum = 0;
  var empty2d = create2d(keyType); //空の2次元配列
  changePage(page);

  var clip = "";
  var nowGrid = new grid();
  nowGrid.zero();

  function notes(flag,n,pos){
    if(flag){
      var color = "#FF0000";
      switch(n){
        case 0:
        case 6:
        color = "#FFFFFF";
        break;

        case 1:
        case 5:
        color = "#FFFF00";
        break;

        case 2:
        case 4:
        color = "#008000";
        break;

        default:
        break;
      };
      l2.fillStyle = color;
      l2.fillRect(side[n],locate(pos) - 2.5,size[0],size[1]);
    }else{
      l2.clearRect(side[n],locate(pos) - 3.5,size[0] + 1,size[1] + 2);
    }
  }

  function pushKey(n){
    var len = pageData[n].length;
    if(len == 0){
      pageData[n].push(pos);
      notes(true,n,pos); //ノーツ挿入
    }else{
      var i = 0;
      while(pageData[n][i] < pos){
        i++;
        if(i == len) break;
      }
      if(pageData[n][i] == pos){
        pageData[n].splice(i,1);
        notes(false,n,pos); //ノーツ削除
      }else{
        pageData[n].splice(i,0,pos);
        notes(true,n,pos); //ノーツ挿入
      }
    }
    data[page - 1] = pageData; //全体データにセーブ
    load(page);
  }

  function displayInfo(){
    l2.clearRect(0,0,350,40);
    l2.clearRect(202.5,40,147.5,150);
    l2.font = "18px 'Arial'";
    l2.fillStyle = "#FFFFFF";
    l2.textAlign = "center";
    var d = 317.5;
    l2.fillText(chapter,d,70);
    l2.fillText(page,d,100);
    l2.fillText(intervalString[intervalArray.indexOf(interval)],d,130);
    if(fixed == 1) l2.fillStyle = "#FF0000";
    l2.fillText(fixedText[fixed],d,170);
    textbox[0].value = infoData[page - 1][1];
    textbox[1].value = infoData[page - 1][2];
    bpm = Number(textbox[0].value);
    firstNum = Number(textbox[1].value);
  }

  function load(pg){
    l2.clearRect(10,45,180,310);
    pageData = data[pg - 1];
    for(var i = 0; i < keyType; i++){
      var len = pageData[i].length;
      if(len != 0){
        for(var j = 0; j < len; j++){
          notes(true,i,pageData[i][j]);
        }
      }
    }
  }

  function changePage(pg){
    if(pg < 1) page = 1;
    else if(pg > maxPage) page = maxPage;
    else{
      page = pg;
      load(pg);
    }
    chapter = infoData[page - 1][0];
    if(page != 1){
      if(page != maxPage && infoData[page - 1][0] - infoData[page - 2][0] == 1){
        fixed = 1;
      }else{
        fixed = 0;
      }
    }else{
      fixed = 0;
    }
    displayInfo();

    if(mp){
      mp.stop();
      mp = new musicPlay();
      mp.start();
    }
  }

  function grid(){
    function makeGrid(pos){
      l1.fillStyle = "#FF0000"
      l1.fillRect(12.5,locate(pos) - 0.5,175,1);
    }
    function deleteGrid(pos){
      l1.clearRect(12.5,locate(pos) - 1.5,176,3);
    }

    this.zero = function(){
      deleteGrid(pos);
      makeGrid(0);
      pos = 0;
    }

    this.up = function(){
      deleteGrid(pos);
      pos += interval;
      if(pos >= 192){
        if(page != maxPage){
          pos -= 192;
          changePage(++page);
        }else{
          pos -= interval;
        }
      }
      makeGrid(pos);
    }

    this.down = function(){
      deleteGrid(pos);
      pos -= interval;
      if(pos < 0){
        if(page != 1){
          pos += 192;
          changePage(--page);
        }else{
          pos += interval;
        }
      }
      makeGrid(pos);
    }

    this.floor = function(){
      deleteGrid(pos);
      pos = Math.floor(pos / interval) * interval;
      makeGrid(pos);
    }
  }

  function changeInterval(n){
    interval = intervalArray[n];
    var lineNum = 192 / interval;

    ctx.clearRect(10,45,180,310);
    ctx.fillStyle = "#D8D8D8";
    for(var i = 0; i < 6; i++){
      ctx.fillRect(36.5 + 25 * i,50,1,300);
    }
    for(var i = 1; i < lineNum; i++){
      var mod = (i * interval) % 48;
      if(mod == 0){
        ctx.fillStyle = "#0000FF";
      }else if(mod == 24){
        ctx.fillStyle = "#3366FF";
      }else{
        ctx.fillStyle = "#D8D8D8";
      }
      ctx.fillRect(12.5,locate(interval * i) - 0.5,175,1);
    }
    ctx.fillStyle = "#000000";
    ctx.strokeRect(12.5,50,175,300);

    nowGrid.floor();
    displayInfo();
  }

  function musicPlay(){
    var startPage = infoData2[chapter - 1][0];
    var num = firstNum + (page - startPage) * 28800 / bpm; //[F]
    var second = num / 60 - 1; //[s],1秒前から再生
    var length = 480000 / bpm; //[ms]
    var startTime = 0;
    var width = 175; //横幅
    var requestId = "";
    var timer = "";
    var waitTimer = "";
    var extraTimer = "";

    this.start = function(){
      waitTimer = setTimeout(function(){
        startTime = getTime();
        loop();
      },1000);

      timer = setInterval(function(){
        audio.pause();
        playRug();
        l1.clearRect(12,45,width + 2,360);
        waitTimer = setTimeout(function(){
          startTime = getTime();
          loop();
        },1000);
      },length + 1000);

      playRug();

      function loop(){
        requestId = window.requestAnimationFrame(loop);
        var lastTime = getTime();
        var locate = 350 - 300 * (lastTime - startTime) / length;
        l1.clearRect(12,locate-5,width + 2,360 - locate);
        l1.fillStyle = "#00FF00";
        l1.fillRect(12.5,locate-0.5,width,1);
        if(locate < 50){
          window.cancelAnimationFrame(requestId);
          l1.clearRect(12,45,width + 2,360);
        }
        nowGrid.floor();
      }

      function playRug(){
        if(second > 0){
          audio.currentTime = second;
          audio.play();
        }else{
          extraTimer = setTimeout(function(){
            audio.currentTime = 0;
            audio.play();
          },-second * 1000);
        }
      }
    }

    this.stop = function(){
      clearInterval(timer);
      clearTimeout(waitTimer);
      clearTimeout(extraTimer);
      window.cancelAnimationFrame(requestId);
      l1.clearRect(12,45,width + 2,360);
      audio.pause();
      nowGrid.floor();
    }
  }

  function changeInfo(){
    var numberReg = /^[0-9]*\.?[0-9]*$/;
    if(numberReg.test(textbox[0].value) && Number(textbox[0].value) != 0){
      bpm = Number(textbox[0].value);
      infoData2[chapter - 1][1] = bpm;
    }else{
      textbox[0].value = bpm;
    }
    if(numberReg.test(textbox[1].value)){
      firstNum = Number(textbox[1].value);
      infoData2[chapter - 1][2] = firstNum;
    }else{
      textbox[1].value = firstNum;
    }
    for(var j = 0; j < maxPage; j++){
      if(infoData[j][0] < chapter) continue;
      else if(infoData[j][0] == chapter){
        infoData[j][1] = bpm;
        infoData[j][2] = firstNum;
      }else break;
    }
    displayInfo();
  }

  function fixedSwitch(){
    if(page != 1){
      if(fixed == 0){
        fixed = 1;
        infoData2.splice(chapter,0,[page,bpm,firstNum]);
        var term = infoData2[chapter][0] - infoData2[chapter - 1][0]; //前セクションのページ数
        var newNum = 28800 * term / Number(infoData2[chapter - 1][1]) + Number(infoData2[chapter - 1][2]);
        var nN1 = Number(newNum.toFixed(1));
        textbox[1].value = nN1; //単位:F
        firstNum = nN1;
        infoData2[chapter][2] = firstNum;
        chapter++;
        for(var i = 0; i < maxPage - page + 1; i++){
          infoData[page + i - 1][0]++;
        }

      }else{
        fixed = 0;
        chapter--;
        infoData2.splice(chapter,1);
        bpm = infoData2[chapter - 1][1];
        firstNum = infoData2[chapter - 1][2];
        for(var i = 0; i < maxPage - page + 1; i++){
          infoData[page + i - 1][0]--;
        }
      }
      for(var j = 0; j < maxPage; j++){
        if(infoData[j][0] < chapter) continue;
        else if(infoData[j][0] == chapter){
          infoData[j][1] = bpm;
          infoData[j][2] = firstNum;
        }else break;
      }

      displayInfo();
    }
  }

  button1 = canvasButton(205,245,70,20);  //change
  button1.style.backgroundColor = "transparent";
    l2.font = "18px 'Arial'";
    l2.fillStyle = "#FFFFFF";
    l2.textAlign = "center";
    l2.fillText("Change",245,260);
  button1.onmouseover = function(){
    button1.style.backgroundColor = "transparent";
    l2.clearRect(205,245,70,25);
    l2.font = "18px 'Arial'";
    l2.fillStyle = "#FFFF00";
    l2.textAlign = "center";
    l2.fillText("Change",245,260);
  }
  button1.onmouseout = function(){
    button1.style.backgroundColor = "transparent";
    l2.clearRect(205,245,70,25);
    l2.font = "18px 'Arial'";
    l2.fillStyle = "#FFFFFF";
    l2.textAlign = "center";
    l2.fillText("Change",245,260);
  }
  button1.onclick = function(){
    changeInfo();
    l2.clearRect(0,0,350,40);
    l2.fillStyle = "#FFFFFF";
    l2.textAlign = "center";
    l2.font = "18px 'Arial'";
    l2.fillText("Change",175,32);
  }

  button2 = canvasButton(280,245,70,20); //save
  button2.style.backgroundColor = "transparent";
    l2.font = "18px 'Arial'";
    l2.fillStyle = "#FFFFFF";
    l2.textAlign = "center";
    l2.fillText("Save",315,260);
  button2.onmouseover = function(){
    button2.style.backgroundColor = "transparent";
    l2.clearRect(280,245,70,25);
    l2.font = "18px 'Arial'";
    l2.fillStyle = "#FFFF00";
    l2.textAlign = "center";
    l2.fillText("Save",315,260);
  }
  button2.onmouseout = function(){
    button2.style.backgroundColor = "transparent";
    l2.clearRect(280,245,70,25);
    l2.font = "18px 'Arial'";
    l2.fillStyle = "#FFFFFF";
    l2.textAlign = "center";
    l2.fillText("Save",315,260);
  }
  button2.onclick = function(){
    var frameData = posToFrame(data,infoData2);
    var saveData = posSave(data);
    outputData(saveData,infoData2);
    l2.clearRect(0,0,350,40);
    l2.fillStyle = "#FFFFFF";
    l2.textAlign = "center";
    l2.font = "18px 'Arial'";
    l2.fillText("Save",175,32);
  }

  button3 = canvasButton(290,155,55,15); //fixed
  button3.style.backgroundColor = "transparent";
  button3.onmouseover = function(){
    button3.style.backgroundColor = "transparent";
    l2.clearRect(290,155,55,15);
    l2.font = "18px 'Arial'";
    l2.fillStyle = "#FFFF00";
    l2.textAlign = "center";
    l2.fillText(fixedText[fixed],317.5,170);
  }
  button3.onmouseout = function(){
    button3.style.backgroundColor = "transparent";
    l2.clearRect(290,155,55,15);
    l2.font = "18px 'Arial'";
    l2.fillStyle = "#FFFFFF";
    l2.textAlign = "center";
    l2.fillText(fixedText[fixed],317.5,170);
  }
  button3.onclick = function(){
    fixedSwitch();
  }

  button4 = canvasButton(0,360,175,40); //back
  button4.innerHTML = "Back";
  button4.style.backgroundColor = "#000000";
  button4.style.color = "#FFFFFF";
  button4.style.font = "20px 'Arial'";
  button4.onmouseover = function(){
    button4.style.backgroundColor = "#FF0000";
  }
  button4.onmouseout = function(){
    button4.style.backgroundColor = "#000000";
  }
  button4.onclick = function(){
    var answer = confirm("Current data is deleted if you return.\nAre you sure you want to return?");
    if(answer){
      cancelAllCreate();
      layer2.removeEventListener("keydown",kdevent2,false);
      if(mdf == 2) modify();
      else prepare();
    }
  }

  button5 = canvasButton(175,360,175,40);
  button5.innerHTML = "Test";
  button5.style.backgroundColor = "#000000";
  button5.style.color = "#FFFFFF";
  button5.style.font = "20px 'Arial'";
  button5.onmouseover = function(){
    button5.style.backgroundColor = "#008000";
  }
  button5.onmouseout = function(){
    button5.style.backgroundColor = "#000000";
  }
  button5.onclick = function(){
    var frameData = posToFrame(data,infoData2);
    var saveData = posSave(data);
    var detail = [Number(s1.value),0,Number(s2.value)];
    localStorage.detail = detail;
    var difficulty = calculateNotes(data,infoData2);
    if(difficulty[0] != 0){
      cancelAllCreate();
      layer2.removeEventListener("keydown",kdevent2,false);
      testPlay(audio,frameData,saveData,infoData2,page);
    }
  }

  var canvasParent = document.getElementById("canvasParent");
  var detail = JSON.parse("[" + localStorage.detail + "]");
  var s1 = document.createElement("input"); //speed
  s1.className = "slider";
  s1.type = "range";
  s1.step = 1;
  var s2 = s1.cloneNode(); //fadein
  s1.min = 1;
  s1.max = 10;
  s1.value = detail[0];
  s1.style.top = "295px";
  s2.min = 0;
  s2.max = 19;
  s2.value = detail[2];
  s2.style.top = "330px";
  canvasParent.appendChild(s1);
  canvasParent.appendChild(s2);

  function displayDetail(){
    return function(){
      l2.font = "18px 'Arial'";
      l2.fillStyle = "#FFFFFF";
      l2.textAlign = "center";
      l2.clearRect(210,275,140,70);
      l2.fillText("Speed: " + s1.value,275,295);
      l2.fillText("Fadein: " + s2.value * 5 + "%",275,330);
    }
  }
  (displayDetail())();
  s1.onchange = displayDetail();
  s2.onchange = displayDetail();

  function cancelAllCreate(){
    canvasParent.removeChild(textbox[0]);
    canvasParent.removeChild(textbox[0]);
    canvasParent.removeChild(button1);
    canvasParent.removeChild(button2);
    canvasParent.removeChild(button3);
    canvasParent.removeChild(button4);
    canvasParent.removeChild(button5);
    canvasParent.removeChild(s1);
    canvasParent.removeChild(s2);
    if(mp){
      mp.stop();
      mp = "";
    }
    ctx.clearRect(0,0,350,400);
    l1.clearRect(0,0,350,400);
    l2.clearRect(0,0,350,400);
  }

  function kdevent(){
    return function f(e){
      var code = e.keyCode;
      var n = 0;

      if(code == 27){ //delete,Esc
        var answer = confirm("Current data is deleted if you return.\nAre you sure you want to return?");
        if(answer){
          cancelAllCreate();
          layer2.removeEventListener("keydown",f,false);
          if(mdf == 2) modify();
          else prepare();
        }
      }else if(code == 46){ //Delete
        for(var i = 0; i < keyType; i++){
          if(pageData[i].indexOf(pos) >= 0){
            pushKey(i);
          }
        }
      }else if(code == 32){ //Space
        nowGrid.up();
      }else if(code == 66){ //B
        nowGrid.up();
      }else if(code == 78){ //N
        nowGrid.down();
      }else if(code == 38){ //Up
        if(e.shiftKey){
          for(var i = 0; i < keyType; i++){
            var len = pageData[i].length;
            if(len != 0){
              for(var j = 0; j < len; j++){
                pageData[i][j] += interval;
                if(pageData[i][j] >= 192){
                  pageData[i].splice(j,len - j);
                  break;
                }
              }
            }
          }
          load(page);
        }else if(e.ctrlKey){
          var arr = new Array(7);
          for(var i = 0; i < keyType; i++){
            arr[i] = 0;
            if(pageData[i].indexOf(pos) >= 0){
              pushKey(i);
              arr[i] = 1;
            }
          }
          nowGrid.up();
          for(var i = 0; i < keyType; i++){
            if(pageData[i].indexOf(pos) >= 0) var a = 1
            else var a = 0;
            if(arr[i] ^ a) pushKey(i);
          }
        }else{
          nowGrid.up();
        }
      }else if(code == 40){ //Down
        if(e.shiftKey){
          for(var i = 0; i < keyType; i++){
            var len = pageData[i].length;
            if(len != 0){
              for(var j = 0; j < len; j++){
                pageData[i][len - j - 1] -= interval;
                if(pageData[i][len - j - 1] < 0){
                  pageData[i].splice(0,len - j);
                  break;
                }
              }
            }
          }
          load(page);
        }else if(e.ctrlKey){
          var arr = new Array(7);
          for(var i = 0; i < keyType; i++){
            arr[i] = 0;
            if(pageData[i].indexOf(pos) >= 0){
              pushKey(i);
              arr[i] = 1;
            }
          }
          nowGrid.down();
          for(var i = 0; i < keyType; i++){
            if(pageData[i].indexOf(pos) >= 0) var a = 1
            else var a = 0;
            if(arr[i] ^ a) pushKey(i);
          }
        }else{
          nowGrid.down();
        }
      }else if(code == 37){ //Left
        if(e.shiftKey){
          if(page <= 10) changePage(1)
          else changePage(page - 10);
        }else if(e.ctrlKey){
          if(chapter != 1) changePage(infoData2[chapter - 2][0]);
        }else changePage(--page);
      }else if(code == 39){ //Right
        if(e.shiftKey){
          if(page > maxPage - 10) changePage(maxPage)
          else changePage(page + 10);
        }else if(e.ctrlKey){
          if(chapter != infoData2.length) changePage(infoData2[chapter][0]);
        }else changePage(++page);
      }else if(code == 13){ //Enter
        if(e.ctrlKey){
          var frameData = posToFrame(data,infoData2);
          var saveData = posSave(data);
          outputData(saveData,infoData2);
        }else{
          if(mp){
            mp.stop();
            mp = "";
          }else{
            mp = new musicPlay();
            mp.start();
          }
        }
      }else if(code == 67){ //C,コピ
        if(JSON.stringify(pageData) != JSON.stringify(emp2d)){
          clip = new Array(keyType);
          for(var i = 0; i < keyType; i++){
            clip[i] = [];
            var len = pageData[i].length;
            if(len != 0){
              for(var j = 0; j < len; j++){
                clip[i].push(pageData[i][j]);
              }
            }
          }
        }
      }else if(code == 88){ //X,カット
        if(JSON.stringify(pageData) != JSON.stringify(emp2d)){
          clip = new Array(keyType);
          for(var i = 0; i < keyType; i++){
            clip[i] = [];
            var len = pageData[i].length;
            if(len != 0){
              for(var j = 0; j < len; j++){
                clip[i].push(pageData[i][j]);
              }
              data[page - 1][i] = [];
              pageData[i] = [];
            }
          }
          load(page);
        }
      }else if(code == 86){ //V,貼り付け
        for(var i = 0; i < keyType; i++){
          data[page - 1][i] = [];
          var len = clip[i].length;
          if(len != 0){
            for(var j = 0; j < len; j++){
              data[page - 1][i].push(clip[i][j]);
            }
          }
        }
        load(page);
      /*}else if(code == 85){ //U
        fixedSwitch();
      }else if(code == 82){ //R
        changeInfo();*/
      }else if(code == 89){ //Y
        if(chapter != 1){
          var term = infoData2[chapter - 1][0] - infoData2[chapter - 2][0]; //前セクションのページ数
          var newNum = 28800 * term / Number(infoData2[chapter - 2][1]) + Number(infoData2[chapter - 2][2]);
          textbox[1].value = newNum.toFixed(1); //単位:F
          firstNum = newNum.toFixed(1);
        }
      }else if(code == 84){ //T
        var frameData = posToFrame(data,infoData2);
        var saveData = posSave(data);
        var detail = [Number(s1.value),0,Number(s2.value)];
        localStorage.detail = detail;
        var difficulty = calculateNotes(data,infoData2);
        if(difficulty[0] != 0){
          cancelAllCreate();
          layer2.removeEventListener("keydown",f,false);
          testPlay(audio,frameData,saveData,infoData2,page);
        }
      }else if(code == 48){ //0
        var difficulty = calculateNotes(data,infoData2);
        l2.clearRect(0,0,350,40);
        l2.fillStyle = "#FFFFFF";
        l2.textAlign = "center";
        l2.font = "20px 'Arial'";
        l2.fillText("notes:" + difficulty[0] + " / ★:" + difficulty[1],175,32);
      }else if(code == 72){ //H
        pushKey(3);
        nowGrid.up();
      }else if(code == 69){ //E
        pushKey(1);
        nowGrid.up();
      }else if(code == 73){ //I
        pushKey(5);
        nowGrid.up();
      }

      n = intervalCode.indexOf(code);
      if(n >= 0){
        changeInterval(n);
      }
      n = keyCode.indexOf(code);
      if(n >= 0){
        pushKey(n);
        nowGrid.up();
      }
    e.preventDefault();
    }
  }

  var kdevent2 = kdevent();
  layer2.addEventListener("keydown",kdevent2,false);
}

//難易度計算
function calculateNotes(data,infoD2){
  var totalNotes = 0;
  var maxNotes = 0;

  var frameData = posToFrame(data,infoD2);
  var startFrame = Infinity;
  var lastFrame = 0;
  for(var i = 0; i < frameData.length; i++){
    var len = frameData[i].length
    totalNotes += len;
    if(lastFrame < frameData[i][len - 1]){
      lastFrame = frameData[i][len - 1];
    }
    if(len > 0 && startFrame > frameData[i][0]){
      startFrame = frameData[i][0];
    }
  }

  if(totalNotes != 0){
    var duration = lastFrame - startFrame;
    var baseFrame = 192;
    var num = Math.ceil(duration / baseFrame);
    var arr = new Array(num);
    for(var i = 0; i < frameData.length; i++){
      var len = frameData[i].length
      for(var j = 0; j < len; j++){
        var n = Math.floor((frameData[i][j] - startFrame) / baseFrame);
        if(!arr[n]) arr[n] = 1
        else arr[n] += 1;
      }
    }

    var maxNotes = 0;
    for(var i = 0; i < arr.length; i++){
      if(!arr[i]) num -= 1;
      if(maxNotes < arr[i]) maxNotes = arr[i];
    }

    var average = totalNotes / num;
    var baseNotes = 4; //BPM150で1小節に2打
    var diffCorr = Math.min(maxNotes / average,6) - 1;
    var difficulty = (average / baseNotes * (1 + diffCorr / 2)).toFixed(2);
  }else{
    var difficulty = 0;
  }
  return [totalNotes,difficulty];
}

//--posデータ→frameデータ--//
function posToFrame(data,infoData2){
  var num = 0;
  var bpm = 0;
  var keyType = data[0].length;
  var frameData = new Array();
  var c = 0;
  var clen = infoData2.length;
  for(var i = 0; i < keyType; i++){
    frameData.push([]);
  }

  for(var i = 0; i < data.length; i++){
    if(c != clen && i + 1 == infoData2[c][0]){
      bpm = Number(infoData2[c][1]);
      num = infoData2[c][2];
      c++;
    }else{
      num += 28800 / bpm;
    }
    for(var j = 0; j < keyType; j++){
      var len = data[i][j].length;
      if(len != 0){
        for(var k = 0; k < len; k++){
          var pos = data[i][j][k];
          var noteFrame = num + pos * 150 / bpm; //192分割
          frameData[j].push(noteFrame);
        }
      }
    }
  }

  for(var i = 0; i < keyType; i++){
    frameData[i].sort(function(a,b){
      return a - b;
    });
  }

  return frameData;
}

//--posデータをsaveデータに変換--//
function posSave(data){
  var maxPage = data.length;
  var keyType = data[0].length;
  var saveData = create2d(keyType);
  for(var i = 0; i < maxPage; i++){
    for(var j = 0; j < keyType; j++){
      var len = data[i][j].length;
      if(len != 0){
        for(var k = 0; k < len; k++){
          saveData[j].push(data[i][j][k] + i * 192);
        }
      }
    }
  }
  return saveData;
}

//--saveデータをposデータに変換--//
function posLoad(saveData,maxPage){
  var data = [];
  var keyType = saveData.length;

  for(var i = 0; i < keyType; i++){
    saveData[i].sort(function(a,b){
      return a - b;
    });
  }

  for(var i = 0; i < maxPage; i++){
    data.push([]);
    for(var j = 0; j < keyType; j++){
      data[i].push([]);
    }
  }
  for(var i = 0; i < keyType; i++){
    var len = saveData[i].length;
    if(len != 0){
      for(var j = 0; j < len; j++){
        var pos = saveData[i][j];
        var a = Math.floor(pos / 192);
        var b = pos % 192;
        if(0 <= a && a < maxPage){
          data[a][i].push(b);
        }
      }
    }
  }
  return data;
}

//--クリップボードに出力--//
function outputData(saveData,infoData2){
  var t = document.createElement("textarea");
  document.body.appendChild(t);
  var str = "&jsonPosData=" + JSON.stringify(saveData) + "&\n&jsonInfoData2=" + JSON.stringify(infoData2) + "&";
  t.value = str;
  t.select();
  document.execCommand("copy");
  document.body.removeChild(t);
  return str;
}

//--ファイル選択画面--//
function prepare(){
  var layer1 = document.getElementById("layer1");
  var l1 = layer1.getContext("2d");
  var layer2 = document.getElementById("layer2");
  layer2.setAttribute("tabindex",0);
  var l2 = layer2.getContext("2d");
  l1.clearRect(0,0,350,400);
  l2.clearRect(0,0,350,400);

  var width = [87.5,262.5];
  l1.fillStyle = "#000000";
  l1.fillRect(0,0,350,65);
  l1.fillRect(0,335,350,65);
  l2.fillStyle = "#FFFFFF";
  l2.textAlign = "center";
  l2.font = "20px 'Arial'";
  l2.fillText("Choose your files.",175,37);
  l2.fillText("Back",width[0],372);
  l2.fillText("Next",width[1],372);
  l2.fillStyle = "#FF0000";
  l2.fillText("MUSIC",175,110);
  l2.fillStyle = "#0000FF";
  l2.fillText("SCORE",175,240);
  l2.fillStyle = "#FFFFFF";
  l2.font = "16px 'Arial'";
  l2.fillText("Select a music file.",175,175);

  //--音楽の読み込み--//
  var canvasParent = document.getElementById("canvasParent");
  var input = document.createElement("input");
  input.type = "file";
  input.className = "music";
  input.accept = "audio/mpeg";
  canvasParent.appendChild(input);

  var audio = new Audio();
  var flag1 = false;
  input.onchange = function(e){
    audio.pause();
    var music = e.target.files[0];
    var discmp3  = (music.name + " ").indexOf(".mp3 ");

    l2.clearRect(0,95,350,30);
    l2.clearRect(0,160,350,30)
    l2.fillStyle = "#FFFFFF";
    l2.font = "16px 'Arial'";
    l2.fillText(music.name,175,110);

    if(music.size < 10000000 && discmp3 !== -1){
      flag1 = true;
      var url = URL.createObjectURL(music);
      audio.src = url;
      audio.load();
      audio.play().catch(function(e){
        l2.fillText("This file has some problems.",175,175);
        flag1 = false;
      });
    }else{
      l2.fillText("Select a collect file.",175,175);
      flag1 = false;
    }
  }

  //--譜面データの読み込み--//
  var input2 = document.createElement("input");
  input2.type = "file";
  input2.className = "dos";
  input2.accept = "text/plain";
  canvasParent.appendChild(input2);

  var fr = new FileReader();
  var flag2 = true;
  var keyType = 7;

  var saveData = create2d(keyType);
  var infoData2 = [[1,140,0]];
  var content = "";

  fr.onload = function(e){
    content = e.target.result;
    saveData = fileCheck(content,"&jsonPosData=","&");
    infoData2 = fileCheck(content,"&jsonInfoData2=","&");

    if(saveData && infoData2){
      flag2 = true;

    }else{
      l2.fillStyle = "#FFFFFF";
      l2.font = "16px 'Arial'";
      l2.fillText("Select a collect file.",175,305);
      flag2 = false;
    }
  }

  input2.onchange = function(e){
    var txt = e.target.files[0];
    if(txt.size < 100000){
      fr.readAsText(txt)
      l2.clearRect(0,225,350,30);
      l2.clearRect(0,290,350,30);
      l2.fillStyle = "#FFFFFF";
      l2.font = "16px 'Arial'";
      l2.fillText(txt.name,175,240);
      flag2 = true;
    }else{
      l2.clearRect(0,225,350,30);
      l2.clearRect(0,290,350,30);
      l2.fillStyle = "#FFFFFF";
      l2.font = "16px 'Arial'";
      l2.fillText("This file is too large.",175,305);
      flag2 = false;
    }
  }

  //--マウスイベント--//
  var x = 0;
  var y = 0;
  function changeColor(e){
    button = e.target.getBoundingClientRect();
    x = e.clientX - button.left;
    y = e.clientY - button.top;
    l1.fillStyle = "#000000";
    l1.fillRect(0,335,350,65)
    if((x > 10 && x < 170) && (y > 335 && y < 395)){
      l1.fillStyle = "#FF0000";
      l1.fillRect(0,335,174.5,65);
    }else if((x > 180 && x < 340) && (y > 335 && y < 395)){
      l1.fillStyle = "#008800";
      l1.fillRect(175.5,335,174.5,65);
    }
  }

  layer2.addEventListener("mousemove",changeColor,false);

  layer2.addEventListener("click",(function(){
    return function f(){
      if((x > 10 && x < 170) && (y > 335 && y < 395)){
        audio.pause();
        canvasParent.removeChild(input);
        canvasParent.removeChild(input2);
        l1.clearRect(0,0,350,400);
        l2.clearRect(0,0,350,400);
        layer2.removeEventListener("mousemove",changeColor,false);
        layer2.removeEventListener("click",f,false);
        if(sessionStorage.modify == 3) modify();
        else intro();
      }else if((x > 180 && x < 340) && (y > 335 && y < 395)){
        audio.pause();
        if(flag1 && flag2){
          canvasParent.removeChild(input);
          canvasParent.removeChild(input2);
          l1.clearRect(0,0,350,400);
          l2.clearRect(0,0,350,400);
          layer2.removeEventListener("mousemove",changeColor,false);
          layer2.removeEventListener("click",f,false);
          if(!localStorage.detail) localStorage.detail = [5,0,0];
          createScore(audio,saveData,infoData2,1);
        }
      }
    }
  })(),false);
}

//--ファイルチェック&配列に変換--//
function fileCheck(txt,str,end){
  var startIndex = txt.indexOf(str);
  if(startIndex < 0){
    return false;
  }else{
    startIndex += str.length;
  }

  var endIndex = txt.indexOf(end,startIndex);
  if(endIndex < 0){
    return false;
  }else{
    var jsonString = txt.slice(startIndex,endIndex);
  }

  var arrayReg = /^\[[0-9,\.\[\]]*\]$/;
  if(!arrayReg.test(jsonString)){
    return false;
  }
  try{
    var posArray = JSON.parse(jsonString);
  }catch(e){
    return false;
  }

  return posArray;
}

function initializeTP(){
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  var layer1 = document.getElementById("layer1");
  var l1 = layer1.getContext("2d");
  var layer2 = document.getElementById("layer2");
  var l2 = layer2.getContext("2d");

  ctx.clearRect(0,0,350,400);
  l1.clearRect(0,0,350,400);
  l2.clearRect(0,0,350,400);

  ctx.fillStyle = "#000000";
  if(localStorage.reverse == 1) ctx.fillRect(0,35,200,5);
  else ctx.fillRect(0,360,200,5);
  ctx.fillRect(197.5,0,5,400);
  var laneColor = ["#3B0001","#002300","#403900","#3E3A39"];
  for(var i = 0; i < 8; i++){
    ctx.fillStyle = "#A0A0A0";
    ctx.fillRect(11.5 + 25 * i,0,1,400);
    switch(Math.abs(i - 3)){
      case 0:
      ctx.fillStyle = laneColor[0];
      break;
      case 1:
      ctx.fillStyle = laneColor[1];
      break;
      case 2:
      ctx.fillStyle = laneColor[2];
      break;
      case 3:
      ctx.fillStyle = laneColor[3];
      break;
      default:
      ctx.fillStyle = "transparent";
      break;
    }
    if(localStorage.reverse == 1){
      ctx.fillRect(12.5 + 25 * i,35,24,5);
    }else{
      ctx.fillRect(12.5 + 25 * i,360,24,5);
    }
  }
}

//--テストプレイ--//
function testPlay(audio,frameData,saveD,infoD2,pg){
  //detail:[spd(0-10),0(Timing),persent(0-20)]
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  var layer1 = document.getElementById("layer1");
  var l1 = layer1.getContext("2d");
  var layer2 = document.getElementById("layer2");
  layer2.setAttribute("tabindex",0)
  var l2 = layer2.getContext("2d");
  l2.textAlign = "center";

  var keyType = 7;
  var frameDataCopy = create2d(keyType);
  for(var i = 0; i < keyType; i++){
    var len = frameData[i].length
    if(len != 0){
      for(var j = 0; j < len; j++){
        frameDataCopy[i].push(frameData[i][j]);
      }
    }
  }

  var detail = JSON.parse("[" + localStorage.detail + "]");
  var persent = detail[2];
  var data = convertTP(frameData,persent); //time,time2,fadein
  var time = data[0] //(時間,位置(1,2,3...))
  var time2 = data[1] //(時間1...時間n)
  var fadein = data[2];
  var len = time.length;
  var objArray = new Array(len);
  var side = [12.5,37.5,62.5,87.5,112.5,137.5,162.5]; //ノーツの横位置
  if(localStorage.keyCode){
    var keyCode = JSON.parse("[" + localStorage.keyCode + "]");
  }else{
    var keyCode = [83,68,70,32,74,75,76] //S,D,F,Sp,J,K,L
  }

  var info = ["TEST","test","difficulty",""];

  var diff = [50,100,150]; //許容誤差
  var passTime = 5500 / detail[0];
  var firstTime = passTime * 0.9
  var pf = 0;
  var gd = 0;
  var ms = 0;
  var bd = 0;
  var combo = 0;
  var maxcombo = 0;

  if(localStorage.reverse == 1){
    var bar = 35;
    var beamU = 35;
    var beamR = 40;
    var aptx = 210;
  }else{
    var bar = 360;
    var beamU = 280;
    var beamR = 280;
    var aptx = 190;
  }

  //--初期化--//
  initializeTP();
  displayScore(l2,0,0,0,0,0);
  var duration = audio.duration;
  var endTimer = "";
  var startTimer = setTimeout(function(){
    audio.currentTime = fadein / 1000;
    audio.play();

    //--ゲーム通常終了時処理--//
    endTimer = setTimeout(function(){
      layer2.removeEventListener("keydown",kdevent2,false);
      window.cancelAnimationFrame(requestId);
      audio.pause();
      ctx.clearRect(0,0,350,400);
      l1.clearRect(0,0,350,400);
      l2.clearRect(0,0,350,400);
      if(maxcombo < combo) maxcombo = combo;
      resultTP(audio,frameDataCopy,saveD,infoD2,[pf,gd,bd,ms,maxcombo],pg)
    },1000 * duration + passTime - fadein);
  },firstTime);

  var judgeTimer = "";
  function appearText(ctx,string,x,y,w,h,color,font){
    l2.clearRect(x-w/2,y-h/2,w,h);
    judgeTimer = setTimeout(function(){
      l2.fillStyle = color;
      l2.font = font;
      l2.textAlign = "center";
      l2.fillText(string,x,y);
      judgeTimer = setTimeout(function(){
        l2.clearRect(x-w/2,y-h/2,w,h);
      },1000);
    },33);
  }

  var noteTimer = new Array(len);
  var missTimer = new Array(len);
  function createObj(i){
    objArray[i] = play(time[i][1],passTime);
    missTimer[i] = setTimeout(function(){
      if(objArray[i].miss() == 1){
        ms += 1;
      if(maxcombo < combo) maxcombo = combo;
        combo = 0;
        clearTimeout(judgeTimer);
        appearText(l2,"Miss...",100,aptx,100,30,"#0000FF","16px 'Arial'");
      }
    },passTime + diff[2]);
  }

  var count = 0;
  var startTime = getTime();
  for(var j = 0; j < len; j++){
    if(j != 0 && time[j][0] == time[j - 1][0]) continue;
    (function(i){
      var err = getTime() - startTime;
      noteTimer[i] = setTimeout(function(){
        createObj(i);
        while(time[i + 1] && time[i][0] == time[i + 1][0]){
          i++;
          createObj(i);
        }
        count = i;
      },time[i][0] - err);
    })(j);
  }

  function secToMs(sec){
    var secInt = Math.floor(sec);
    if(secInt % 60 < 10) var s = "0" + secInt % 60;
    else var s = secInt % 60;
    var ms = Math.floor(secInt / 60) + ":" + s;
    return ms;
  }

  var requestId = "";
  (function loop(){
    requestId = window.requestAnimationFrame(loop);
    displayScore(l2,pf,gd,bd,ms,combo);
    var cur = secToMs(audio.currentTime);
    var dur = secToMs(duration);
    l2.font = "12px 'Arial'";
    l2.fillStyle = "#FFFFFF";
    l2.textAlign = "left";
    l2.fillText(cur+ " / " + dur,210,390);
  })();


 //--キー入力関連--//
  function kdevent(){
    return function f(e){
      if(e.keyCode == 46 || e.keyCode == 27){ //delete,Esc
        window.cancelAnimationFrame(requestId);
        clearTimeout(startTimer);
        clearTimeout(endTimer);
        clearTimeout(judgeTimer);
        layer2.removeEventListener("keydown",f,false);
        for(var i = 0; i < len; i++){
          clearTimeout(noteTimer[i]);
          clearTimeout(missTimer[i]);
          if(objArray[i]){
            objArray[i].del();
          }
        }
        ctx.clearRect(0,0,350,400);
        l1.clearRect(0,0,350,400);
        l2.clearRect(0,0,350,400);
        audio.pause();
        createScore(audio,saveD,infoD2,pg);
      }

      var n = keyCode.indexOf(e.keyCode);
      if(n >= 0){
        l2.fillStyle = "#FFFFFF";
        var judge = hit(time2,n,startTime,passTime,diff);
        if(judge[0] >= 0){
          if(judge[1] == 0){
            pf += 1;
            combo += 1
            clearTimeout(judgeTimer);
            appearText(l2,"Perfect!!",100,aptx,100,30,"#FF0000","16px 'Arial'");
          }else if(judge[1] == 1){
            gd += 1;
            combo += 1
            clearTimeout(judgeTimer);
            appearText(l2,"Good!",100,aptx,100,30,"#FFBF00","16px 'Arial'");
          }else if(judge[1] == 2){
            bd += 1;
            combo = 0;
            clearTimeout(judgeTimer);
            appearText(l2,"Bad",100,aptx,100,30,"#00FFFF","16px 'Arial'");
          }
          var m = 0;
          while(time[m].toString() != [time2[n][judge[0]],n].toString()){
            m++;
          }
          time2[n][judge[0]] = 0;
          objArray[m].del();
          l2.fillStyle = "#FFFF00";
        }
        l2.fillRect(side[n],bar,24,5);
        beam(n);
        setTimeout(function(){
          l2.clearRect(side[n],beamU,25,85);
        },50);
      }
    e.preventDefault();
    return false;
    }
  }
  var kdevent2 = kdevent();
  layer2.addEventListener("keydown",kdevent2,false);

  //--ビーム--//
  var colorArray = ["rgba(169,169,169,0)","rgba(0,1,31,0)","rgba(49,13,0,0)"];
  var bgColor = colorArray[localStorage.colorType];

  function beam(n){
    l2.beginPath()
    l2.rect(side[n],beamR,24,80);
    l2.closePath();
    if(localStorage.reverse == 1){
      var grad = l2.createLinearGradient(side[n],120,side[n],40);
    }else{
      var grad = l2.createLinearGradient(side[n],280,side[n],360);
    }
    try{
      grad.addColorStop(0,bgColor);
    }catch(e){
      grad.addColorStop(0,"rgba(224,248,247,0)");
    }
    grad.addColorStop(1,"rgba(224,248,247,1)");
    l2.fillStyle = grad;
    l2.fill();
  }
}

//--データ変換(TP)--//
function convertTP(frameData,persent){
  var keyType = frameData.length;
  var time2 = frameData;

  var fadein = 0;
  for(var i = 0; i < keyType; i++){
    var len = time2[i].length;
    if(fadein < Number(time2[i][len - 1])) fadein = Number(time2[i][len - 1]); //最大frame
  }
  fadein *= (persent * 5 / 6);// x/20*1000/60

  var time = [];
  for(var k = 0; k < keyType; k++){
    for(var l = 0; l < time2[k].length; l++){
      time2[k][l] = time2[k][l] * 1000 / 60 - fadein;
      if(time2[k][l] >= 0) time.push([time2[k][l],k]);
      else time2[k][l] = -1;
    };
    while(time2[k][0] == -1){
      time2[k].shift();
    }
  };

  time.sort(function(a,b){
    if( a[0] < b[0] ) return -1;
    if( a[0] > b[0] ) return 1;
    return 0;
  });

  return[time,time2,fadein];
}

//--リザルト画面(TP)--//
function resultTP(audio,frameData,saveD,infoD2,scr,pg){
  var layer1 = document.getElementById("layer1");
  var l1 = layer1.getContext("2d");
  var layer2 = document.getElementById("layer2");
  var l2 = layer2.getContext("2d");
  var width = [87.5,262.5];

  var pf = scr[0];
  var gd = scr[1];
  var bd = scr[2];
  var ms = scr[3];
  var combo = scr[4];
  var total = pf + gd + bd + ms;

  if(total === 0) var ac = 0;
  else var ac = (pf + gd) / total * 100;
  var score = 30 * pf + 10 * gd;
  var rank = "D";

  var maxPage = 400;
  var notes = calculateNotes(posLoad(saveD,maxPage),infoD2)[0];

  var detail = JSON.parse("[" + localStorage.detail + "]");
  if(detail[2] > 0 || total < notes){rank = "-"}
  else if(ac >= 100){rank = "FC"}
  else if(ac >= 98){rank = "SS"}
  else if(ac >= 95){rank = "S"}
  else if(ac >= 90){rank = "A"}
  else if(ac >= 80){rank = "B"}
  else if(ac >= 70){rank = "C"}

  l1.clearRect(0,0,350,400);
  l1.fillStyle = "#000000";
  l1.fillRect(0,0,350,65);
  l1.fillRect(0,335,350,65);
  l2.fillStyle = "#FFFFFF";
  l2.textAlign = "center";
  l2.font = "20px 'Arial'";
  l2.fillText("test play",175,37);
  l2.fillText("Back",width[0],372);
  if(rank != "-" && ac >=95){
    l2.fillText("Next",width[1],372);
  }else{
    l2.fillText("Retry",width[1],372);
  }

  l2.font = "18px 'Arial'";
  l2.fillText("Perfect:" + pf,175,95);
  l2.fillText("Good:" + gd,175,120);
  l2.fillText("Bad:" + bd,175,145);
  l2.fillText("Miss:" + ms,175,170);
  l2.fillText("Combo:" + combo,175,195);
  l2.fillText("Score:" + score,175,240);
  l2.fillText("Accuracy:" + ac.toFixed(2) + "%",175,265);

  l2.fillStyle = "#FFFF00";
  l2.font = "26px 'Arial'";
  l2.fillText("Rank:" + rank,175,315);

  var x = 0;
  var y = 0;
  function changeColor(e){
    button = e.target.getBoundingClientRect();
    x = e.clientX - button.left;
    y = e.clientY - button.top;
    l1.fillStyle = "#000000";
    l1.fillRect(0,335,350,65)
    if((x > 10 && x < 170) && (y > 335 && y < 395)){
      l1.fillStyle = "#FF0000";
      l1.fillRect(0,335,174.5,65);
    }else if((x > 180 && x < 340) && (y > 335 && y < 395)){
      l1.fillStyle = "#008800";
      l1.fillRect(175.5,335,174.5,65);
    }
  }

  layer2.addEventListener("mousemove",changeColor,false);

  layer2.addEventListener("click",(function(){
    return function f(){
      if((x > 10 && x < 170) && (y > 335 && y < 395)){
        l1.clearRect(0,0,350,400);
        l2.clearRect(0,0,350,400);
        layer2.removeEventListener("mousemove",changeColor,false);
        layer2.removeEventListener("click",f,false);
        createScore(audio,saveD,infoD2,pg);
      }else if((x > 180 && x < 340) && (y > 335 && y < 395)){
        if(rank != "-" && ac >=95){
          l1.clearRect(0,0,350,400);
          l2.clearRect(0,0,350,400);
          layer2.removeEventListener("mousemove",changeColor,false);
          layer2.removeEventListener("click",f,false);
          submitData(audio,frameData,saveD,infoD2,scr,pg);
        }else{
          l1.clearRect(0,0,350,400);
          l2.clearRect(0,0,350,400);
          layer2.removeEventListener("mousemove",changeColor,false);
          layer2.removeEventListener("click",f,false);
          submitData(audio,frameData,saveD,infoD2,scr,pg);
          //testPlay(audio,frameData,saveD,infoD2,pg);
        }
      }
    }
  })(),false);
}

//登録画面
function submitData(audio,frameData,saveD,infoD2,scr,pg){
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  var layer2 = document.getElementById("layer2");
  var l2 = layer2.getContext("2d");
  var canvasParent = document.getElementById("canvasParent");
  var buttonArray = ""
  var mdf = sessionStorage.modify;
  var pack = "";
  if(mdf){
    pack = JSON.parse(sessionStorage.pack);
  }

  var f1 = function(){
    cancelAllSubmit();
    if(mdf == 1) modify();
    else resultTP(audio,frameData,saveD,infoD2,scr,pg);
  }

  var click = false;
  var f2 = function(){
    if(!click){
      click = true;
      var cover = document.createElement("div");
      cover.style.width = "350px";
      cover.style.height = "400px";
      cover.style.backgroundColor = "transparent";
      cover.style.zIndex = 100;
      canvasParent.appendChild(cover);
      var maxPage = 400;
      var obj = {
        id : null,
        title : buttonArray[2].value,
        creator : buttonArray[4].value,
        difficulty : calculateNotes(posLoad(saveD,maxPage),infoD2)[1],
        music : new Date().getTime(),
        artist : buttonArray[3].value,
        time : Math.ceil(audio.duration),
        maxbpm : "",
        minbpm : null,
        notes : calculateNotes(posLoad(saveD,maxPage),infoD2)[0],
        comment : buttonArray[6].value
      }

      if(infoD2.length == 1){
        obj.maxbpm = infoD2[0][1];
        obj.minbpm = null;
      }else{
        for(var i = 0; i < infoD2.length; i++){
          var bpm = infoD2[i][1];
          if(obj.maxbpm < bpm){
            obj.maxbpm = bpm;
          }
          if(!obj.minbpm || obj.minbpm > bpm){
            obj.minbpm = bpm;
          }
        }
      }

      var flag = true;
      for(var i = 0; i < 5; i++){
        if(!buttonArray[i + 2].value){
          alert("Unentered parts exist.")
          flag = false;
          click = false;
          canvasParent.removeChild(cover);
          break;
        }
      }

      var pwd = buttonArray[5].value;
      if(flag){
        if(mdf){
          obj.id = pack.id;
          var url = "./php/modifyscore.php";
        }else{
          var url = "./php/submitscore.php";
        }
        var json = JSON.stringify(obj);
        var txt = outputData(saveD,infoD2);
        var xhr = new XMLHttpRequest();
        xhr.open("GET", audio.src, true);
        xhr.responseType = "blob";
        xhr.onload = function(){
          var chk;
          var blob;
          if(mdf == 1){
            chk = "modify1";
            blob = "";
            txt = "";
          }else if(mdf == 2){
            chk = "modify2";
            blob = "";
          }else if(mdf == 3){
            chk = "modify3";
            blob = xhr.response;
          }else{
            chk = "submitscore";
            blob = xhr.response;
          }
          var req = new XMLHttpRequest();
          req.open("POST",url,true);
          var formData = new FormData();
          formData.append("chk",chk);
          formData.append("list",json);
          formData.append("pwd",pwd);
          formData.append("audio",blob,"test");
          formData.append("txt",txt);
          
          req.onload = function(){
            var response  = req.responseText;
            var twt = confirm(response);
            if(response === "登録完了しました! Twitterに投稿しますか?"){
              if(twt){
                var tweetText = "【 #PlateBeats 】 譜面を投稿しました! [" + obj.title + " / " + obj.artist + "] created by " + obj.creator; 　
                var encText = encodeURIComponent(tweetText);
                var encURL = encodeURIComponent("https://platebeats.com/");
                window.open("http://twitter.com/share?text=" + encText + "&url=" + encURL,"tweet");
              }
              cancelAllSubmit();
              intro();
            }else if(response === "修正完了しました!"){
              cancelAllSubmit();
              sessionStorage.removeItem("modify");
              intro();
            }
            canvasParent.removeChild(cover);
          }
          req.send(formData);
        }
        xhr.send();
      }
    }
  }
  buttonArray = createMenu("Submit",f1,f2);

  function createForm(x,y,w,h,l){ //xは右からの数値,
    var frm = document.createElement("textarea");
    frm.maxLength = l;
    frm.wrap = "off";
    frm.style.right = x + "px";
    frm.style.top = y + "px";
    frm.style.width = w + "px";
    frm.style.height = h + "px";
    frm.style.font = "14px 'Arial'";
    frm.style.zIndex = 3;
    frm.style.textAlign = "left";
    canvasParent.appendChild(frm);
    buttonArray.push(frm);
    return frm;
  }

  var titleForm = createForm(10,85,260,20,50);
  var artistForm = createForm(10,115,260,20,50);
  var creatorForm = createForm(170,145,100,20,15);
  var passForm = createForm(10,145,100,20,15);
  var commentForm = createForm(10,175,260,130,500);
  commentForm.wrap = "soft";

  if(mdf){
    titleForm.value = pack.title;
    artistForm.value = pack.artist;
    creatorForm.value = pack.creator;
    commentForm.value = pack.comment;
  }

  l2.fillStyle = "#FFFFFF"
  l2.font = "14px 'Arial'"
  l2.textAlign = "left";
  l2.fillText("Title:",10,98);
  l2.fillText("Artist:",10,128);
  l2.fillText("Creator:",10,158);
  l2.fillText("Pass:",200,158);
  l2.fillText("Comment:",10,188);

  function cancelAllSubmit(){
    for(var i = 0; i < buttonArray.length; i++){
      canvasParent.removeChild(buttonArray[i]);
    }
    l2.clearRect(0,0,350,400);
    ctx.clearRect(0,0,350,400);
  }
}

function modify(){
  var layer1 = document.getElementById("layer1");
  var l1 = layer1.getContext("2d");
  var layer2 = document.getElementById("layer2");
  layer2.setAttribute("tabindex",0);
  var l2 = layer2.getContext("2d");
  l1.clearRect(0,0,350,400);
  l2.clearRect(0,0,350,400);
  var canvasParent = document.getElementById("canvasParent");

  sessionStorage.removeItem("modify");
  var width = [87.5,262.5];
  l1.fillStyle = "#000000";
  l1.fillRect(0,0,350,65);
  l1.fillRect(0,335,350,65);
  l2.fillStyle = "#FFFFFF";
  l2.textAlign = "center";
  l2.font = "20px 'Arial'";
  l2.fillText("Modify",175,37);
  l2.fillText("Back",width[0],372);
  l2.fillText("Next",width[1],372);
  l2.textAlign = "left";
  l2.fillText("ID:",90,108);
  l2.fillText("PASS:",90,153);
  l2.fillText("revising information",100,225);
  l2.fillText("editing score",100,265);
  l2.fillText("loading other files",100,305);

  var frm = document.createElement("textarea");
  frm.maxLength = 15;
  frm.wrap = "off";
  frm.style.right = 90 + "px";
  frm.style.width = 100 + "px";
  frm.style.height = 20 + "px";
  frm.style.font = "14px 'Arial'";
  frm.style.zIndex = 3;
  frm.style.textAlign = "left";
  var frm2 = frm.cloneNode();
  frm.style.top = 90 + "px";
  frm2.style.top = 135 + "px";
  canvasParent.appendChild(frm);
  canvasParent.appendChild(frm2);

  var r1 = document.createElement("input");
  r1.type = "radio";
  r1.name = "radio";
  r1.style.position = "absolute";
  r1.style.left = 75 + "px";
  r1.style.zIndex = 3;
  var r2 = r1.cloneNode();
  var r3 = r1.cloneNode();
  r2.checked = true;
  r1.style.top = 210 + "px";
  r2.style.top = 250 + "px";
  r3.style.top = 290 + "px";
  r1.value = 1;
  r2.value = 2;
  r3.value = 3;
  canvasParent.appendChild(r1);
  canvasParent.appendChild(r2);
  canvasParent.appendChild(r3);

  function cancelAllModify(){
    canvasParent.removeChild(frm);
    canvasParent.removeChild(frm2);
    canvasParent.removeChild(r1);
    canvasParent.removeChild(r2);
    canvasParent.removeChild(r3);
    l1.clearRect(0,0,350,400);
    l2.clearRect(0,0,350,400);
  }

  //--マウスイベント--//
  var x = 0;
  var y = 0;
  function changeColor(e){
    button = e.target.getBoundingClientRect();
    x = e.clientX - button.left;
    y = e.clientY - button.top;
    l1.fillStyle = "#000000";
    l1.fillRect(0,335,350,65)
    if((x > 10 && x < 170) && (y > 335 && y < 395)){
      l1.fillStyle = "#FF0000";
      l1.fillRect(0,335,174.5,65);
    }else if((x > 180 && x < 340) && (y > 335 && y < 395)){
      l1.fillStyle = "#008800";
      l1.fillRect(175.5,335,174.5,65);
    }
  }

  layer2.addEventListener("mousemove",changeColor,false);

  var click = false;
  layer2.addEventListener("click",(function(){
    return function f(){
      if((x > 10 && x < 170) && (y > 335 && y < 395)){
        cancelAllModify();
        layer2.removeEventListener("mousemove",changeColor,false);
        layer2.removeEventListener("click",f,false);
        sessionStorage.removeItem("modify");
        intro();
      }else if((x > 180 && x < 340) && (y > 335 && y < 395)){
        var req = new XMLHttpRequest();
        var url = "./php/certificate.php"
        req.open("POST",url,true);
        var formData = new FormData();
        formData.append("chk","certificate");
        formData.append("id",frm.value);
        formData.append("pwd",frm2.value);
        req.onload = function(){
          var response  = req.responseText;
          if(JSON.parse(response)){
            var elem = document.getElementsByName("radio");
            for(var i = 0; i < 3; i++){
              if(elem[i].checked){
                var val = elem[i].value;
                break;
              }
            }
            sessionStorage.modify = val;
            var pack = JSON.parse(response)
            sessionStorage.pack = response;
            cancelAllModify();
            layer2.removeEventListener("mousemove",changeColor,false);
            layer2.removeEventListener("click",f,false);
            if(!localStorage.detail) localStorage.detail = [5,0,0];
            if(val == 1){
              submitData("","","","","","");
            }else if(val == 2){
              createScore("","","",1);
            }else if(val == 3){
              prepare();
            }
          }else{
            l2.textAlign = "center";
            l2.fillStyle = "#FF0000";
            l2.font = "15px Arial";
            l2.fillText("ID or password is wrong.",175,185);
            click = false;
          }
        }
        if(!click){
          click = true;
          var numberReg = /^[0-9]+$/;
          if(numberReg.test(r1.value)) req.send(formData);
          else{
            l2.textAlign = "center";
            l2.fillStyle = "#FF0000";
            l2.font = "15px Arial";
            l2.fillText("ID or password is wrong.",175,185);
            click = false;
          }
        }
      }
    }
  })(),false);
}
