-- Garante que o usuário tenha todos os privilégios
GRANT ALL PRIVILEGES ON myeconomy.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON myeconomy.* TO 'root'@'localhost';
FLUSH PRIVILEGES; 