import { Module } from '../../types';

export const deployModule: Module = {
  id: 'deploy',
  title: 'Deploy',
  description: 'Docker multistage, cross-compilation, Kubernetes e deploy em produção.',
  icon: 'Cloud',
  color: '#3498DB',
  lessons: [
    {
      id: 'deploy-docker-k8s',
      title: 'Docker, Cross-compilation e Kubernetes',
      description: 'Multistage build, imagens mínimas, cross-comp e Kubernetes manifests.',
      estimatedMinutes: 55,
      vesa: {
        visaoGeral: {
          explicacao: 'Go compila em binário estático — perfeito para containers. Multistage build: estágio 1 compila com golang:, estágio 2 usa scratch ou distroless (imagem < 20MB). `CGO_ENABLED=0` garante binário estático. Cross-compilation: `GOOS=linux GOARCH=amd64 go build`. Kubernetes orquestra com deployments, services e ingress. Health checks via /health endpoint.',
          codeExample: '# Dockerfile multistage\nFROM golang:1.22 AS builder\nWORKDIR /app\nCOPY go.mod go.sum ./\nRUN go mod download\nCOPY . .\nRUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /server ./cmd/server\n\nFROM scratch\nCOPY --from=builder /server /server\nEXPOSE 8080\nCMD ["/server"]\n\n# Resultado: imagem < 15MB\n\n# Cross-compilation local:\n# GOOS=linux GOARCH=amd64 go build -o server-linux\n# GOOS=darwin GOARCH=arm64 go build -o server-mac\n# GOOS=windows GOARCH=amd64 go build -o server.exe',
          recursos: [
            'https://docs.docker.com/build/building/multi-stage/',
            'https://kubernetes.io/docs/home/',
          ],
        },
        experimentacao: {
          desafio: 'Crie Dockerfile multistage para uma API Go, compare tamanho (golang:alpine vs scratch). Depois, crie manifests K8s: Deployment + Service + Ingress.',
          dicas: [
            '-ldflags="-s -w" reduz tamanho do binário (~30%)',
            'scratch: mínimo absoluto, sem shell nem ferramentas',
            'distroless: sem shell mas com certificados TLS',
            'Kubernetes: liveness e readiness probes no /health',
          ],
        },
        socializacao: {
          discussao: 'Por que Go é tão popular em cloud-native?',
          pontos: [
            'Binário estático = imagem Docker tiny',
            'Cross-compilation simplifica CI multi-plataforma',
            'Kubernetes, Docker, Terraform, Prometheus — todos escritos em Go',
          ],
          diasDesafio: 'Dias 97–100',
          sugestaoBlog: 'Deploy Go: Docker multistage, cross-compilation e Kubernetes',
          hashtagsExtras: '#golang #docker #kubernetes #devops',
        },
        aplicacao: {
          projeto: 'Deploy completo: Dockerfile otimizado + manifests Kubernetes + health checks.',
          requisitos: [
            'Dockerfile multistage com scratch/distroless',
            'Deployment + Service + Ingress YAML',
            'Health check endpoints (/health, /ready)',
          ],
          criterios: ['Imagem < 20MB', 'Deploy funcional', 'Health checks operacionais'],
        },
      },
    },
  ],
};
