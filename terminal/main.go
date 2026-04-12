package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/exec"
	"sync"
	"sync/atomic"
	"time"

	"github.com/creack/pty"
	"github.com/gorilla/websocket"
)

const (
	maxSessions    = 20
	sessionTimeout = 10 * time.Minute
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMsgSize     = 4096
)

var (
	activeSessions int64
	upgrader       = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin:     func(r *http.Request) bool { return true },
	}
)

type resizeMsg struct {
	Type string `json:"type"`
	Cols uint16 `json:"cols"`
	Rows uint16 `json:"rows"`
}

func handleWS(w http.ResponseWriter, r *http.Request) {
	if atomic.LoadInt64(&activeSessions) >= maxSessions {
		http.Error(w, `{"error":"too many active sessions"}`, http.StatusServiceUnavailable)
		return
	}

	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("ws upgrade:", err)
		return
	}

	atomic.AddInt64(&activeSessions, 1)
	defer atomic.AddInt64(&activeSessions, -1)

	// lesson query param maps to a pre-configured workspace subdir
	lesson := sanitizeLesson(r.URL.Query().Get("lesson"))

	// Create PTY running bash
	cmd := exec.Command("/bin/bash", "--login")
	cmd.Dir = "/home/learner/workspace"
	cmd.Env = append(os.Environ(),
		"TERM=xterm-256color",
		"HOME=/home/learner",
		"SHELL=/bin/bash",
		"GOPHERLAB_LESSON="+lesson,
	)

	ptmx, err := pty.Start(cmd)
	if err != nil {
		log.Println("pty start:", err)
		ws.Close()
		return
	}

	pty.Setsize(ptmx, &pty.Winsize{Cols: 120, Rows: 36})

	// Cleanup — safe to call multiple times via sync.OnceFunc
	release := sync.OnceFunc(func() {
		log.Println("releasing session")
		ptmx.Close()
		ws.Close()
		if cmd.Process != nil {
			timer := time.AfterFunc(2*time.Second, func() { cmd.Process.Kill() })
			cmd.Process.Wait()
			timer.Stop()
		}
	})
	defer release()

	// Activity tracker for session timeout
	var lastActivity atomic.Value
	lastActivity.Store(time.Now())

	// done channel signals all goroutines to stop
	done := make(chan struct{})
	var closeOnce sync.Once
	signalDone := func() { closeOnce.Do(func() { close(done) }) }

	// Session timeout watcher
	go func() {
		ticker := time.NewTicker(30 * time.Second)
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				if time.Since(lastActivity.Load().(time.Time)) > sessionTimeout {
					log.Println("session timeout")
					signalDone()
					release()
					return
				}
			case <-done:
				return
			}
		}
	}()

	// Ping to keep WebSocket alive
	go func() {
		ticker := time.NewTicker(pingPeriod)
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				if err := ws.WriteControl(websocket.PingMessage, nil, time.Now().Add(writeWait)); err != nil {
					signalDone()
					release()
					return
				}
			case <-done:
				return
			}
		}
	}()

	// WS → PTY
	go func() {
		defer func() { signalDone(); release() }()
		ws.SetReadLimit(maxMsgSize)
		ws.SetReadDeadline(time.Now().Add(pongWait))
		ws.SetPongHandler(func(string) error {
			ws.SetReadDeadline(time.Now().Add(pongWait))
			return nil
		})
		for {
			msgType, msg, err := ws.ReadMessage()
			if err != nil {
				return
			}
			lastActivity.Store(time.Now())

			// Text messages may be resize commands
			if msgType == websocket.TextMessage {
				var rm resizeMsg
				if json.Unmarshal(msg, &rm) == nil && rm.Type == "resize" &&
					rm.Cols > 0 && rm.Cols <= 300 && rm.Rows > 0 && rm.Rows <= 100 {
					pty.Setsize(ptmx, &pty.Winsize{Cols: rm.Cols, Rows: rm.Rows})
					continue
				}
			}

			if _, err := ptmx.Write(msg); err != nil {
				return
			}
		}
	}()

	// PTY → WS (blocks until pty closes or error)
	buf := make([]byte, 4096)
	for {
		n, err := ptmx.Read(buf)
		if err != nil {
			return
		}
		lastActivity.Store(time.Now())
		ws.SetWriteDeadline(time.Now().Add(writeWait))
		if err := ws.WriteMessage(websocket.BinaryMessage, buf[:n]); err != nil {
			return
		}
	}
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8082"
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/ws", handleWS)
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	})

	log.Printf("Terminal service on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}

// sanitizeLesson validates the lesson param against the known set to prevent
// path traversal or injection via the query string.
var validLessons = map[string]bool{
	"tool-qualidade":                   true,
	"tool-performance":                 true,
	"deploy-docker-k8s":                true,
	"impl-cli":                         true,
	"impl-grpc":                        true,
	"impl-graphql":                     true,
	"opensource-primeira-contribuicao": true,
	"opensource-encontrando-projetos":  true,
	"opensource-issues-e-labels":       true,
	"opensource-comunicacao":           true,
}

func sanitizeLesson(s string) string {
	if validLessons[s] {
		return s
	}
	return ""
}
