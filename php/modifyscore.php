<?php
function submitscore($chk,$arr,$pwd){
  try{
    // 接続
    $pdo = new PDO('sqlite:../../db/list.sqlite3');
    // SQL実行時にもエラーの代わりに例外を投げるように設定
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // デフォルトのフェッチモードを連想配列形式に設定
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    //結果を取得
    $id = $arr['id'];
    if($chk == 'modify1'){
      $stmt = $pdo->prepare(
        'UPDATE scoreList SET
          title = ?,
          creator = ?,
          artist = ?,
          comment = ? WHERE id = ?');
      $stmt->bindValue(1,$arr['title'],PDO::PARAM_STR);
      $stmt->bindValue(2,$arr['creator'],PDO::PARAM_STR);
      $stmt->bindValue(3,$arr['artist'],PDO::PARAM_STR);
      $stmt->bindValue(4,$arr['comment'],PDO::PARAM_STR);
      $stmt->bindValue(5,$id,PDO::PARAM_INT);
      $stmt->execute();
    }else{
      $stmt = $pdo->prepare(
        'UPDATE scoreList SET
          title = ?,
          creator = ?,
          difficulty = ?,
          artist = ?,
          time = ?,
          maxbpm = ?,
          minbpm = ?,
          notes = ?,
          comment = ? WHERE id = ?');
      $stmt->bindValue(1,$arr['title'],PDO::PARAM_STR);
      $stmt->bindValue(2,$arr['creator'],PDO::PARAM_STR);
      $stmt->bindValue(3,$arr['difficulty'],PDO::PARAM_STR);
      $stmt->bindValue(4,$arr['artist'],PDO::PARAM_STR);
      $stmt->bindValue(5,$arr['time'],PDO::PARAM_INT);
      $stmt->bindValue(6,$arr['maxbpm'],PDO::PARAM_INT);
      $stmt->bindValue(7,$arr['minbpm'],PDO::PARAM_INT);
      $stmt->bindValue(8,$arr['notes'],PDO::PARAM_INT);
      $stmt->bindValue(9,$arr['comment'],PDO::PARAM_STR);
      $stmt->bindValue(10,$id,PDO::PARAM_INT);
      $stmt->execute();
    }

    $stmt2 = $pdo->prepare('DELETE FROM password WHERE id = ?');
    $stmt2->execute(array($id));
    $stmt2 = $pdo->prepare('INSERT INTO password values(?,?)');
    $pwdHash = password_hash($pwd, PASSWORD_DEFAULT);
    $stmt2->bindValue(1,$id,PDO::PARAM_INT);
    $stmt2->bindValue(2,$pwdHash,PDO::PARAM_STR);
    $stmt2->execute();

    //接続終了
    $pdo = "";
    echo "修正完了しました!";
    return $id;
  }catch(PDOException $e){
    $error = $e->getMessage();
    echo $error;
  }
}
$chk = $_POST['chk'];
if($chk == ('modify1' || 'modify2' || 'modify3')){
  //$flag = file_put_contents('../music/temp.mp3',$_POST['audio']);
  if($chk == 'modify3'){
    $flag = move_uploaded_file($_FILES['audio']['tmp_name'],'../music/temp.mp3');
  }else{
    $flag = true;
  }
  if($flag){
    if($chk != 'modify1'){
      file_put_contents('../data/temp.txt',urldecode($_POST['txt']));
    }
    $arr = json_decode(urldecode($_POST['list']),true);
    $pwd = urldecode($_POST['pwd']);
    $id = submitscore($chk,$arr,$pwd);
    $rid = str_pad($id, 6, 0, STR_PAD_LEFT);
    if($chk != 'modify1'){
      rename('../data/temp.txt',"../data/{$rid}.txt");
    }
    if($chk == 'modify3'){
      rename('../music/temp.mp3',"../music/{$rid}.mp3");
    }

  }else{
    echo "File has some problems.";
  }
}else{
  echo "You don't have the right to access this page.";
}
?>