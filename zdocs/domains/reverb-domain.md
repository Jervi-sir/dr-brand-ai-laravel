[6081] dr-ai-reverb.jervi.dev

sudo nano /etc/nginx/sites-available/dr-ai-reverb.jervi.dev

```
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}
server {
    server_name dr-ai-reverb.jervi.dev;

    # 🔓 allow larger requests (pick a size you’re comfy with)
    client_max_body_size 25M;
    client_body_buffer_size 256k;
    client_body_timeout 300s;

    location / {
        proxy_pass http://localhost:6081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
                # 🧠 streaming uploads to upstream (don’t buffer at Nginx)
        proxy_request_buffering off;

        # (optional) if buffering is on, don’t spill to temp files
        proxy_max_temp_file_size 0;

        # timeouts for slow mobile networks
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;

        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;

        proxy_http_version 1.1;
        proxy_set_header Upgrade    $http_upgrade;
        proxy_set_header Connection $connection_upgrade;

    }

    listen 443 ssl; # managed by Certbot

}

server {
    if ($host = dr-ai-reverb.jervi.dev) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    server_name dr-ai-reverb.jervi.dev;
    return 404; # managed by Certbot
}
```
sudo ln -s /etc/nginx/sites-available/dr-ai-reverb.jervi.dev /etc/nginx/sites-enabled/ 
sudo nginx -t 
sudo systemctl restart nginx 
sudo certbot --nginx -d dr-ai-reverb.jervi.dev 
sudo nano /etc/nginx/sites-available/dr-ai-reverb.jervi.dev

