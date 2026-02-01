#!/bin/bash

# Script de deployment para NOTIFICAME Frontend
# VPS: 76.13.229.224

echo "=========================================="
echo "  NOTIFICAME - Deployment Frontend"
echo "=========================================="

# Variables
REPO_URL="TU_REPOSITORIO_GIT_AQUI"  # Cambia esto por tu repo
APP_DIR="/home/notificame-frontend"
IMAGE_NAME="notificame-frontend"

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}[1/6]${NC} Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker no está instalado. Instalando...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

echo -e "${BLUE}[2/6]${NC} Clonando/Actualizando repositorio..."
if [ -d "$APP_DIR" ]; then
    echo "Repositorio existe, actualizando..."
    cd $APP_DIR
    git pull origin main
else
    echo "Clonando repositorio..."
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi

echo -e "${BLUE}[3/6]${NC} Construyendo imagen Docker..."
docker build -t $IMAGE_NAME:latest .

echo -e "${BLUE}[4/6]${NC} Deteniendo contenedor anterior (si existe)..."
docker stop frontend 2>/dev/null || true
docker rm frontend 2>/dev/null || true

echo -e "${BLUE}[5/6]${NC} Iniciando contenedor..."
docker run -d \
  --name frontend \
  --restart unless-stopped \
  --network app_network \
  -p 80:80 \
  $IMAGE_NAME:latest

echo -e "${BLUE}[6/6]${NC} Limpiando imágenes antiguas..."
docker image prune -f

echo ""
echo -e "${GREEN}=========================================="
echo "  ✓ Deployment completado con éxito"
echo "========================================${NC}"
echo ""
echo "Frontend disponible en: http://76.13.229.224"
echo ""
echo "Comandos útiles:"
echo "  - Ver logs: docker logs -f frontend"
echo "  - Reiniciar: docker restart frontend"
echo "  - Detener: docker stop frontend"
echo ""
