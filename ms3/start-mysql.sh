#!/bin/bash
#mkdir -p /var/lib/mysqld
#touch /var/lib/mysqld/mysqld.sock
#chown -R mysql /var/lib/mysqld
#service mysql restart
chown -R mysql:mysql /var/lib/mysql
service mysql start
service mysql start
