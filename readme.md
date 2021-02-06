to run this project : 

1 -  git clone https://github.com/berchj/ESDA.git wherever you want to run this project
--
2 -  npm install to get the dependencies
--
3 -  create the database 'ESDA' on mysql -> "CREATE DATABASE ESDA;"
--
4 -  import the databasedump -> 'mysql -u ${user} -p ESDA < ESDA.sql 
--
5 -  in /lib/pool put your user and password of your mysql-server
--
6 -  run 'npm run test' to start 
--
7 -  go to localhost:7200
--