# Stage 1: test-runner — used by `docker compose --profile test run --rm runner-test`
# Also acts as a gate: builder stage copies a sentinel from here so tests
# must pass before the production binary is compiled.
FROM golang:1.23-alpine AS test-runner
WORKDIR /app
COPY go.mod ./
COPY *.go ./
RUN mkdir -p /tmp/gocache /tmp/gopath /sandbox
ENV SANDBOX_BASE=/sandbox
# Run tests at build time so any failure aborts the image build.
# Integration tests invoke `go run` internally; the toolchain is available
# in this image, and GOCACHE/GOPATH are configured by handleRun itself.
RUN CGO_ENABLED=0 go test -v -timeout 120s ./... && touch /tests-passed
CMD ["go", "test", "-v", "-timeout", "120s", "./..."]

# Stage 2: build the runner binary (depends on test-runner via sentinel copy)
FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY go.mod ./
COPY *.go ./
# Enforce tests-passed gate: this COPY fails if the test stage failed
COPY --from=test-runner /tests-passed /tests-passed
RUN CGO_ENABLED=0 go build -o /runner .

# Stage 3: runtime image WITH Go (needed to compile/run user code)
FROM golang:1.23-alpine
WORKDIR /app

RUN adduser -D -u 1001 runner && \
    mkdir -p /tmp/gocache /tmp/gopath /sandbox && \
    chown -R runner:runner /tmp/gocache /tmp/gopath /sandbox

ENV SANDBOX_BASE=/sandbox

COPY --from=builder /runner /runner

USER runner

# Pre-warm stdlib build cache so user's first run is fast
RUN printf 'module sandbox\n\ngo 1.23\n' > /tmp/go.mod && \
    printf 'package main\nimport "fmt"\nfunc main(){fmt.Println("ok")}\n' > /tmp/main.go && \
    GOCACHE=/tmp/gocache GOPATH=/tmp/gopath GOPROXY=off go run /tmp/main.go && \
    rm /tmp/go.mod /tmp/main.go

EXPOSE 8081
CMD ["/runner"]
