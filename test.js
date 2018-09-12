server {
    listen 80;
    server_name xxx.com;
    root "/path/public";

    index index.html index.htm index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
               set $cors "true";

       if ($request_method = 'OPTIONS') {
           set $cors "${cors}options";
       }

       if ($request_method = 'GET') {
           set $cors "${cors}get";
       }
       if ($request_method = 'POST') {
           set $cors "${cors}post";
       }
       if ($request_method = 'PUT') {
           set $cors "${cors}post";
       }
       if ($request_method = 'DELETE') {
           set $cors "${cors}post";
       }
       if ($cors = "trueget") {
           add_header 'Access-Control-Allow-Origin' "$http_origin" always;
           add_header 'Access-Control-Allow-Credentials' 'true';
       }

       if ($cors = "truepost") {
           add_header 'Access-Control-Allow-Origin' "$http_origin" always;
           add_header 'Access-Control-Allow-Credentials' 'true';
       }

       if ($cors = "trueoptions") {
           add_header 'Access-Control-Allow-Origin' "$http_origin" always;
           add_header 'Access-Control-Allow-Credentials' 'true';
           add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, PUT, DELETE';
           add_header 'Access-Control-Allow-Headers' 'Authorization,Content-Type,Accept,Origin,User-Agent,DNT,Cache-Control,X-Mx-ReqToken,Keep-Alive,X-Requested-With,If-Modified-Since';
           add_header 'Content-Length' 0;
           add_header 'Content-Type' 'text/plain charset=UTF-8';
           return 204;
       }
       
       include ./includes-apache.txt
        
    }

    

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    access_log off;
    #error_log  /var/log/nginx/xxx.com.log error;

    sendfile off;

    client_max_body_size 100m;

    location ~ \.php$ {
        fastcgi_split_path_info ^(.+\.php)(/.+)$;        

        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;

        fastcgi_intercept_errors off;
        fastcgi_buffer_size 16k;
        fastcgi_buffers 4 16k;
        fastcgi_connect_timeout 300;
        fastcgi_send_timeout 300;
        fastcgi_read_timeout 300;
    }
    
    listen 443 ssl;
    ssl_certificate ssl/certificate.pem;
    ssl_certificate_key ssl/key.pem;

}
