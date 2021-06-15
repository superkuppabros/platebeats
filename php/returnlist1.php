<?php
function returnList($pst){
  // 接続
  $pdo = new PDO('sqlite:../data/list.sqlite3');
  // SQL実行時にもエラーの代わりに例外を投げるように設定
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);    
  // デフォルトのフェッチモードを連想配列形式に設定 
  $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
  //結果を取得
  if($pst == "returnlist"){
    $sql = 'SELECT id,title,creator,artist,difficulty FROM scoreList ORDER BY id DESC';
    $stmt = $pdo->query($sql);
    $result = $stmt->fetchAll();
    $json = json_encode($result,JSON_UNESCAPED_UNICODE);
    echo $json;
  }else{
    $sql = 'SELECT COUNT(*) FROM scoreList';
    $stmt = $pdo->query($sql);
    echo $stmt->fetchColumn();
  }
  
  //接続終了
  $pdo = "";
}

if($_POST["chk"] == "returnlist") returnList("returnlist");
else if($_POST["chk"] == "countrow") returnList("countrow")
?>