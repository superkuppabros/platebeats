<?php
function returnList($pst){
  // 接続
  $pdo = new PDO('sqlite:../../db/list.sqlite3');
  // SQL実行時にもエラーの代わりに例外を投げるように設定
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);    
  // デフォルトのフェッチモードを連想配列形式に設定 
  $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
  
  $start = 1537959600000;
  $end = 1538233200000;
  
  if($pst == 'returnlist'){
    $sql = "SELECT id,title,creator,artist,difficulty FROM scoreList WHERE music >= $start AND music <= $end ORDER BY id DESC";
    $stmt = $pdo->query($sql);
    $result = $stmt->fetchAll();
    $json = json_encode($result,JSON_UNESCAPED_UNICODE);
    echo $json;
  }else if($pst == 'countrow'){
    $sql = 'SELECT COUNT(*) FROM scoreList';
    $stmt = $pdo->query($sql);
    echo $stmt->fetchColumn();
  }else{
    $type = $_POST['type'];
    $sql = "SELECT id,title,creator,artist,difficulty FROM scoreList WHERE music >= $start AND music <= $end";
    //2018-09-26 20:00:00 = 1537959600000
    switch($type){
      case 'none':
        $sql .= ' ORDER BY id desc';
        $stmt = $pdo->query($sql);
        break;
      case 'word':
        $sql .= " AND (title LIKE :word1 OR creator LIKE :word1 OR artist LIKE :word1) ORDER BY id desc";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(array(':word1' => "%$_POST[word1]%"));
        break;
      case 'num':
        $sql .= ' AND difficulty BETWEEN ? AND ? ORDER BY difficulty desc';
        $num = intval($_POST['word1']);
        $stmt = $pdo->prepare($sql);
        $stmt->execute(array($num - 0.99, $num));
        break;
      case 'words':
        $sql .= " AND (title LIKE :word1 OR creator LIKE :word1 OR artist LIKE :word1)";
        $sql .= " AND (title LIKE :word2 OR creator LIKE :word2 OR artist LIKE :word2) ORDER BY id desc";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(array(':word1' => "%$_POST[word1]%",':word2' => "%$_POST[word2]%"));
        break;
      case 'between':
        $num1 = intval($_POST['word1']);
        $num2 = intval($_POST['word2']);
        if($num1 > $num2){
          $t = $num2;
          $num2 = $num1;
          $num1 = $t;
          $sql .= ' AND difficulty BETWEEN ? AND ? ORDER BY difficulty desc';
        }else{
          $sql .= ' AND difficulty BETWEEN ? AND ? ORDER BY difficulty asc';
        }
        $stmt = $pdo->prepare($sql);
        $stmt->execute(array($num1 - 0.99,$num2));
        break;
    }
    $result = $stmt->fetchAll();
    $json = json_encode($result,JSON_UNESCAPED_UNICODE);
    echo $json;  
  }
  
  //接続終了
  $pdo = "";
}

if($_POST["chk"] == "returnlist") returnList("returnlist");
else if($_POST["chk"] == "countrow") returnList("countrow");
else if($_POST["chk"] == "search") returnList("search");
?>