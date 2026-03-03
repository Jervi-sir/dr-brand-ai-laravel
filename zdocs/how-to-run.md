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

pm2 start --name dr-ai-laravel "php artisan serve --host 0.0.0.0 --port 6080" 
pm2 start --name dr-ai-laravel "php artisan octane:start --host 0.0.0.0 --port 6080"

pm2 start --name dr-ai-laravel-reverb "php artisan reverb:start --port 6081" 

pm2 start --name dr-ai-laravel-queue "php artisan queue:work" 
