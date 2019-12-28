<?php
function selectmusic($id){
  // 接続
  $pdo = new PDO('sqlite:../../db/list.sqlite3');
  // SQL実行時にもエラーの代わりに例外を投げるように設定
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);    
  // デフォルトのフェッチモードを連想配列形式に設定 
  $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
  //結果を取得
  $stmt = $pdo->prepare('SELECT * FROM scoreList WHERE id = ?');
  $stmt->execute(array($id));
  $result = $stmt->fetchAll();

  //接続終了
  $pdo = "";
  
  $json = json_encode($result[0],JSON_UNESCAPED_UNICODE);
  echo $json;
}
if($_POST['chk'] == 'selectmusic'){
  selectmusic($_POST['id']);
}else{
  echo false;
}
?>