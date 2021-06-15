<?php
function modifyscore($id,$pwd){
  // 接続
  $pdo = new PDO('sqlite:../../db/list.sqlite3');
  // SQL実行時にもエラーの代わりに例外を投げるように設定
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);    
  // デフォルトのフェッチモードを連想配列形式に設定 
  $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
  //結果を取得

  $stmt = $pdo->prepare('SELECT * FROM password WHERE id = ?');
  $stmt->execute(array($id));
  $password = $stmt->fetchAll();
  $stmt = $pdo->prepare('SELECT * FROM scoreList WHERE id = ?');
  $stmt->execute(array($id));
  $result = $stmt->fetchAll();

  //接続終了
  $pdo = "";
  
  if(password_verify($pwd,$password[0]['pwd'])){
    echo json_encode($result[0],JSON_UNESCAPED_UNICODE);
  }else{
    echo 'false';
  }
}

if($_POST['chk'] == 'certificate'){
  modifyscore($_POST['id'],$_POST['pwd']);
}
?>