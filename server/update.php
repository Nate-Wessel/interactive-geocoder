<?php
#quickly return json containing randomly selected OD points from server-side DB

require 'config.php';

# connect to DB
$connection = pg_connect($DBconnectionString);

# get the GET variables. We know what to expect, so 
# there is little checking needed
$uid		=	pg_escape_literal($_POST['uid']);
$region    = pg_escape_literal($_POST['region']);
$country   = pg_escape_literal($_POST['country']);
$province  = pg_escape_literal($_POST['province']);
$city      = pg_escape_literal($_POST['city']);

$query = "SELECT * FROM places WHERE uid = $uid;";
pg_query($connection,$query);

# close the connection
pg_close($connection);

?>
