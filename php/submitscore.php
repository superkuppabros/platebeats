<?php
function submitscore($arr,$pwd){
  try{
    // 接続
    $pdo = new PDO('sqlite:../../db/list.sqlite3');
    // SQL実行時にもエラーの代わりに例外を投げるように設定
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // デフォルトのフェッチモードを連想配列形式に設定
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    //結果を取得
    $stmt = $pdo->prepare('INSERT INTO scoreList values(?,?,?,?,?,?,?,?,?,?,?)');
    $stmt->bindValue(1,$arr['id'],PDO::PARAM_INT);
    $stmt->bindValue(2,$arr['title'],PDO::PARAM_STR);
    $stmt->bindValue(3,$arr['creator'],PDO::PARAM_STR);
    $stmt->bindValue(4,$arr['difficulty'],PDO::PARAM_STR);
    $stmt->bindValue(5,$arr['music'],PDO::PARAM_INT);
    $stmt->bindValue(6,$arr['artist'],PDO::PARAM_STR);
    $stmt->bindValue(7,$arr['time'],PDO::PARAM_INT);
    $stmt->bindValue(8,$arr['maxbpm'],PDO::PARAM_INT);
    $stmt->bindValue(9,$arr['minbpm'],PDO::PARAM_INT);
    $stmt->bindValue(10,$arr['notes'],PDO::PARAM_INT);
    $stmt->bindValue(11,$arr['comment'],PDO::PARAM_STR);
    $stmt->execute();

    $stmt2 = $pdo->prepare('INSERT INTO password(pwd) values(?)');
    $pwdHash = password_hash($pwd, PASSWORD_DEFAULT);
    $stmt2->bindValue(1,$pwdHash,PDO::PARAM_STR);
    $stmt2->execute();
    $stmt3 = $pdo->query('SELECT id FROM scoreList WHERE ROWID = last_insert_rowid()');
    $id = $stmt3->fetchAll()[0]['id'];
    //接続終了
    $pdo = "";
    echo "登録完了しました! Twitterに投稿しますか?";
    return $id;
  }catch(PDOException $e){
    $error = $e->getMessage();
    echo $error;
  }
}
if($_POST['chk'] == 'submitscore'){
  //$flag = file_put_contents('../music/temp.mp3',$_POST['audio']);
  $flag = move_uploaded_file($_FILES['audio']['tmp_name'],'../music/temp.mp3');
  if($flag){
    file_put_contents('../data/temp.txt',urldecode($_POST['txt']));
    $arr = json_decode(urldecode($_POST['list']),true);
    $pwd = urldecode($_POST['pwd']);
    $id = submitscore($arr,$pwd);
    $rid = str_pad($id, 6, 0, STR_PAD_LEFT);
    rename('../music/temp.mp3',"../music/{$rid}.mp3");
    rename('../data/temp.txt',"../data/{$rid}.txt");
  }else{
    //echo "File has some problems.";
    echo $_FILES['audio']['size'];
  }
}else{
  echo "You don't have the right to access this page.";
}
?>