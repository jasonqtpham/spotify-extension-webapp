# Spotify Full-Stack Kubernetes Deployment (Kind + Docker + Node.js + Vite)

This guide explains how to containerize your **Vite frontend** and
**Node.js backend**, load them into a **Kind Kubernetes cluster**, apply
secrets, deployments, and services, and port-forward everything so you
can run the project locally.

## 1. Requirements

-   Docker Desktop
-   Kind
-   kubectl

## 2. Dockerizing the Project

```
docker build -t <tagname> <context of docker file>
```
### Frontend Dockerfile

``` dockerfile
# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve
FROM node:20-alpine AS run
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
```

### Backend Dockerfile

``` dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV PORT=5001
EXPOSE 5001
CMD ["npm", "start"]
```

## 3. Create Kind Cluster

```
kind create cluster --config .\kind-cluster.yaml --name <cluster-name>

``` yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
  - role: worker
  - role: worker
```

Add roles to workers so deployment.yaml can figure out which node to put which pod
```
kubectl label node <cluster-name>-worker role=backend
kubectl label node <cluster-name>-worker2 role=frontend
```

## 4. Load Images
```
kind load docker-image <username>/spotify-frontend:1.0 --name <cluster name>
kind load docker-image <username>/spotify-backend:1.0 --name <cluster name>
```
## 5. Secrets

For this application you want to encode your secrets in base64 and put it in a secrets.yaml file within backend/k8s

``` yaml
apiVersion: v1
kind: Secret
metadata:
  name: backend-secrets
type: Opaque
data:
  permissions.json: <base64>
  CLIENT_ID: <base64>
  CLIENT_SECRET: <base64>
```
## 6. Deployment & Service config files

The config files are already made here but if you want an example of a command that can create a base template is 
```
kubectl create deployment frontend --image=jasonqtpham/spotify-frontend:latest --replicas=1 --dry-run=client -o yaml > frontend-deployment.yaml

kubectl expose deployment frontend --port=80 --target-port=5173 --type=ClusterIP --dry-run=client -o yaml > frontend-service.yaml
```

Next is to apply these files with 

```
kubectl apply -f secrets.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

## 8. Check Resources
```
kubectl get pods
kubectl get svc
kubectl describe pod <pod>
kubectl logs <pod>
```
## 9. Port Forwarding
In this project we do not have ingress setup and will be portforwarding to access the services within our localhost browser
```
kubectl port-forward svc/backend-svc 5001:5001
kubectl port-forward svc/frontend-svc 5173:80
```
## 10. Delete Cluster
```
kind delete cluster --name <cluster name>
```