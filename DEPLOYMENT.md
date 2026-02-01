# 🚀 Deployment Frontend NOTIFICAME en VPS Hostinger

## 📋 Archivos creados

- `Dockerfile` - Build multi-stage optimizado (Node 20 + Nginx Alpine)
- `nginx.conf` - Configuración para SPA con proxy pass a API
- `.dockerignore` - Optimización del build
- `environment.prod.ts` - Variables de producción
- `docker-compose.yml` - Orquestación completa (Mongo + API + Frontend)
- `deploy.sh` - Script automatizado de deployment

## 🔧 Configuración realizada

### Environment de Producción
- API URL: `http://76.13.229.224:5000/`
- Debug: `false`
- Configurado en `angular.json` para reemplazo automático

### Nginx
- Puerto 80 para el frontend
- Proxy pass `/api` → `http://webapi:5000`
- Cache optimizado para assets (1 año)
- Sin cache para `index.html`
- Compresión Gzip habilitada
- Headers de seguridad

### Docker
- Red compartida: `app_network`
- Frontend accesible en puerto 80
- API en puerto 5000
- MongoDB interno (sin exposición)

---

## 📦 Pasos para Deployment

### 1️⃣ Preparar el código en tu máquina local

```bash
# Asegúrate de que todos los archivos estén en tu repo
git add .
git commit -m "Add Docker configuration for deployment"
git push origin main
```

### 2️⃣ Conectar a tu VPS

```bash
ssh root@76.13.229.224
# o
ssh tu_usuario@76.13.229.224
```

### 3️⃣ Verificar que Docker esté instalado

```bash
docker --version
docker-compose --version
```

Si no están instalados:

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Reloguear para aplicar cambios de grupo
exit
# Volver a conectar por SSH
```

### 4️⃣ Clonar el repositorio del frontend

```bash
# Crear directorio para el proyecto
mkdir -p /home/notificame-frontend
cd /home/notificame-frontend

# Clonar tu repositorio (reemplaza con tu URL)
git clone https://github.com/TU_USUARIO/TU_REPO.git .
```

### 5️⃣ Construir la imagen Docker

```bash
# Esto puede tardar 5-10 minutos la primera vez
docker build -t notificame-frontend:latest .
```

### 6️⃣ Opción A: Iniciar con Docker Compose (RECOMENDADO)

Si quieres usar el docker-compose.yml completo que incluye MongoDB, API y Frontend:

```bash
# Detener servicios actuales si existen
docker-compose down

# Crear volumen para MongoDB si no existe
docker volume create mongo_data

# Crear archivo .env con tus credenciales
cat > .env << 'EOF'
MONGO_USERNAME=admin
MONGO_PASSWORD=TU_PASSWORD_SEGURO_AQUI
API_IMAGE_NAME=notificame-api
API_IMAGE_TAG=latest
EOF

# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### 6️⃣ Opción B: Iniciar solo el Frontend (si ya tienes backend corriendo)

```bash
# Detener y eliminar contenedor anterior si existe
docker stop frontend 2>/dev/null || true
docker rm frontend 2>/dev/null || true

# Iniciar el contenedor del frontend
docker run -d \
  --name frontend \
  --restart unless-stopped \
  --network app_network \
  -p 80:80 \
  notificame-frontend:latest

# Verificar que esté corriendo
docker ps | grep frontend

# Ver logs
docker logs -f frontend
```

### 7️⃣ Verificar el deployment

```bash
# Verificar que el contenedor esté corriendo
docker ps

# Ver logs del frontend
docker logs frontend

# Ver logs del backend (para verificar conexión)
docker logs webapi

# Probar conectividad interna
docker exec frontend curl -I http://webapi:5000
```

### 8️⃣ Abrir en el navegador

Accede a: **http://76.13.229.224**

---

## 🔍 Comandos útiles

### Ver logs
```bash
# Frontend
docker logs -f frontend

# Backend
docker logs -f webapi

# Todos los servicios (si usas docker-compose)
docker-compose logs -f
```

### Reiniciar servicios
```bash
# Solo frontend
docker restart frontend

# Todos (si usas docker-compose)
docker-compose restart
```

### Actualizar el frontend
```bash
cd /home/notificame-frontend
git pull origin main
docker build -t notificame-frontend:latest .
docker restart frontend
# o si usas docker-compose:
docker-compose up -d --build frontend
```

### Limpiar recursos
```bash
# Eliminar contenedores detenidos
docker container prune -f

# Eliminar imágenes sin usar
docker image prune -f

# Limpieza completa (cuidado!)
docker system prune -a -f
```

### Verificar red Docker
```bash
# Ver redes
docker network ls

# Inspeccionar la red app_network
docker network inspect app_network

# Ver qué contenedores están en la red
docker network inspect app_network | grep Name
```

---

## 🐛 Troubleshooting

### El frontend no se conecta al backend

```bash
# Verificar que ambos estén en la misma red
docker network inspect app_network

# Verificar variables de entorno del backend
docker exec webapi printenv | grep -i cors

# Probar conectividad desde el frontend al backend
docker exec frontend ping webapi
docker exec frontend curl http://webapi:5000
```

### Error 502 Bad Gateway en /api

```bash
# Verificar que el backend esté corriendo
docker ps | grep webapi

# Ver logs del backend
docker logs webapi

# Verificar configuración del proxy en nginx
docker exec frontend cat /etc/nginx/nginx.conf | grep -A 10 "location /api"
```

### El routing de Angular no funciona (404 en refresh)

```bash
# Verificar que nginx tenga el try_files correcto
docker exec frontend cat /etc/nginx/nginx.conf | grep try_files
# Debe mostrar: try_files $uri $uri/ /index.html;
```

### Problemas de permisos

```bash
sudo chown -R $USER:$USER /home/notificame-frontend
```

### Ver configuración de Nginx dentro del contenedor

```bash
docker exec frontend cat /etc/nginx/nginx.conf
```

---

## 🔐 Próximos pasos (HTTPS + Dominio)

Cuando quieras agregar HTTPS con Certbot:

1. **Configurar un dominio** apuntando a tu IP (76.13.229.224)
2. **Instalar Nginx en el host** (no en contenedor) como reverse proxy
3. **Instalar Certbot** para certificados SSL
4. **Configurar renovación automática**

Ejemplo de configuración Nginx host con SSL:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 📝 Notas importantes

1. **Actualiza el REPO_URL** en `deploy.sh` con tu repositorio real
2. **Cambia las credenciales de MongoDB** en producción
3. **Considera usar Docker secrets** para información sensible
4. **Configura backups automáticos** para el volumen de MongoDB
5. **Monitorea logs regularmente** con `docker logs`

---

## ✅ Checklist de deployment

- [ ] Archivos Docker creados y commiteados al repo
- [ ] Código pusheado a Git
- [ ] Conectado por SSH al VPS
- [ ] Docker y Docker Compose instalados
- [ ] Repositorio clonado en el VPS
- [ ] Imagen Docker construida exitosamente
- [ ] Red `app_network` existe y funciona
- [ ] Contenedor frontend corriendo en puerto 80
- [ ] Backend accesible desde el frontend
- [ ] CORS configurado correctamente
- [ ] Aplicación accesible desde http://76.13.229.224
- [ ] Routing de Angular funciona correctamente

---

¿Necesitas ayuda con algún paso específico? 🚀
