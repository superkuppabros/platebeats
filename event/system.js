function change(){
  const menu = document.getElementById("menu");
  const title = document.getElementById("title");
  const sentence = document.getElementById("sentence");
  const container = document.getElementById("container");
  
  const height = Math.max(menu.clientHeight,sentence.clientHeight)+title.clientHeight + 10;     
  container.style.height = height + "px";
}

function init(){
  change();
  window.addEventListener("resize",function(e){
    change();
  })
}

function unfold(){
  var obj = document.getElementById('open').style;
  obj.display = (obj.display=='none')?'block':'none';
  change();
}