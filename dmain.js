//--あとでつかう--//
function getTime(){
  //return new Date().getTime();
  return performance.now();
}

function zeroPadding(num,len){
  return(Array(len).join('0') + num).slice(-len);
}

function create2d(len){
  var arr = [];
  for(var i = 0; i < len; i++){
    arr.push([]);
  }
  return arr;
}

function canvasButton(x,y,w,h){
  var canvasParent = document.getElementById("canvasParent");
  var div = document.getElementById("divParent");
  var layer2 = document.getElementById("layer2");
  var btn = simpleDiv(x,y,w,h);
  btn.style.zIndex = 3;
  btn.style.userSelect = "none";
  btn.style.display = "flex";
	btn.style.alignItems = "center";
  btn.style.justifyContent = "center";

  btn.style.borderRadius = "4px";
  btn.style.backgroundColor = "#FFFFFF";
  btn.onmouseover = function(){
    btn.style.backgroundColor = "#FFFF00";
  }
  btn.onmouseout = function(){
    btn.style.backgroundColor = "#FFFFFF";
  }
  btn.addEventListener("click",function(){
    layer2.focus();
  },false);

  if(div) div.appendChild(btn)
  else canvasParent.appendChild(btn);
  return btn;
}

function simpleDiv(x,y,w,h){
  var btn = document.createElement("div");
  btn.style.left = x + "px";
  btn.style.top = y + "px";
  btn.style.width = w + "px";
  btn.style.height = h + "px";
  btn.style.lineHeight = h + "px";
  btn.style.position = "absolute";
  return btn;
}

function createDiv(){
  var canvasParent = document.getElementById("canvasParent");
  var div = document.createElement("div");
  div.id = "divParent";
  canvasParent.appendChild(div);
  return div;
}

function deleteDiv(){
  var canvasParent = document.getElementById("canvasParent");
  var div = document.getElementById("divParent");
  if(div) canvasParent.removeChild(div);
  else return false;
}

function createMenu(head,f1,f2){ //submitScoreで使用
  var canvas = document.getElementById("canvas");
  var ctx =  canvas.getContext("2d");
  var canvasParent = document.getElementById("canvasParent");
  var layer2 = document.getElementById("layer2");
  var l2 = canvas.getContext("2d");
  ctx.clearRect(0,0,350,400);
  l2.clearRect(0,0,350,400);
  ctx.fillStyle = "#000000";
  ctx.fillRect(0,0,350,65);
  ctx.fillRect(0,335,350,65);

  l2.fillStyle = "#FFFFFF";
  l2.textAlign = "center";
  l2.font = "24px 'Arial'";
  l2.fillText(head,175,40);

  var buttonArray = new Array();
  var backBtn = canvasButton(0,335,175,65); //back
  buttonArray.push(backBtn);
  backBtn.innerHTML = "Back";
  backBtn.style.backgroundColor = "#000000";
  backBtn.style.color = "#FFFFFF";
  backBtn.style.font = "20px 'Arial'";
  backBtn.onmouseover = function(){
    backBtn.style.backgroundColor = "#FF0000";
  }
  backBtn.onmouseout = function(){
    backBtn.style.backgroundColor = "#000000";
  }
  backBtn.onclick = f1;

  var applyBtn = canvasButton(175,335,175,65);
  buttonArray.push(applyBtn);
  applyBtn.innerHTML = "Apply";
  applyBtn.style.backgroundColor = "#000000";
  applyBtn.style.color = "#FFFFFF";
  applyBtn.style.font = "20px 'Arial'";
  applyBtn.onmouseover = function(){
    applyBtn.style.backgroundColor = "#008000";
  }
  applyBtn.onmouseout = function(){
    applyBtn.style.backgroundColor = "#000000";
  }
  applyBtn.onclick = f2;
  return buttonArray;
}

//--indexedDB--//
function idb(mode,obj,callback){ //mode = "read" or "write"
  var dbName = "test";
  var dbReq = indexedDB.open("test",6);
  var res = false;
  var upgflg = false;
  
  dbReq.onerror = function(e){
    alert("IndexedDB is not available.");
    callback(res);
  }

  dbReq.onupgradeneeded = function(e){
    var db = e.target.result;
    try{
      db.createObjectStore("score",{ keyPath: "id" });
    }catch(e){
      upgflg = true;
    }
  }

  dbReq.onsuccess = function(e){
    var db = e.target.result;
    var trans = db.transaction("score","readwrite");
    var store = trans.objectStore("score");
    if(upgflg){
      store.openCursor().onsuccess = function(e){
        var cursor = e.target.result;
        if(cursor){
          var old = cursor.value;
          store.delete(old.id);
          old.id = Number(old.id)
          old.acc = Number(old.acc.toFixed(3));
          store.put(old);
          cursor.continue();
        }
      }
    }    
    
    var getReq = store.get(Number(obj.id));

    getReq.onerror = function(e){
      alert("Reading failed.");
      callback(false);
    }
    getReq.onsuccess = function(e){
      res = getReq.result;
      if(mode == "hs"){
        callback(res);
        if(!res.acc || res.acc < obj.acc){
          res.acc = Number(obj.acc.toFixed(3));
        }
        if(!res.score || res.score < obj.score){
          res.score = obj.score;
        }
        var putReq = store.put(res);
        putReq.onerror = function(e){
          alert("Writing failed.");
        }
      }else if(mode == "read"){
        if(res) callback(res);
        else callback(false);
      }else if(mode == "write"){
        if(res){
          var nr = callback(res);
        }else{
          var nr = callback(obj);
        }
        var putReq = store.put(nr);
        putReq.onerror = function(e){
          alert("Writing failed.");
        }
      }
    }
    db.close();
  }
}

//--メイン--//
function initialize(){
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  var layer1 = document.getElementById("layer1");
  var l1 = layer1.getContext("2d");
  var layer2 = document.getElementById("layer2");
  var l2 = layer2.getContext("2d");
  layer2.setAttribute("tabindex",0);
  layer2.focus();
  layer2.onkeydown = function(e){
    e.preventDefault();
  }

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

  l2.fillStyle = "#FFFFFF";
  l2.font = "20px 'Arial'";
  l2.textAlign = "center";
  l2.fillText("Now loading...",100,190);

  var pack = JSON.parse(sessionStorage.pack);
  var dPath = zeroPadding(pack.id,6);
  var mPath = zeroPadding(pack.id,6);
  var detail = JSON.parse("[" + localStorage.detail + "]");
  var data = convert(dPath,detail[2]); //path,fadein
  var audio = new Audio();
  audio.src = "./music/" + mPath + ".mp3";
  audio.load();

  //audioの読込状況を確認
  if(audio.readyState === 4){
    setTimeout(function(){
      l2.clearRect(0,140,195,60);
      layer2.onkeydown = "";
      auto(audio,data);
    },1500);
  }else{
    audio.addEventListener('canplaythrough', (function(){
      return function f(){
        audio.removeEventListener('canplaythrough',f,false);
        setTimeout(function(){
          l2.clearRect(0,140,195,60);
          layer2.onkeydown = "";
          auto(audio,data);
        },1500);
      }
    })(),false);
  }

}

function notes(){
  var canvas = document.getElementById("layer1");
  var ctx = canvas.getContext("2d");
  var side = [12.5,37.5,62.5,87.5,112.5,137.5,162.5];
  var n = 0;
  var locate = 0; //ノーツの縦位置
  var size = [24,5]; //ノーツの幅,高さ
  var ms = 0;
  var diff = [50,100,150];

  if(localStorage.colorType == 1 || localStorage.colorType == 2) {
    var noteColor = ["#FFFFFF","#FFFF00","#00FF00","#FF2010"]; //紺,茶色用レーン色
  }else{
    var noteColor = ["#FFFFFF","#FFFF00","#008000","#FF0000"];
  }
  var color = noteColor[3];

  this.generate = function(x){ //x = 0,1,2,3,4,5,6
    switch(x){
      case 0:
      case 6:
      color = noteColor[0];
      break;

      case 1:
      case 5:
      color = noteColor[1];
      break;

      case 2:
      case 4:
      color = noteColor[2];
      break;

      default:
      break;
    }
    ctx.fillStyle = color;
    n = x;
  }
  if(localStorage.reverse == 1){
    locate = 400;
    this.fall = function(startTime,passTime){
      (function loop(){
        var requestId = window.requestAnimationFrame(loop);
        var lastTime = getTime();
        ctx.clearRect(side[n]-0.5,locate-5,size[0] + 1,405-locate);
        ctx.fillStyle = color;
        ctx.fillRect(side[n],locate-5,size[0],size[1]);
        locate = 400 - 400 * ((lastTime - startTime) / passTime);
        if(size[1] == 0){
          window.cancelAnimationFrame(requestId);
        }else if((lastTime - startTime) > passTime * 0.9 + Math.max(passTime / 10, diff[2])){
          window.cancelAnimationFrame(requestId);
          ms = 1;
        }
      })();
    }

    this.del = function(){
      ctx.clearRect(side[n],locate-5,size[0],20);
      size[1] = 0;
    }
  }else{
    this.fall = function(startTime,passTime){
      (function loop(){
        var requestId = window.requestAnimationFrame(loop);
        var lastTime = getTime();
        ctx.clearRect(side[n]-0.5,0,size[0] + 1,locate + 5);
        ctx.fillStyle = color;
        ctx.fillRect(side[n],locate,size[0],size[1]);
        locate = 400 * ((lastTime - startTime) / passTime);
        if(size[1] == 0){
          window.cancelAnimationFrame(requestId);
        }else if((lastTime - startTime) > passTime * 0.9 + Math.max(passTime / 10, diff[2])){
          window.cancelAnimationFrame(requestId);
          ms = 1;
        }
      })();
    }

    this.del = function(){
      ctx.clearRect(side[n],locate-15,size[0],20);
      size[1] = 0;
    }
  }

  this.miss = function(){
    return ms;
  }
}

function play(x,passTime){
  var startTime = getTime();
  var obj = new notes();
  obj.generate(x);
  obj.fall(startTime,passTime);
  return obj;
}

function auto(audio,data){
  //pack:[ID,title,creator,diff,path,artist,time,comment]
  //detail:[spd(1-10),timing(-99~+99),fadein(0-19)]
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  var layer1 = document.getElementById("layer1");
  var l1 = layer1.getContext("2d");
  var layer2 = document.getElementById("layer2");
  layer2.setAttribute("tabindex",0);
  var l2 = layer2.getContext("2d");
  l2.textAlign = "center";
  var detail = JSON.parse("[" + localStorage.detail + "]");

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

  var diff = [50,100,150];
  var passTime = 5500 / detail[0];
  var firstTime = 0 - detail[1] * 1000 / 60 + passTime * 0.9;
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

  displayScore(l2,0,0,0,0,0);
  var startTimer = setTimeout(function(){
    audio.currentTime = fadein / 1000;
    audio.volume = Number(sessionStorage.volume) / 10;
    audio.play();
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
  var duration = audio.duration;

  var requestId = "";
  (function loop(){
    requestId = window.requestAnimationFrame(loop);
    displayScore(l2,pf,gd,bd,ms,combo);
    var cur = secToMs(audio.currentTime);
    var dur = secToMs(Math.ceil(duration));
    l2.font = "12px 'Arial'";
    l2.fillStyle = "#FFFFFF";
    l2.textAlign = "left";
    l2.fillText(cur+ " / " + dur,210,390);
  })();

  //--ゲーム通常終了時処理--//
  var endTimer = setTimeout(function(){
    layer2.removeEventListener("keydown",kdevent2,false);
    window.cancelAnimationFrame(requestId);
    audio.pause();
    ctx.clearRect(0,0,350,400);
    l1.clearRect(0,0,350,400);
    if(maxcombo < combo) maxcombo = combo;
    result([pf,gd,bd,ms,maxcombo]);
  },duration * 1000 + passTime - fadein);

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
        optionSet();
      }

      var n = keyCode.indexOf(e.keyCode);
      if(n >= 0){
        l2.fillStyle = "#FFFFFF";
        var judge = hit(time2,n,startTime,passTime,diff);
        if(judge[0] >= 0){
          if(judge[1] == 0){
            pf += 1;
            combo += 1;
            clearTimeout(judgeTimer);
            appearText(l2,"Perfect!!",100,aptx,100,30,"#FF0000","16px 'Arial'");
          }else if(judge[1] == 1){
            gd += 1;
            combo += 1;
            clearTimeout(judgeTimer);
            appearText(l2,"Good!",100,aptx,100,30,"#FFBF00","16px 'Arial'");
          }else if(judge[1] == 2){
            bd += 1;
            if(maxcombo < combo) maxcombo = combo;
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

//-スコア表示--//
function displayScore(ctx,pf,gd,bd,ms,combo){
  var ac;
  if(pf + gd + bd + ms == 0) ac = 0;
  else ac = (pf + gd) / (pf + gd + bd + ms) * 100;
  if(ac != 100) ac = ac.toFixed(2);
  else ac = 100;

  ctx.clearRect(202.5,0,147.5,400);
  ctx.font = "18px 'Arial'";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "left";
  ctx.fillText("Perfect:" + pf,210,260);
  ctx.fillText("Good:" + gd,210,280);
  ctx.fillText("Bad:" + bd,210,300);
  ctx.fillText("Miss:" + ms,210,320);
  ctx.fillText("Score:" + (30 * pf + 10 * gd),210,350);
  ctx.fillText("Accuracy:" + ac + "%",210,370);
  ctx.textAlign = "center";

  if(localStorage.reverse == 1){
    ctx.clearRect(50,210,100,230);
    if(combo != 0){
      ctx.fillText(combo + "Combo",100,230);
    }
  }else{
    ctx.clearRect(50,150,100,20);
    if(combo != 0){
      ctx.fillText(combo + "Combo",100,170);
    }
  }
}

//--打鍵の判定--//
function hit(time2,n,startTime,passTime,diff){　//n = 位置(0,1,2...)
  function judgement(time2,n,lastTime){
    var i = 0;
    while((time2[n][i] + passTime * 0.9 + 16) < (lastTime - diff[1])){
      i++;
    }

    var gap = Math.abs(time2[n][i] + passTime * 0.9 + 16 - lastTime);
    if(gap <= diff[0]){
      return [i,0];
    }else if(gap <= diff[1]){
      return [i,1];
    }else if(gap <= diff[2]){
      return [i,2];
    }else{
      return [-1,0];
    }
  }

  var lastTime = getTime() - startTime;
  var j = judgement(time2,n,lastTime);
  return j;
}

//--データ変換--//
function convert(path,persent){
  var req = new XMLHttpRequest();
  var url = "./data/" + path + ".txt"
  req.open("GET",url,false);
  req.send("");
  var txt = req.responseText;
  var saveData = fileCheck(txt,"&jsonPosData=","&");
  var infoData2 = fileCheck(txt,"&jsonInfoData2=","&");
  var data = posLoad(saveData,400);
  var frameData = posToFrame(data,infoData2);
  return convertTP(frameData,persent);
}

//--リザルト画面--//
function result(score){
  var canvas = document.getElementById("layer2");
  var ctx = canvas.getContext("2d");
  var width = [58,175,292];

  var pf = score[0];
  var gd = score[1];
  var bd = score[2];
  var ms = score[3];
  var combo = score[4];
  var total = pf + gd + bd + ms;

  if(total === 0) var ac = 0;
  else var ac = (pf + gd) / (total) * 100;
  var score = 30 * pf + 10 * gd;
  var rank = "D";

  var pack = JSON.parse(sessionStorage.pack);
  var detail = JSON.parse("[" + localStorage.detail + "]");
  if(detail[2] > 0 || total < pack.notes){rank = "-"}
  else if(ac >= 100){
    if(gd === 0) rank = "AP";
    else rank = "FC";
  }
  else if(ac >= 98){rank = "SS"}
  else if(ac >= 95){rank = "S"}
  else if(ac >= 90){rank = "A"}
  else if(ac >= 80){rank = "B"}
  else if(ac >= 70){rank = "C"}

  ctx.clearRect(0,0,350,400);
  ctx.fillStyle = "#000000";
  ctx.fillRect(0,0,350,65);
  ctx.fillRect(0,335,350,65);
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.font = "14px 'Arial'";
  ctx.fillText(pack.title + " ★:" + Math.ceil(pack.difficulty),175,37);
  ctx.font = "20px 'Arial'";
  ctx.fillText("Back",width[0],372);
  ctx.fillText("Tweet",width[1],372);
  ctx.fillText("Retry",width[2],372);

  ctx.font = "18px 'Arial'";
  ctx.fillText("Perfect:" + pf,175,95);
  ctx.fillText("Good:" + gd,175,120);
  ctx.fillText("Bad:" + bd,175,145);
  ctx.fillText("Miss:" + ms,175,170);
  ctx.fillText("Combo:" + combo,175,195);
  ctx.fillText("Accuracy:" + ac.toFixed(2) + "%",175,265);

  ctx.fillStyle = "#FFFF00";
  ctx.font = "26px 'Arial'";
  ctx.fillText("Rank:" + rank,175,315);
  var obj = {id:Number(pack.id), score:score, acc:ac};
  if(rank == "AP") obj.acc += 1;
  if(rank != "-"){
    var res = idb("hs",obj,conpare);
    function conpare(res){
      if(!res.score){
        ctx.font = "18px 'Arial'";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText("Score:" + score,175,240);
      }else{
        ctx.font = "18px 'Arial'";
        var record = res.score;
        var diff = score - record;
        if(diff >= 0){
          ctx.fillStyle = "#FF0000";
          ctx.fillText("Score:" + score + " (+" + diff + ")",175,240);
        }else{
          ctx.fillStyle = "#0000FF";
          ctx.fillText("Score:" + score + " (-" + -diff + ")",175,240);
        }
      }
    }
  }else{
    ctx.font = "18px 'Arial'";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("Score:" + score,175,240);
  }

  var x = 0;
  var y = 0;
  function changeColor(e){
    button = e.target.getBoundingClientRect();
    x = e.clientX - button.left;
    y = e.clientY - button.top;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0,335,350,65)
      if((x > 5 && x < 111) && (y > 335 && y < 395)){
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(0,335,116,65);
      }else if((x > 121 && x < 228) && (y > 335 && y < 395)){
        ctx.fillStyle = "#0080FF";
        ctx.fillRect(117,335,116,65);
      }else if((x > 238 && x < 345) && (y > 335 && y < 395)){
        ctx.fillStyle = "#008000";
        ctx.fillRect(234,335,116,65);
      }
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "20px 'Arial'";
    ctx.fillText("Back",width[0],372);
    ctx.fillText("Tweet",width[1],372);
    ctx.fillText("Retry",width[2],372);
  }

  canvas.addEventListener("mousemove",changeColor,false);

  var head;
  canvas.addEventListener("click",(function(){
    return function f(){
    if((x > 5 && x < 111) && (y > 335 && y < 395)){
        canvas.removeEventListener("mousemove",changeColor,false);
        canvas.removeEventListener("click",f,false);
        optionSet();
      }else if((x > 121 && x < 228) && (y > 335 && y < 395)){
        if(pack.id >= 54 && pack.id <= 58){
          head = "【 #PlateBeats #festa7_18 】";
        }else if(pack.music >= 1537959600000 && pack.music <= 1538233200000){
          head = "【 #PlateBeats #PBAF18 】";
        }else{
          head =  "【 #PlateBeats 】";
        }
        var tweetText = head　+ pack.title + "/" + pack.creator + "/Rank:" + rank + "/" + pf + "-" + gd + "-" + bd + "-" + ms + "/" + combo + "combo/" + score + "pts./" + ac.toFixed(2) + "%";
        var encText = encodeURIComponent(tweetText);
        var encURL = encodeURIComponent("https://platebeats.com/?id=" + pack.id);
        window.open("http://twitter.com/share?text=" + encText + "&url=" + encURL,"tweet");
      }else if((x > 238 && x < 345) && (y > 335 && y < 395)){
        canvas.removeEventListener("mousemove",changeColor,false);
        canvas.removeEventListener("click",f,false);
        initialize();
      }
    }
  })(),false);
}

//--起動ページ--//
function idJump(){
  var canvas = document.getElementById("canvas");
  var colorArray = ["#A9A9A9","#00011F","#310D00"];
  var colorType = localStorage.colorType;
  if(colorType) canvas.style.backgroundColor = colorArray[colorType];
  if(sessionStorage.eventFlag) sessionStorage.removeItem("eventFlag");
  
  var nowurl = window.location.search;
  var n = nowurl.indexOf("?id=");
  if(n >= 0 && nowurl.length > n + 4){
    var id = nowurl.slice(n + 4);
    sessionStorage.id = id;
    try{
      optionSet();
    }catch(e){
      intro();
    }
  }else{
    intro();
  }
}

function intro(){
  //クエリの抽出
  var nowurl = window.location.search;
  var n = nowurl.indexOf("id=");
  if(n >= 0 && nowurl.length > n + 3){
    var id = nowurl.slice(n + 3);
  }

  var canvas = document.getElementById("canvas");
  var ctx =  canvas.getContext("2d");
  var img = new Image();
  img.src = "./graphic/logo.png";
  img.onload = function(){
    ctx.drawImage(img,17.5,5,315,360);
  }

  var colorArray = ["#A9A9A9","#00011F","#310D00"];
  var colorType = localStorage.colorType;
  if(colorType) canvas.style.backgroundColor = colorArray[colorType];
  if(sessionStorage.eventFlag) sessionStorage.removeItem("eventFlag");

  var canvasParent = document.getElementById("canvasParent");
  var div = createDiv();
  var layer2 = document.getElementById("layer2");
  var l2 = canvas.getContext("2d");
  l2.clearRect(0,0,350,400);
  l2.textAlign = "center";

  l2.font = "12px 'Arial'";
  l2.fillStyle = "#FFFFFF";
  l2.textAlign = "right";
  var version = "ver 3.1.2";
  l2.fillText(version,345,392);
  var ml = 190;
  //var ml = 110;

  var button1 = canvasButton(ml,245,130,30); //play
  button1.innerHTML = "Play";
  button1.style.font = "24px 'Arial'";
  button1.onclick = function(){
    cancelAllIntro();
    sessionStorage.page = 0;
    selectMusic();
    return false;
  }

  var button2 = canvasButton(ml,280,130,30); //create
  button2.innerHTML = "Create";
  button2.style.font = "24px 'Arial'";
  button2.onclick = function(){
    cancelAllIntro();
    prepare();
    return false;
  }

  var button3 = canvasButton(ml,315,130,30); //modify
  button3.innerHTML = "Modify";
  button3.style.font = "24px 'Arial'";
  button3.onclick = function(){
    cancelAllIntro();
    modify(); //createscore.jsに記述
    return false;
  }

  var button4 = canvasButton(ml,350,130,30); //config
  button4.innerHTML = "Config";
  button4.style.font = "24px 'Arial'";
  button4.onclick = function(){
    cancelAllIntro();
    config();
  }

  //var button5 = canvasButton(265,300,55,55); //random
  var button5 = canvasButton(65,320,60,60); //random
  button5.innerHTML = "GO!";
  button5.style.font = "24px 'Arial'";
  button5.style.borderRadius = "50%";
  button5.onclick = function(){
    var req = new XMLHttpRequest();
    var url = "./php/returnlist.php"
    req.open("POST",url,false);
    req.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded' );
    req.send("chk=countrow");
    var response  = req.responseText;
    var len = Number(response);
    var id = Math.ceil(len * Math.random());
    sessionStorage.id = id;
    try{
      cancelAllIntro();
      optionSet();
    }catch(e){
      return false;
    }
  }
  
  var button6 = canvasButton(30,245,130,70); //random
  //button6.style.display = "block";
  button6.style.margin = "0 auto";
  button6.innerHTML = "<div><span style = 'color:orange;'>PBAF'18</span><br>EVENT</div>";
  button6.style.font = "24px 'Arial'";
  button6.onclick = function(){
    cancelAllIntro();
    sessionStorage.page = 0;
    sessionStorage.eventFlag = true;
    selectMusic();
    return false;
  }

  function cancelAllIntro(){
    deleteDiv();
    l2.clearRect(0,0,350,400);
    ctx.clearRect(0,0,350,400);
  }
}

//--コンフィグ--//
function config(){
  var canvas = document.getElementById("canvas");
  var ctx =  canvas.getContext("2d");
  var canvasParent = document.getElementById("canvasParent");
  var layer2 = document.getElementById("layer2");
  var l2 = canvas.getContext("2d");
  ctx.clearRect(0,0,350,400);
  l2.clearRect(0,0,350,400);
  ctx.fillStyle = "#000000";
  ctx.fillRect(0,0,350,65);
  ctx.fillRect(0,335,350,65);
  ctx.fillRect(0,154.5,350,1);
  ctx.fillRect(0,244.5,350,1);

  var width = [87.5,262.5];
  if(!localStorage.keysChar) var keysChar = "SDF JKL";
  else var keysChar = localStorage.keysChar;
  if(!localStorage.colorType) var colorType = 0;
  else var colorType = Number(localStorage.colorType);
  var colorName = ["Gray","Navy","Brown"];
  var colorArray = ["#A9A9A9","#00011F","#310D00"];
  var rev = 0;

  l2.fillStyle = "#FFFFFF";
  l2.textAlign = "center";
  l2.font = "24px 'Arial'";
  l2.fillText("Color",width[0],115);
  l2.fillText(colorName[colorType],width[1],115);
  l2.fillText("Reverse",width[0],205);
  l2.fillText("Key setting",width[0],295);
  l2.fillText("Config",175,35);

  var buttonArray = [];
  var colorLBtn = canvasButton(width[1] - 60,102,10,10);
  buttonArray.push(colorLBtn);
  colorLBtn.innerHTML = "<";
  colorLBtn.style.color = "#FFFFFF";
  colorLBtn.style.font = "24px 'Arial'";
  colorLBtn.style.backgroundColor = "transparent";
  colorLBtn.onmouseover = function(){
    colorLBtn.style.color = "#FFFF00";
  }
  colorLBtn.onmouseout = function(){
    colorLBtn.style.color = "#FFFFFF";
  }
  colorLBtn.onclick = function(){
    if(colorType == 0) colorType = colorArray.length - 1;
    else colorType--;
    l2.clearRect(width[1] - 50,87,100,50);
    l2.fillText(colorName[colorType],width[1],112);
  }

  var colorRBtn = canvasButton(width[1] + 50,102,10,10);
  buttonArray.push(colorRBtn);
  colorRBtn.innerHTML = ">";
  colorRBtn.style.color = "#FFFFFF";
  colorRBtn.style.font = "24px 'Arial'";
  colorRBtn.style.backgroundColor = "transparent";
  colorRBtn.onmouseover = function(){
    colorRBtn.style.color = "#FFFF00";
  }
  colorRBtn.onmouseout = function(){
    colorRBtn.style.color = "#FFFFFF";
  }
  colorRBtn.onclick = function(){
    if(colorType == colorArray.length - 1) colorType = 0;
    else colorType++;
    l2.clearRect(width[1] - 50,87,100,50);
    l2.fillText(colorName[colorType],width[1],112);
  }

  var keyCode = "";
  var keyconBtn = canvasButton(width[1]-65,287-17.5,130,35);
  buttonArray.push(keyconBtn);
  keyconBtn.innerHTML = "Change";
  keyconBtn.style.font = "24px 'Arial'";
  keyconBtn.onclick = function(){
    var keyType = 7;
    var arr = [];
    var symbols = ":;,-./@"; //186-192
    var keys = window.prompt("Enter just 7 keys you want to use.\n( A-Z,0-9,:;,-./@ )",keysChar);

    if(keys.length == keyType){
      keys = keys.toUpperCase();
      keysChar = keys;
      for(var i = 0; i < keyType; i++){
        var n = symbols.indexOf(keys[i])
        var c = 0;
        if(n < 0){
          c = keys.charCodeAt(i);
        }else{
          c = 186 + n;
        }
        arr.push(c);
      }
      keyCode = arr;
    }else{
      alert("Enter collect characters.");
    }
  }

  var reverseBtn = canvasButton(width[1]-10,190,20,20);
  buttonArray.push(reverseBtn);
  if(localStorage.reverse == 1){
    reverseBtn.innerHTML = "ON";
    var rev = 1;
  }else{
    reverseBtn.innerHTML = "OFF";
  }
  reverseBtn.style.color = "#FFFFFF";
  reverseBtn.style.font = "24px 'Arial'";
  reverseBtn.style.backgroundColor = "transparent";
  reverseBtn.onmouseover = function(){
    reverseBtn.style.color = "#FFFF00";
  }
  reverseBtn.onmouseout = function(){
    reverseBtn.style.color = "#FFFFFF";
  }
  reverseBtn.onclick = function(){
    if(rev === 1){
      reverseBtn.innerHTML = "OFF";
      rev = 0;
    }else{
      reverseBtn.innerHTML = "ON";
      rev = 1;
    }
  }

  var backBtn = canvasButton(0,335,175,65); //back
  buttonArray.push(backBtn);
  backBtn.innerHTML = "Back";
  backBtn.style.backgroundColor = "#000000";
  backBtn.style.color = "#FFFFFF";
  backBtn.style.font = "20px 'Arial'";
  backBtn.onmouseover = function(){
    backBtn.style.backgroundColor = "#FF0000";
  }
  backBtn.onmouseout = function(){
    backBtn.style.backgroundColor = "#000000";
  }
  backBtn.onclick = function(){
    cancelAllConfig();
    intro();
  }

  var applyBtn = canvasButton(175,335,175,65);
  buttonArray.push(applyBtn);
  applyBtn.innerHTML = "Apply";
  applyBtn.style.backgroundColor = "#000000";
  applyBtn.style.color = "#FFFFFF";
  applyBtn.style.font = "20px 'Arial'";
  applyBtn.onmouseover = function(){
    applyBtn.style.backgroundColor = "#008000";
  }
  applyBtn.onmouseout = function(){
    applyBtn.style.backgroundColor = "#000000";
  }
  applyBtn.onclick = function(){
    localStorage.colorType = colorType;
    localStorage.keysChar = keysChar;
    canvas.style.backgroundColor = colorArray[colorType];
    if(keyCode != []) localStorage.keyCode = keyCode;
    localStorage.reverse = rev;
    alert("The changes has been saved.");
  }

  function cancelAllConfig(){
    for(var i = 0; i < buttonArray.length; i++){
      canvasParent.removeChild(buttonArray[i]);
    }
    l2.clearRect(0,0,350,400);
    ctx.clearRect(0,0,350,400);
  }
}

//--選曲ページ--//
function selectMusic(){
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  var layer2 = document.getElementById("layer2");
  var l2 = layer2.getContext("2d");
  var canvasParent = document.getElementById("canvasParent");
  var div = createDiv();
  var menuDiv = document.createElement("div");
  canvasParent.appendChild(menuDiv);

  if(!sessionStorage.page) var page = 0;
  else var page = Number(sessionStorage.page);
  var width2 = [100,245,320];
  var width = [200,90,60];
  var list = "";
  var pack = "";
  var maxLength = 0; //該当譜面数
  var mrArr = [];  //musicRowArray createListで使用
  var url;
  if(sessionStorage.eventFlag) url = "./php/eventlist.php"
  else url = "./php/returnlist.php"

  if(!sessionStorage.ac){
    var acFlag = "Creator";
    sessionStorage.ac = acFlag;
  }else{
    var acFlag = sessionStorage.ac;
  }

  function loadScorelist(startIndex){
    var arr = new Array();
    for(var i = 0; i < 10; i++){
      if(maxLength > startIndex + i){
        arr.push(list[startIndex + i]);
      }else{
        if(i == 0){
          return false;
        }
        break;
      }
    }
    return arr;
  }

  ctx.clearRect(0,0,350,400);
  l2.clearRect(0,0,350,400);
  ctx.fillStyle = "#000000";
  ctx.fillRect(0,0,350,25);
  ctx.fillRect(0,375,350,25);
  l2.fillStyle = "#FFFFFF";
  l2.textAlign = "center";
  l2.font = "16px 'Arial'";
  l2.fillText("Title",width2[0]+5,18);
  l2.fillText(acFlag,width2[1],18);
  l2.fillText("Difficulty",width2[2],18);

  function checkLength(str,width){
    var i = 0;
    var string = "";
    var flag = false;
    str = str.toString();
    l2.font = "16px 'Arial'";
    while(l2.measureText(string).width < width){
      if(i == str.length) break;
      string += str[i];
      i++;
    }
    if(i != str.length) flag = l2.measureText(str).width;
    return flag;
  }

  function musicRow(pack,num){
    this.num = num;
    this.id = pack.id;
    this.creator = pack.creator;
    this.artist = pack.artist;

    var title = pack.title;
    var creator = pack.creator;
    var difficulty = Math.ceil(pack.difficulty);
    this.dispArray = [title,creator,difficulty];
  }

  musicRow.prototype.createRow = function(){
    var id = this.id;
    var num = this.num;
    var dispArray = this.dispArray;
    var artist = this.artist;
    var creator = this.creator;
    if(acFlag == "Artist") dispArray[1] = artist;
    var rowPlace = 25 + 32.5 * num;
    var row = canvasButton(10,rowPlace,340,32.5);

    var c0 = document.createElement("div"); //Title
    c0.className = "selectNormal";
    c0.style.backgroundColor = "transparent";
    c0.onmouseover = "";
    c0.onmouseout = "";
    c0.style.top = rowPlace;
    width[0] -= 10;
    c0.style.width = width[0] + "px";
    c0.style.left = 0;
    c0.style.font = "16px 'Arial'";
    c0.innerHTML = '<div class="normal" style="width:' + width[0] + 'px">' + dispArray[0] + '</div>';
    var c1 = c0.cloneNode(); //Creator
    this.c1 = c1;
    c1.style.width = width[1] + "px";
    c1.style.left = width[0] + "px";
    c1.innerHTML = '<div class="normal" style="width:' + width[1] + 'px">' + dispArray[1] + '</div>';
    var c2 = c0.cloneNode(); //Difficulty
    c2.style.width = width[2] + "px";
    c2.style.left = (width[0] + width[1]) + "px";
    c2.innerHTML = '<div class="normal" style="width:' + width[2] + 'px">' + dispArray[2] + '</div>';
    row.appendChild(c0);
    row.appendChild(c1);
    row.appendChild(c2);
    width[0] += 10;

    row.style.backgroundColor = "transparent";
    row.onmouseover = function(){
      row.style.backgroundColor = "#008000";
      width[0] -= 10;
      for(var i = 0; i < 3; i++){
        var pdl = checkLength(dispArray[i],width[i]);
        if(pdl){
          var node = row.childNodes[i].childNodes[0];
          node.className = "marquee";
          node.style.width = pdl + "px";
          node.style.paddingLeft = pdl + "px";
          row.childNodes[i].style.justifyContent = "flex-start";
        }
      }
      width[0] += 10;
    }
    row.onmouseout = function(){
      row.style.backgroundColor = "transparent";
      width[0] -= 10;
      for(var i = 0; i < 3; i++){
        var node = row.childNodes[i].childNodes[0];
        node.className = "normal";
        node.style.paddingLeft = 0;
        node.style.width = width[i] + "px";
        row.childNodes[i].style.justifyContent = "center";
      }
      width[0] += 10;
    }
    row.onclick = function(){
      ctx.clearRect(0,0,350,400);
      l2.clearRect(0,0,350,400);
      if(!localStorage.detail) localStorage.detail = [5,0,0];
      sessionStorage.id = id;
      canvasParent.removeChild(menuDiv);
      deleteDiv();
      optionSet();
      return false;
    }

    this.acChange = function(){
      if(acFlag == "Creator"){
        this.dispArray[1] = creator;
      }else{
        this.dispArray[1] = artist;
      }

      var acl = div.childNodes[num].childNodes[1].childNodes[0];
      acl.innerHTML = this.dispArray[1];
    }
  }

  function createList(){
    l2.clearRect(0,25,10,350);
    mrArr = [];
    for(var i = 0; i < 10; i++){
      if(pack[i]){
        mrArr.push(new musicRow(pack[i],i));
        mrArr[i].createRow();
        (function(j){
          idb("read",pack[j],star);
          function star(record){
            if(record.acc){
              var acc = record.acc;
              if(acc > 100) l2.fillStyle = "#FF0000";
              else if(acc == 100) l2.fillStyle = "#FFA500";
              else if(acc >= 98) l2.fillStyle = "#FFFF00";
              else if(acc >= 95) l2.fillStyle = "#0000FF";
              else if(acc < 95) l2.fillStyle = "#848484";
              l2.font = "16px 'Arial'";
              l2.fillText("★",5,45.5 + 32.5 * j);
            }
          }
        })(i);
      }
    }
  }

  //初期状態生成
  if(!sessionStorage.words){
    var req = new XMLHttpRequest();
    req.open("POST",url,false);
    req.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded' );
    req.send("chk=returnlist");
    var response  = req.responseText;
    list = JSON.parse(response);
    maxLength = list.length;
    pack = loadScorelist(page * 10);
    createList();
  }else{
    search(sessionStorage.words);
  }

  var prevBtn = canvasButton(0,375,116,25); //back
  menuDiv.appendChild(prevBtn);
  prevBtn.innerHTML = "Prev";
  prevBtn.style.backgroundColor = "#000000";
  prevBtn.style.color = "#FFFFFF";
  prevBtn.style.font = "16px 'Arial'";
  prevBtn.onmouseover = function(){
    prevBtn.style.backgroundColor = "#FFFF00";
  }
  prevBtn.onmouseout = function(){
    prevBtn.style.backgroundColor = "#000000";
  }
  prevBtn.onclick = function(){
    if(page != 0){
      page--;
      sessionStorage.page = page;
      pack = loadScorelist(page * 10);
      deleteDiv();
      div = createDiv();
      createList();
      l2.clearRect(0,25,350,350);
    }
  }

  var backBtn = canvasButton(116,375,118,25);
  menuDiv.appendChild(backBtn);
  backBtn.innerHTML = "Back";
  backBtn.style.backgroundColor = "#000000";
  backBtn.style.color = "#FFFFFF";
  backBtn.style.font = "16px 'Arial'";
  backBtn.onmouseover = function(){
    backBtn.style.backgroundColor = "#FF0000";
  }
  backBtn.onmouseout = function(){
    backBtn.style.backgroundColor = "#000000";
  }
  backBtn.onclick = function(){
    ctx.clearRect(0,0,350,400);
    l2.clearRect(0,0,350,400);
    canvasParent.removeChild(menuDiv);
    sessionStorage.removeItem("words");
    deleteDiv();
    intro();
    return false;
  }

  var nextBtn = canvasButton(234,375,116,25);
  menuDiv.appendChild(nextBtn);
  nextBtn.innerHTML = "Next";
  nextBtn.style.backgroundColor = "#000000";
  nextBtn.style.color = "#FFFFFF";
  nextBtn.style.font = "16px 'Arial'";
  nextBtn.onmouseover = function(){
    nextBtn.style.backgroundColor = "#FFFF00";
  }
  nextBtn.onmouseout = function(){
    nextBtn.style.backgroundColor = "#000000";
  }
  nextBtn.onclick = function(){
    if(loadScorelist((page + 1) * 10)){
      page++;
      sessionStorage.page = page;
      pack = loadScorelist(page * 10);
      deleteDiv();
      div = createDiv();
      createList();
      l2.clearRect(0,25,350,350);
    }
  }

  var acBtn = canvasButton(width[0],0,width[1],25);
  menuDiv.appendChild(acBtn);
  acBtn.innerHTML = "";
  acBtn.style.backgroundColor = "transparent";
  acBtn.onmouseover = function(){
    acBtn.style.backgroundColor = "transparent";
    l2.clearRect(width[0],0,width[1],25);
    l2.fillStyle = "#FFFF00";
    l2.fillText(acFlag,width2[1],18);
    l2.fillStyle = "#FFFFFF";
  }
  acBtn.onmouseout = function(){
    acBtn.style.backgroundColor = "transparent";
    l2.clearRect(width[0],0,width[1],25);
    l2.fillStyle = "#FFFFFF";
    l2.fillText(acFlag,width2[1],18);
  }
  acBtn.onclick = function(){
    if(acFlag == "Creator") acFlag = "Artist";
    else acFlag = "Creator";
    for(i = 0; i < mrArr.length; i++){
      mrArr[i].acChange();
    }
    sessionStorage.ac = acFlag;
    l2.clearRect(width[0],0,width[1],25);
    l2.fillStyle = "#FFFF00";
    l2.fillText(acFlag,width2[1],18);
  }

  var searchArea = document.createElement("textarea");
  searchArea.maxLength = 20;
  searchArea.rows = 1;
  searchArea.style.width = 175 + "px";
  searchArea.style.height = 25 + "px";
  searchArea.style.top = 350 + "px";
  searchArea.style.left = 0;
  searchArea.style.position = "absolute";
  searchArea.style.zIndex = 3;
  searchArea.style.lineHeight = 25 + "px";
  menuDiv.appendChild(searchArea);

  var searchBtn = canvasButton(175,350,175,25);
  menuDiv.appendChild(searchBtn);
  searchBtn.innerHTML = "Search";
  searchBtn.style.backgroundColor = "#000000";
  searchBtn.style.color = "#FFFFFF";
  searchBtn.style.font = "16px 'Arial'";
  searchBtn.onmouseover = function(){
    searchBtn.style.backgroundColor = "#0000FF";
  }
  searchBtn.onmouseout = function(){
    searchBtn.style.backgroundColor = "#000000";
  }
  searchBtn.onclick = function(){
    page = 0;
    search(searchArea.value);
  }
  function search(words){
    //var words = searchArea.value;
    sessionStorage.words = words;
    var wordsArr = words.split(" ");
    var wordsNum = wordsArr.length;
    
    var reg = /^".*"$/;
    var len = 0;
    function quote(word){
      if(reg.test(word)){
        len = word.length;
        word = word.substr(1,len-2);
      }
      return word;
    }

    var type = "";
    var word1 = "";
    var word2 = "";
    if(words == ""){
      type = "none";
    }else if(wordsNum == 1){
      word1 = words;
      if(isNaN(word1)){
        type = "word";
        word1 = quote(word1);
      }else{
        type = "num"
      }
    }else if(wordsNum == 2){
      word1 = wordsArr[0];
      word2 = wordsArr[1];
      if(isNaN(word1) || isNaN(word2)){
        type = "words";
        word1 = quote(word1);
        word2 = quote(word2);
      }else{
        type = "between";
      }
    }

    var req = new XMLHttpRequest();
    req.open("POST",url,true);
    var formData = new FormData();
    formData.append("chk","search");
    formData.append("type",type);
    formData.append("word1",word1);
    formData.append("word2",word2);
    req.onload = function(){
      var response  = req.responseText;
      list = JSON.parse(response);
      maxLength = list.length;
      pack = loadScorelist(page * 10);
      sessionStorage.page = page;
      deleteDiv();
      div = createDiv();
      createList();
      l2.clearRect(0,25,350,350);
    }
    req.send(formData);
  }
}


//--オプション設定--//
function optionSet(){
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  var layer2 = document.getElementById("layer2");
  layer2.setAttribute("tabindex",0);
  layer2.focus();
  var l2 = layer2.getContext("2d");
  var width = [87.5,262.5];

  var id = sessionStorage.id;
  var req = new XMLHttpRequest();
  var url = "./php/selectmusic.php"
  req.open("POST",url,false);
  req.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded' );
  req.send("chk=selectmusic&id=" + id);
  var response  = req.responseText;
  sessionStorage.pack = response;
  var pack = JSON.parse(response);
  var detail;
  var volume;

  ctx.clearRect(0,0,350,400);
  l2.clearRect(0,0,350,400);
  ctx.fillStyle = "#000000";
  ctx.fillRect(0,0,350,65);
  ctx.fillRect(0,335,350,65);
  for(var i = 0; i < 4; i++){
    ctx.fillRect(0,64.5 + 67.5 * i,350,1);
  }
  l2.fillStyle = "#FFFFFF";
  l2.textAlign = "center";
  l2.font = "14px 'Arial'";
  var heading = pack.title + " ★:" + Math.ceil(pack.difficulty);
  l2.fillText(heading,175,37);
  l2.font = "20px 'Arial'";
  l2.fillText("Back",width[0],372);
  l2.fillText("Start",width[1],372);
  l2.font = "24px 'Arial'";
  l2.fillText("Speed",width[0],107.5);
  l2.fillText("Timing",width[0],175);
  l2.fillText("Fadein",width[0],242.5);
  l2.fillText("Volume",width[0],310);
 
  if(!localStorage.detail){
    detail = [5,0,0];
    localStorage.detail = JSON.stringify(detail);
  }else{
    detail = JSON.parse("[" + localStorage.detail + "]");
  }
  if(!sessionStorage.volume){
    volume = 10;
  }else{
    volume = Number(sessionStorage.volume);
  }
  idb("read",{id:Number(id)},tmgRead);
    function tmgRead(res){
      if(res.timing){
        detail[1] = res.timing; //Timingの呼び出し
      }
      l2.fillStyle = "#FFFFFF";
      printInfo();
    }
  
  function printInfo(){
    l2.font = "20px 'Arial'";
    l2.fillText(detail[0],width[1],107.5);
    l2.fillText(detail[1],width[1],175);
    l2.fillText(detail[2] * 5 + "%",width[1],242.5);
    l2.fillText(volume,width[1],310);
  };
  
  l2.fillText("-",width[1]-30,107.5);
  l2.fillText("+",width[1]+30,107.5);
  l2.fillText("-",width[1]-30,175);
  l2.fillText("+",width[1]+30,175);
  l2.fillText("-",width[1]-30,242.5);
  l2.fillText("+",width[1]+30,242.5);
  l2.fillText("-",width[1]-30,310);
  l2.fillText("+",width[1]+30,310);

  var canvasParent = document.getElementById("canvasParent");
  var infoBtn = canvasButton(0,0,350,65);
  var flag = false;
  infoBtn.style.backgroundColor = "transparent";
  infoBtn.onmouseover = function(){
    l2.clearRect(0,0,350,65);
    l2.fillStyle = "#FFFF00";
    l2.textAlign = "center";
    l2.font = "14px 'Arial'";
    l2.fillText(heading,175,37);
  }
  infoBtn.onmouseout = function(){
    l2.clearRect(0,0,350,65);
    l2.fillStyle = "#FFFFFF";
    l2.textAlign = "center";
    l2.font = "14px 'Arial'";
    l2.fillText(heading,175,37);
  }
  infoBtn.onclick = function(){
    canvasParent.removeChild(infoBtn);
    canvasParent.appendChild(infoArea);
    flag = true;
  }

  var infoArea = document.createElement("textarea");
  infoArea.className = "infoArea";
  infoArea.readOnly = true;
  infoArea.wrap = "soft";
  infoArea.style.textAlign = "left";
  infoArea.style.font = "14px 'Arial'";
  infoArea.style.overflow = "scroll";
  var infoText = "";
  if(pack.time % 60 < 10) var sec = "0" + pack.time % 60;
  else var sec = pack.time % 60;
  var ms = Math.floor(pack.time / 60) + ":" + sec;
  if(!pack.minbpm) var bpm = pack.maxbpm;
  else var bpm = pack.minbpm + "-" + pack.maxbpm;
  infoText += "Information (Right-click to close.)\n\n";
  infoText += "ID\t\t: "         + pack.id + "\n";
  infoText += "Title\t\t: "      + pack.title + "\n";
  infoText += "Artist\t: "     + pack.artist + "\n";
  infoText += "Creator\t: "    + pack.creator + "\n";
  infoText += "Difficulty\t: " + pack.difficulty + "\n";
  infoText += "Notes\t: "      + pack.notes+ "\n";
  infoText += "Time\t: "       + ms + "\n";
  infoText += "BPM\t: "        + bpm + "\n";
  if(pack.music){
    var date = new Date(Number(pack.music));
    var ymd = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();
    infoText += "Date\t: "     + ymd + "\n";
  } 
  infoText += "-----Comment-----\n" + pack.comment;

  infoArea.value = infoText;
  infoArea.oncontextmenu = function(e){
    canvasParent.removeChild(infoArea);
    canvasParent.appendChild(infoBtn);
    flag = false;
    e.preventDefault();
  }

  function preserveTiming(){
    idb("write",{id:Number(id),timing:detail[1]},tmgWrite);
    function tmgWrite(res){
      if(res){
        res.timing = detail[1];
      }
      return res;
    }
  }
  
  var x = 0;
  var y = 0;
  var sign = ["-","+"];
  function changeColor(e){
    button = e.target.getBoundingClientRect();
    x = e.clientX - button.left;
    y = e.clientY - button.top;
    l2.font = "20px 'Arial'";
    for(var i = 0; i < 2; i++){
      for(var j = 0; j < 4; j++){
        if((Math.abs(x - (width[1] - 30 + i * 60)) < 10) && (Math.abs(y - (107.5 + 67.5 * j)) < 10)){
          l2.fillStyle = "#FFFF00";
          l2.fillText(sign[i],width[1] - 30 + i * 60, 107.5 + 67.5 * j);
        }else{
          l2.fillStyle = "#FFFFFF";
          l2.fillText(sign[i],width[1] - 30 + i * 60, 107.5 + 67.5 * j);
        }
      }
    }
    ctx.fillStyle = "#000000";
    ctx.fillRect(0,335,350,65)
    if((x > 10 && x < 170) && (y > 335 && y < 395)){
      ctx.fillStyle = "#FF0000";
      ctx.fillRect(0,335,174.5,65);
    }else if((x > 180 && x < 340) && (y > 335 && y < 395)){
      ctx.fillStyle = "#008800";
      ctx.fillRect(175.5,335,174.5,65);
    }
  }
  layer2.addEventListener("mousemove",changeColor,false);

  var kdevent2 = kdevent();
  var clickevent2 = clickevent();

  function kdevent(){
    return function g(e){
      if(e.keyCode == 13){
        layer2.removeEventListener("mousemove",changeColor,false);
        layer2.removeEventListener("click",clickevent2,false);
        layer2.removeEventListener("keydown",g,false);
        if(flag) canvasParent.removeChild(infoArea);
        else     canvasParent.removeChild(infoBtn);
        preserveTiming();
        localStorage.detail = detail;
        sessionStorage.volume = volume;
        initialize();
      }
    }
  }
  layer2.addEventListener("keydown",kdevent2,false);

  function clickevent(){
    return function f(){
      for(var i = 0; i < 2; i++){
        for(var j = 0; j < 4; j++){
          l2.clearRect(width[1] - 24, 92.5 + 67.5 * j, 48, 50) ;
          if((Math.abs(x - (width[1] - 30 + i * 60)) < 10) && (Math.abs(y - (107.5 + 67.5 * j)) < 10)){
            if(j == 3) volume = volume + Math.pow(-1,i+1);
            else detail[j] = detail[j] + Math.pow(-1,i+1);
            if(detail[0] <= 1)   detail[0] = 1;
            if(detail[0] >= 10)  detail[0] = 10;
            if(detail[1] <= -99) detail[1] = -99;
            if(detail[1] >= 99)  detail[1] = 99;
            if(detail[2] <= 0)   detail[2] = 0;
            if(detail[2] >= 19)  detail[2] = 19;
            if(volume    <= 1)   volume    = 1;
            if(volume    >= 10)  volume    = 10;
          }
        }
      }
      l2.fillStyle = "#FFFFFF";
      printInfo();

      if((x > 10 && x < 170) && (y > 335 && y < 395)){
        layer2.removeEventListener("mousemove",changeColor,false);
        layer2.removeEventListener("click",f,false);
        layer2.removeEventListener("keydown",kdevent2,false);
        if(flag) canvasParent.removeChild(infoArea);
        else     canvasParent.removeChild(infoBtn);
        selectMusic();
      }else if((x > 180 && x < 340) && (y > 335 && y < 395)){
        layer2.removeEventListener("mousemove",changeColor,false);
        layer2.removeEventListener("click",f,false);
        layer2.removeEventListener("keydown",kdevent2,false);
        if(flag) canvasParent.removeChild(infoArea);
        else     canvasParent.removeChild(infoBtn);
        preserveTiming();
        localStorage.detail = detail;
        sessionStorage.volume = volume;
        initialize();
      }
    }
  }
  layer2.addEventListener("click",clickevent2,false);
}