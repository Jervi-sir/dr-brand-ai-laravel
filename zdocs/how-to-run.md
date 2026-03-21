### websocket laravel inretia react 
https://medium.com/@iamsuman066/realtime-chat-application-in-laravel-12-and-react-with-inertia-js-7b7777e289b3


### how to run server all

php artisan serve --host 0.0.0.0 --port 6080
npm run dev
php artisan reverb:start --port 6081

php artisan queue:work

php artisan config:clear
php artisan queue:clear

### pm2 
sudo npm install -g pm2

pm2 start --name dr-brand-ai-laravel "php artisan serve --host 0.0.0.0 --port 6080" 
pm2 start --name dr-brand-ai-laravel "php artisan octane:start --host 0.0.0.0 --port 6080"

pm2 start --name dr-brand-ai-laravel-reverb "php artisan reverb:start --port 6081" 

pm2 start --name dr-brand-ai-laravel-queue "php artisan queue:work" 


### Better with Supervisor
sudo apt install supervisor -y

--- Server
sudo nano /etc/supervisor/conf.d/dr-ai-octane.conf
```
[program:dr-ai-octane]
process_name=%(program_name)s
command=php /home/jervi/projects/dr-brand-ai-laravel/artisan octane:start --server=swoole --host=127.0.0.1 --port=6080 --workers=4 --max-requests=500
directory=/home/jervi/projects/dr-brand-ai-laravel
autostart=true
autorestart=true
user=jervi
redirect_stderr=true
stdout_logfile=/var/log/supervisor/dr-ai-octane.log
stopwaitsecs=30
```
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start dr-ai-octane
sudo supervisorctl status dr-ai-octane

--- Reverb
sudo nano /etc/supervisor/conf.d/dr-ai-reverb.conf
```
[program:dr-ai-reverb]
process_name=%(program_name)s
command=php /home/jervi/projects/dr-brand-ai-laravel/artisan reverb:start --port=6081
directory=/home/jervi/projects/dr-brand-ai-laravel
autostart=true
autorestart=true
user=jervi
redirect_stderr=true
stdout_logfile=/var/log/dr-ai-reverb.log
stopwaitsecs=10
```
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start dr-ai-reverb

sudo supervisorctl status dr-ai-reverb

--- Worker
sudo nano /etc/supervisor/conf.d/dr-ai-queue.conf
```
[program:dr-ai-queue]
process_name=%(program_name)s
command=php /home/jervi/projects/dr-brand-ai-laravel/artisan queue:work --timeout=3600 --tries=1
directory=/home/jervi/projects/dr-brand-ai-laravel
autostart=true
autorestart=true
numprocs=1
user=jervi
redirect_stderr=true
stdout_logfile=/var/log/dr-ai-queue.log
stopwaitsecs=10
```
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start dr-ai-queue

sudo supervisorctl status dr-ai-queue