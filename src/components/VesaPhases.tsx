import React, { useState } from 'react';
import { VesaPhase, VesaContent, VESA_LABELS } from '../types';
import { useProgress } from '../context/ProgressContext';
import { LabEditor, LabEditorFile } from './LabEditor';

interface VesaPhasesProps {
  vesa: VesaContent;
  lessonId: string;
}

const PHASE_ORDER: VesaPhase[] = ['visaoGeral', 'experimentacao', 'socializacao', 'aplicacao'];

export function VesaPhases({ vesa, lessonId }: Readonly<VesaPhasesProps>) {
  const { progress, setCurrentPhase } = useProgress();
  const [activePhase, setActivePhase] = useState<VesaPhase>(progress.currentPhase ?? 'visaoGeral');

  const handlePhaseChange = (phase: VesaPhase) => {
    setActivePhase(phase);
    setCurrentPhase(phase);
  };

  const currentIndex = PHASE_ORDER.indexOf(activePhase);

  return (
    <div className="vesa-container">
      <div className="vesa-header">
        <h3>Ciclo de Aprendizado VESA</h3>
        <p className="vesa-subtitle">Visão Geral → Experimentação → Socialização → Aplicação</p>
      </div>

      {/* Phase Navigation Tabs */}
      <div className="vesa-tabs" role="tablist" aria-label="Fases do ciclo de aprendizado VESA">
        {PHASE_ORDER.map((phase, index) => {
          const info = VESA_LABELS[phase];
          const isActive = activePhase === phase;
          const isPast = index < currentIndex;

          return (
            <button
              key={phase}
              role="tab"
              aria-selected={isActive}
              aria-controls={`vesa-panel-${phase}`}
              id={`vesa-tab-${phase}`}
              className={`vesa-tab ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}`}
              onClick={() => handlePhaseChange(phase)}
            >
              <span className="vesa-tab-icon" aria-hidden="true">{info.icon}</span>
              <span className="vesa-tab-label">{info.label}</span>
              <span className="vesa-tab-step" aria-hidden="true">{index + 1}/4</span>
            </button>
          );
        })}
      </div>

      {/* Phase Content */}
      <div
        className="vesa-panel"
        role="tabpanel"
        id={`vesa-panel-${activePhase}`}
        aria-labelledby={`vesa-tab-${activePhase}`}
      >
        <div className="vesa-phase-description">
          <p>{VESA_LABELS[activePhase].description}</p>
        </div>

        {activePhase === 'visaoGeral' && (
          <VisaoGeralContent content={vesa.visaoGeral} />
        )}
        {activePhase === 'experimentacao' && (
          <ExperimentacaoContent content={vesa.experimentacao} lessonId={lessonId} />
        )}
        {activePhase === 'socializacao' && (
          <SocializacaoContent content={vesa.socializacao} />
        )}
        {activePhase === 'aplicacao' && (
          <AplicacaoContent content={vesa.aplicacao} lessonId={lessonId} />
        )}
      </div>

      {/* Phase Navigation */}
      <div className="vesa-nav">
        {currentIndex > 0 && (
          <button
            className="btn btn-secondary"
            onClick={() => handlePhaseChange(PHASE_ORDER[currentIndex - 1])}
          >
            ← {VESA_LABELS[PHASE_ORDER[currentIndex - 1]].label}
          </button>
        )}
        <div className="vesa-nav-spacer" />
        {currentIndex < PHASE_ORDER.length - 1 && (
          <button
            className="btn btn-primary"
            onClick={() => handlePhaseChange(PHASE_ORDER[currentIndex + 1])}
          >
            {VESA_LABELS[PHASE_ORDER[currentIndex + 1]].label} →
          </button>
        )}
      </div>
    </div>
  );
}

function VisaoGeralContent({ content }: Readonly<{ content: VesaContent['visaoGeral'] }>) {
  return (
    <div className="phase-content">
      <div className="explanation-block">
        <h4>Explicação</h4>
        <p>{content.explicacao}</p>
      </div>

      {content.codeExample && (
        <div className="code-block">
          <h4>Exemplo de código</h4>
          <pre>
            <code>{content.codeExample}</code>
          </pre>
        </div>
      )}

      {content.recursos.length > 0 && (
        <div className="resources-block">
          <h4>Recursos para estudo</h4>
          <ul>
            {content.recursos.map((url, i) => (
              <li key={i}>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {url.replace(/^https?:\/\//, '').split('/').slice(0, 2).join('/')}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const URL_REGEX = /https?:\/\/[^\s)>\]]+/g;

function renderWithLinks(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  URL_REGEX.lastIndex = 0;
  while ((match = URL_REGEX.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const url = match[0];
    parts.push(
      <a key={match.index} href={url} target="_blank" rel="noopener noreferrer">
        {url.replace(/^https?:\/\//, '')}
      </a>
    );
    last = match.index + url.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length > 0 ? <>{parts}</> : text;
}

// ---------------------------------------------------------------------------
// Shared Go code editor (reference + editable textarea + run + download)
// ---------------------------------------------------------------------------
interface GoCodeEditorProps {
  referenceCode?: string;
  referenceLabel: string;
  lessonId: string;
  downloadName: string;
}

function GoCodeEditor({ referenceCode, referenceLabel, lessonId: _lessonId, downloadName }: Readonly<GoCodeEditorProps>) {
  const [code, setCode] = React.useState('');
  const [running, setRunning] = React.useState(false);
  const [output, setOutput] = React.useState<{ text: string; isError: boolean } | null>(null);

  async function runCode() {
    if (!code.trim()) {
      setOutput({ text: 'O editor está vazio. Digite o código acima para executar.', isError: true });
      return;
    }
    setRunning(true);
    setOutput(null);
    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: code }),
      });
      const data = await res.json();
      if (data.errors) {
        setOutput({ text: data.errors, isError: true });
      } else {
        setOutput({ text: data.output || '(sem saída)', isError: false });
      }
    } catch {
      setOutput({ text: 'Erro ao conectar com o executor. Verifique a conexão.', isError: true });
    } finally {
      setRunning(false);
    }
  }

  function downloadCode() {
    if (!code.trim()) return;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${downloadName}.go`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="playground-section">
      {referenceCode && (
        <>
          <div className="playground-ref-header">
            <span>📖 {referenceLabel} — leia e <strong>digite</strong> no editor abaixo</span>
          </div>
          <pre
            className="playground-ref-code"
            aria-label="Código de referência — não copiável"
            onCopy={e => e.preventDefault()}
            onCut={e => e.preventDefault()}
          >
            <code>{referenceCode}</code>
          </pre>
        </>
      )}

      <div className="playground-header">
        <span className="playground-title">
          <span aria-hidden="true">🐹</span> Seu código
        </span>
        <div className="playground-toolbar">
          <button
            className="btn-play"
            onClick={runCode}
            disabled={running}
            aria-label="Executar código"
          >
            {running ? '⏳ Executando…' : '▶ Executar'}
          </button>
          <button
            className="btn-tool"
            onClick={downloadCode}
            disabled={!code.trim()}
            aria-label="Baixar arquivo .go"
          >
            ⬇ Baixar .go
          </button>
          <button
            className="btn-tool btn-tool-ghost"
            onClick={() => { setCode(''); setOutput(null); }}
            aria-label="Limpar editor"
          >
            ✕ Limpar
          </button>
        </div>
      </div>

      <textarea
        className="playground-editor"
        value={code}
        onChange={e => setCode(e.target.value)}
        spellCheck={false}
        aria-label="Editor de código Go"
        placeholder={'// Digite seu código aqui\npackage main\n\nimport "fmt"\n\nfunc main() {\n\t\n}'}
        rows={Math.max(12, code.split('\n').length + 2)}
      />

      {output && (
        <section
          className={`playground-output ${output.isError ? 'playground-output-error' : 'playground-output-ok'}`}
          aria-label={output.isError ? 'Erros de compilação' : 'Saída do programa'}
        >
          <div className="playground-output-label">
            {output.isError ? '✗ Erro' : '✓ Saída'}
          </div>
          <pre className="playground-output-text">{output.text}</pre>
        </section>
      )}
    </div>
  );
}

function ExperimentacaoContent({ content, lessonId }: Readonly<{ content: VesaContent['experimentacao']; lessonId: string }>) {
  return (
    <div className="phase-content">
      <div className="challenge-block">
        <h4>Desafio</h4>
        <p>{renderWithLinks(content.desafio)}</p>
      </div>

      <div className="tips-block">
        <h4>Dicas</h4>
        <ul>
          {content.dicas.map((dica, i) => (
            <li key={i}>{renderWithLinks(dica)}</li>
          ))}
        </ul>
      </div>

      <GoCodeEditor
        referenceCode={content.codeTemplate}
        referenceLabel="Template — ponto de partida"
        lessonId={lessonId}
        downloadName={`${lessonId}-exercicio`}
      />
    </div>
  );
}

const SOCIAL_PLATFORMS = [
  {
    label: 'X (Twitter)',
    icon: '𝕏',
    url: (tags: string) => `https://x.com/intent/post?text=${encodeURIComponent(tags)}`,
    color: '#000',
  },
  {
    label: 'Mastodon',
    icon: '🐘',
    url: () => 'https://mastodon.social/',
    color: '#6364ff',
  },
  {
    label: 'Bluesky',
    icon: '🦋',
    url: () => 'https://bsky.app/',
    color: '#0085ff',
  },
];

function SocializacaoContent({ content }: Readonly<{ content: VesaContent['socializacao'] }>) {
  const topic = content.sugestaoBlog ?? 'Go';
  const hashtags = `#100DaysOfCode #100DaysOfGo #golang ${content.hashtagsExtras ?? ''}`.trim();
  const postTemplate = `Dia X/100 do #100DaysOfCode #100DaysOfGo\n\n📚 Hoje aprendi: ${topic}\n💻 O que fiz: [descreva brevemente]\n🔗 Repositório: [link do GitHub]\n\n#golang ${content.hashtagsExtras ?? ''}`.trim();

  return (
    <div className="phase-content">
      {content.diasDesafio && (
        <div className="days-badge" aria-label={`Faixa do desafio: ${content.diasDesafio}`}>
          🗓️ {content.diasDesafio} — #100DaysOfCode
        </div>
      )}

      <div className="challenge-100days">
        <h4 className="challenge-100days-heading">🔥 #100DaysOfCode — Compartilhe seu progresso</h4>
        <div className="challenge-100days-body">
          <p className="challenge-100days-info">
            Programe <strong>pelo menos 1 hora por dia</strong> e poste sobre seu progresso usando{' '}
            <code>#100DaysOfCode</code>. A accountability pública acelera o aprendizado e conecta
            você com uma comunidade global de desenvolvedores.
          </p>

          <div className="challenge-post-template">
            <label htmlFor="post-template-text" className="challenge-label">
              📋 Template de post — copie, edite e publique:
            </label>
            <textarea
              id="post-template-text"
              className="post-template-textarea"
              defaultValue={postTemplate}
              rows={5}
              aria-label="Template de post para redes sociais"
            />
          </div>

          <div className="social-platforms">
            <p className="challenge-label">📣 Publicar em:</p>
            <div className="social-buttons">
              {SOCIAL_PLATFORMS.map(p => (
                <a
                  key={p.label}
                  href={p.url(hashtags)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-social"
                  style={{ '--social-color': p.color } as React.CSSProperties}
                  aria-label={`Abrir ${p.label}`}
                >
                  <span aria-hidden="true">{p.icon}</span> {p.label}
                </a>
              ))}
            </div>
          </div>

          {content.sugestaoBlog && (
            <div className="blog-suggestion">
              <p className="challenge-label">✍️ Escreva no seu blog:</p>
              <p className="blog-title-suggestion">"{content.sugestaoBlog}"</p>
              <div className="blog-platforms">
                <a
                  href="https://dev.to/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-blog"
                >
                  📝 Publicar no dev.to
                </a>
                <a
                  href="https://gohugo.io/getting-started/quick-start/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-blog btn-blog-secondary"
                >
                  ⚡ Blog com Hugo + GitHub Pages
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const STARTER_CODES: Record<string, string> = {
  'fundamentos-primeiros-passos': `package main

import "fmt"

func main() {
	nome := "Seu Nome"
	profissao := "Desenvolvedor Go"
	email := "voce@email.com"

	fmt.Printf("╔══════════════════════╗\\n")
	fmt.Printf("║ %-20s ║\\n", nome)
	fmt.Printf("║ %-20s ║\\n", profissao)
	fmt.Printf("║ %-20s ║\\n", email)
	fmt.Printf("╚══════════════════════╝\\n")
}`,

  'fundamentos-tipos': `package main

import (
	"fmt"
	"math"
)

func dividir(a, b float64) (float64, error) {
	if b == 0 {
		return 0, fmt.Errorf("divisão por zero")
	}
	return a / b, nil
}

func main() {
	a, b := 10.0, 3.0
	fmt.Printf("%.2f + %.2f = %.2f\\n", a, b, a+b)
	fmt.Printf("%.2f - %.2f = %.2f\\n", a, b, a-b)
	fmt.Printf("%.2f * %.2f = %.2f\\n", a, b, a*b)
	if r, err := dividir(a, b); err == nil {
		fmt.Printf("%.2f / %.2f = %.4f\\n", a, b, r)
	}
	fmt.Printf("√%.2f = %.4f\\n", a, math.Sqrt(a))
}`,

  'fundamentos-slices-maps': `package main

import (
	"fmt"
	"sort"
	"strings"
)

func contarPalavras(texto string) map[string]int {
	contagem := make(map[string]int)
	for _, p := range strings.Fields(strings.ToLower(texto)) {
		p = strings.Trim(p, ".,!?;:")
		if p != "" {
			contagem[p]++
		}
	}
	return contagem
}

func main() {
	texto := "Go é rápido Go é simples programar em Go é divertido"
	contagem := contarPalavras(texto)

	type kv struct {
		k string
		n int
	}
	pares := make([]kv, 0, len(contagem))
	for k, v := range contagem {
		pares = append(pares, kv{k, v})
	}
	sort.Slice(pares, func(i, j int) bool { return pares[i].n > pares[j].n })
	for _, p := range pares {
		fmt.Printf("%-15s %d\\n", p.k, p.n)
	}
}`,

  'fundamentos-controle': `package main

import (
	"bufio"
	"fmt"
	"math/rand"
	"os"
	"strconv"
	"strings"
)

func main() {
	secreto := rand.Intn(100) + 1
	scanner := bufio.NewScanner(os.Stdin)
	for i := 1; i <= 7; i++ {
		fmt.Printf("Tentativa %d/7: ", i)
		scanner.Scan()
		n, err := strconv.Atoi(strings.TrimSpace(scanner.Text()))
		if err != nil {
			fmt.Println("Número inválido!")
			i--
			continue
		}
		switch {
		case n < secreto:
			fmt.Println("Muito baixo! ↑")
		case n > secreto:
			fmt.Println("Muito alto! ↓")
		default:
			fmt.Printf("Correto! Era %d em %d tentativas\\n", secreto, i)
			return
		}
	}
	fmt.Printf("Game over! Era %d.\\n", secreto)
}`,

  'fundamentos-ponteiros': `package main

import "fmt"

type Node struct {
	valor   int
	proximo *Node
}

type Lista struct{ cabeca *Node }

func (l *Lista) Adicionar(v int) {
	novo := &Node{valor: v}
	if l.cabeca == nil {
		l.cabeca = novo
		return
	}
	atual := l.cabeca
	for atual.proximo != nil {
		atual = atual.proximo
	}
	atual.proximo = novo
}

func (l *Lista) Imprimir() {
	for n := l.cabeca; n != nil; n = n.proximo {
		fmt.Printf("%d", n.valor)
		if n.proximo != nil {
			fmt.Print(" → ")
		}
	}
	fmt.Println()
}

func main() {
	l := &Lista{}
	for _, n := range []int{1, 2, 3, 4, 5} {
		l.Adicionar(n)
	}
	l.Imprimir()
}`,

  'fundamentos-orientacao': `package main

import (
	"fmt"
	"math"
)

type Forma interface {
	Area() float64
	Perimetro() float64
	Nome() string
}

type Circulo struct{ R float64 }
type Retangulo struct{ L, A float64 }
type Triangulo struct{ A, B, C float64 }

func (c Circulo) Area() float64      { return math.Pi * c.R * c.R }
func (c Circulo) Perimetro() float64 { return 2 * math.Pi * c.R }
func (c Circulo) Nome() string       { return "Círculo" }

func (r Retangulo) Area() float64      { return r.L * r.A }
func (r Retangulo) Perimetro() float64 { return 2 * (r.L + r.A) }
func (r Retangulo) Nome() string       { return "Retângulo" }

func (t Triangulo) Area() float64 {
	s := (t.A + t.B + t.C) / 2
	return math.Sqrt(s * (s - t.A) * (s - t.B) * (s - t.C))
}
func (t Triangulo) Perimetro() float64 { return t.A + t.B + t.C }
func (t Triangulo) Nome() string       { return "Triângulo" }

func main() {
	formas := []Forma{Circulo{5}, Retangulo{4, 6}, Triangulo{3, 4, 5}}
	for _, f := range formas {
		fmt.Printf("%-12s  Área: %7.2f  Perímetro: %7.2f\\n",
			f.Nome(), f.Area(), f.Perimetro())
	}
}`,

  'pacotes-http-cliente': `package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type Endereco struct {
	CEP        string \`json:"cep"\`
	Logradouro string \`json:"logradouro"\`
	Bairro     string \`json:"bairro"\`
	Localidade string \`json:"localidade"\`
	UF         string \`json:"uf"\`
	Erro       bool   \`json:"erro"\`
}

func buscarCEP(cep string) (*Endereco, error) {
	resp, err := http.Get("https://viacep.com.br/ws/" + cep + "/json/")
	if err != nil {
		return nil, fmt.Errorf("requisição: %w", err)
	}
	defer resp.Body.Close()
	var end Endereco
	if err := json.NewDecoder(resp.Body).Decode(&end); err != nil {
		return nil, err
	}
	if end.Erro {
		return nil, fmt.Errorf("CEP não encontrado")
	}
	return &end, nil
}

func main() {
	for _, cep := range []string{"01310100", "20040020"} {
		end, err := buscarCEP(cep)
		if err != nil {
			fmt.Printf("%s: %v\\n", cep, err)
			continue
		}
		fmt.Printf("%s — %s, %s - %s/%s\\n",
			end.CEP, end.Logradouro, end.Bairro, end.Localidade, end.UF)
	}
}`,

  'pacotes-http-servidor': `package main

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
)

var tpl = template.Must(template.New("").Parse(\`<!DOCTYPE html>
<html><body>
<h1>{{.Titulo}}</h1>
<p>Visitas: {{.Visitas}}</p>
</body></html>\`))

type PageData struct {
	Titulo  string
	Visitas int
}

var visitas int

func homeHandler(w http.ResponseWriter, r *http.Request) {
	visitas++
	tpl.Execute(w, PageData{Titulo: "Servidor Go", Visitas: visitas})
}

func sobreHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "API Go — v1.0.0")
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/", homeHandler)
	mux.HandleFunc("/sobre", sobreHandler)
	fmt.Println("Rodando em http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", mux))
}`,

  'concorrencia-goroutines': `package main

import (
	"fmt"
	"sync"
	"time"
)

func sequencial(n int) {
	result := make([]int, n)
	for i := range result {
		time.Sleep(time.Millisecond)
		result[i] = i * i
	}
}

func concorrente(n int) {
	result := make([]int, n)
	var wg sync.WaitGroup
	for i := range result {
		wg.Add(1)
		go func(i int) {
			defer wg.Done()
			time.Sleep(time.Millisecond)
			result[i] = i * i
		}(i)
	}
	wg.Wait()
}

func medir(nome string, fn func(int), n int) {
	t := time.Now()
	fn(n)
	fmt.Printf("%-15s: %v\\n", nome, time.Since(t))
}

func main() {
	medir("Sequencial", sequencial, 20)
	medir("Concorrente", concorrente, 20)
}`,

  'concorrencia-channels': `package main

import (
	"fmt"
	"strings"
)

func gerador(palavras ...string) <-chan string {
	ch := make(chan string)
	go func() {
		defer close(ch)
		for _, p := range palavras {
			ch <- p
		}
	}()
	return ch
}

func maiusculas(in <-chan string) <-chan string {
	out := make(chan string)
	go func() {
		defer close(out)
		for p := range in {
			out <- strings.ToUpper(p)
		}
	}()
	return out
}

func filtroMin(in <-chan string, min int) <-chan string {
	out := make(chan string)
	go func() {
		defer close(out)
		for p := range in {
			if len(p) >= min {
				out <- p
			}
		}
	}()
	return out
}

func main() {
	pipeline := filtroMin(
		maiusculas(gerador("go", "é", "rápido", "simples", "incrível")),
		4,
	)
	for r := range pipeline {
		fmt.Println(r)
	}
}`,

  'concorrencia-patterns': `package main

import (
	"fmt"
	"sync"
	"time"
)

func worker(id int, jobs <-chan int, results chan<- string, wg *sync.WaitGroup) {
	defer wg.Done()
	for j := range jobs {
		time.Sleep(50 * time.Millisecond)
		results <- fmt.Sprintf("worker-%d processou tarefa %d", id, j)
	}
}

func main() {
	const nWorkers, nTarefas = 3, 9
	jobs := make(chan int, nTarefas)
	results := make(chan string, nTarefas)
	var wg sync.WaitGroup

	for i := 1; i <= nWorkers; i++ {
		wg.Add(1)
		go worker(i, jobs, results, &wg)
	}
	for i := 1; i <= nTarefas; i++ {
		jobs <- i
	}
	close(jobs)

	go func() { wg.Wait(); close(results) }()
	for r := range results {
		fmt.Println(r)
	}
}`,

  'apis-rest': `package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
)

type Item struct {
	ID   int    \`json:"id"\`
	Nome string \`json:"nome"\`
}

var (
	mu    sync.RWMutex
	itens = []Item{{1, "Gopher"}, {2, "Go Tool"}}
	next  = 3
)

func listar(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	mu.RLock()
	defer mu.RUnlock()
	json.NewEncoder(w).Encode(itens)
}

func criar(w http.ResponseWriter, r *http.Request) {
	var item Item
	if err := json.NewDecoder(r.Body).Decode(&item); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	mu.Lock()
	item.ID = next
	next++
	itens = append(itens, item)
	mu.Unlock()
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(item)
}

func main() {
	http.HandleFunc("GET /itens", listar)
	http.HandleFunc("POST /itens", criar)
	fmt.Println("API em http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}`,

  'testes-unitarios': `package main

import (
	"fmt"
	"strings"
)

func isPalindromo(s string) bool {
	s = strings.ToLower(strings.ReplaceAll(s, " ", ""))
	r := []rune(s)
	for i, j := 0, len(r)-1; i < j; i, j = i+1, j-1 {
		if r[i] != r[j] {
			return false
		}
	}
	return true
}

func fibonacci(n int) int {
	if n <= 1 {
		return n
	}
	return fibonacci(n-1) + fibonacci(n-2)
}

func reverter(s string) string {
	r := []rune(s)
	for i, j := 0, len(r)-1; i < j; i, j = i+1, j-1 {
		r[i], r[j] = r[j], r[i]
	}
	return string(r)
}

// Crie main_test.go e escreva table-driven tests para cada função!

func main() {
	fmt.Println("isPalindromo(racecar):", isPalindromo("racecar"))
	fmt.Println("isPalindromo(golang):", isPalindromo("golang"))
	for i := 0; i <= 8; i++ {
		fmt.Printf("fib(%d)=%d ", i, fibonacci(i))
	}
	fmt.Println()
	fmt.Println(reverter("olá mundo"))
}`,

  'banco-dados-sql': `package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

type Contato struct {
	ID    int
	Nome  string
	Email string
}

func main() {
	db, err := sql.Open("sqlite3", "./contatos.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	db.Exec(\`CREATE TABLE IF NOT EXISTS contatos (
		id    INTEGER PRIMARY KEY AUTOINCREMENT,
		nome  TEXT NOT NULL,
		email TEXT UNIQUE NOT NULL
	)\`)

	stmt, _ := db.Prepare("INSERT OR IGNORE INTO contatos (nome, email) VALUES (?, ?)")
	defer stmt.Close()
	stmt.Exec("Ada Lovelace", "ada@example.com")
	stmt.Exec("Alan Turing", "turing@example.com")

	rows, _ := db.Query("SELECT id, nome, email FROM contatos ORDER BY nome")
	defer rows.Close()
	for rows.Next() {
		var c Contato
		rows.Scan(&c.ID, &c.Nome, &c.Email)
		fmt.Printf("%d. %-20s %s\\n", c.ID, c.Nome, c.Email)
	}
}`,

  'erros-padroes': `package main

import (
	"errors"
	"fmt"
)

var ErrNaoEncontrado = errors.New("não encontrado")

type ErrValidacao struct {
	Campo  string
	Motivo string
}

func (e *ErrValidacao) Error() string {
	return fmt.Sprintf("campo %q inválido: %s", e.Campo, e.Motivo)
}

func buscar(id int) (string, error) {
	if id <= 0 {
		return "", &ErrValidacao{Campo: "id", Motivo: "deve ser positivo"}
	}
	if id > 10 {
		return "", fmt.Errorf("buscar(%d): %w", id, ErrNaoEncontrado)
	}
	return fmt.Sprintf("item-%d", id), nil
}

func main() {
	for _, id := range []int{-1, 5, 99} {
		r, err := buscar(id)
		if err != nil {
			var valErr *ErrValidacao
			switch {
			case errors.As(err, &valErr):
				fmt.Printf("id=%d → validação: %v\\n", id, valErr)
			case errors.Is(err, ErrNaoEncontrado):
				fmt.Printf("id=%d → não encontrado\\n", id)
			}
			continue
		}
		fmt.Printf("id=%d → %s\\n", id, r)
	}
}`,

  'erros-avancado': `package main

import (
	"errors"
	"fmt"
)

func validarCadastro(nome, email, senha string) error {
	var errs []error
	if nome == "" {
		errs = append(errs, fmt.Errorf("nome: campo obrigatório"))
	}
	if len(nome) > 50 {
		errs = append(errs, fmt.Errorf("nome: máximo 50 caracteres"))
	}
	if email == "" {
		errs = append(errs, fmt.Errorf("email: campo obrigatório"))
	}
	if len(senha) < 8 {
		errs = append(errs, fmt.Errorf("senha: mínimo 8 caracteres"))
	}
	return errors.Join(errs...)
}

func main() {
	casos := []struct{ nome, email, senha string }{
		{"", "", "123"},
		{"Ada Lovelace", "ada@example.com", "senha-segura-123"},
		{"", "sem@nome.com", "outrasenha123"},
	}
	for i, c := range casos {
		err := validarCadastro(c.nome, c.email, c.senha)
		fmt.Printf("Caso %d: ", i+1)
		if err == nil {
			fmt.Println("✓ válido")
		} else {
			fmt.Println("erros:\\n" + err.Error())
		}
		fmt.Println()
	}
}`,

  'gen-introducao': `package main

import "fmt"

type Stack[T any] struct{ items []T }

func (s *Stack[T]) Push(v T) { s.items = append(s.items, v) }
func (s *Stack[T]) Pop() (T, bool) {
	var zero T
	if len(s.items) == 0 {
		return zero, false
	}
	v := s.items[len(s.items)-1]
	s.items = s.items[:len(s.items)-1]
	return v, true
}

func Map[T, U any](s []T, fn func(T) U) []U {
	r := make([]U, len(s))
	for i, v := range s {
		r[i] = fn(v)
	}
	return r
}

func Filter[T any](s []T, fn func(T) bool) []T {
	var r []T
	for _, v := range s {
		if fn(v) {
			r = append(r, v)
		}
	}
	return r
}

func Reduce[T, U any](s []T, init U, fn func(U, T) U) U {
	acc := init
	for _, v := range s {
		acc = fn(acc, v)
	}
	return acc
}

func main() {
	st := &Stack[string]{}
	for _, w := range []string{"Go", "é", "incrível"} {
		st.Push(w)
	}
	for {
		v, ok := st.Pop()
		if !ok {
			break
		}
		fmt.Print(v, " ")
	}
	fmt.Println()

	nums := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
	pares := Filter(nums, func(n int) bool { return n%2 == 0 })
	dobros := Map(pares, func(n int) int { return n * 2 })
	soma := Reduce(dobros, 0, func(acc, n int) int { return acc + n })
	fmt.Println("Soma dos dobros dos pares:", soma)
}`,

  'gen-constraints': `package main

import (
	"fmt"
	"golang.org/x/exp/constraints"
)

func BinarySearch[T constraints.Ordered](sorted []T, target T) int {
	lo, hi := 0, len(sorted)-1
	for lo <= hi {
		mid := (lo + hi) / 2
		switch {
		case sorted[mid] == target:
			return mid
		case sorted[mid] < target:
			lo = mid + 1
		default:
			hi = mid - 1
		}
	}
	return -1
}

func MergeSort[T constraints.Ordered](slice []T) []T {
	if len(slice) <= 1 {
		return slice
	}
	mid := len(slice) / 2
	left := MergeSort(slice[:mid])
	right := MergeSort(slice[mid:])
	result := make([]T, 0, len(slice))
	for len(left) > 0 && len(right) > 0 {
		if left[0] <= right[0] {
			result, left = append(result, left[0]), left[1:]
		} else {
			result, right = append(result, right[0]), right[1:]
		}
	}
	return append(append(result, left...), right...)
}

func main() {
	nums := []int{64, 34, 25, 12, 22, 11, 90}
	sorted := MergeSort(nums)
	fmt.Println("Sorted:", sorted)
	fmt.Println("BinarySearch(25):", BinarySearch(sorted, 25))
	words := []string{"go", "rust", "python", "typescript"}
	fmt.Println("Sorted words:", MergeSort(words))
}`,

  'solid-principios': `package main

import "fmt"

// SRP
type Logger struct{}
func (l Logger) Log(msg string) { fmt.Println("[LOG]", msg) }

// ISP
type Notifier interface{ Notify(msg string) }

// DIP
type EmailNotifier struct{}
func (e EmailNotifier) Notify(msg string) { fmt.Println("📧", msg) }

type SMSNotifier struct{}
func (s SMSNotifier) Notify(msg string) { fmt.Println("📱", msg) }

type UserService struct {
	notifier Notifier
	logger   Logger
}

func (s UserService) Criar(email string) {
	s.logger.Log("criando: " + email)
	s.notifier.Notify("Bem-vindo, " + email)
}

func main() {
	UserService{notifier: EmailNotifier{}, logger: Logger{}}.Criar("ada@example.com")
	UserService{notifier: SMSNotifier{}, logger: Logger{}}.Criar("turing@example.com")
}`,

  'deploy-docker-k8s': `package main

import (
	"fmt"
	"net/http"
	"os"
	"time"
)

func healthHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, \`{"status":"ok","time":"%s"}\`, time.Now().Format(time.RFC3339))
}

func rootHandler(w http.ResponseWriter, r *http.Request) {
	host, _ := os.Hostname()
	fmt.Fprintf(w, \`{"message":"Olá do container Go!","host":"%s"}\`, host)
}

// Dockerfile multistage:
// FROM golang:1.22-alpine AS builder
// WORKDIR /app
// COPY . .
// RUN CGO_ENABLED=0 go build -o server .
// FROM scratch
// COPY --from=builder /app/server /server
// EXPOSE 8080
// CMD ["/server"]

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	http.HandleFunc("/", rootHandler)
	http.HandleFunc("/health", healthHandler)
	fmt.Println("Rodando na porta", port)
	http.ListenAndServe(":"+port, nil)
}`,
};

function AplicacaoContent({ content, lessonId }: Readonly<{ content: VesaContent['aplicacao']; lessonId: string }>) {
  const { isLessonCompleted, completeLesson, uncompleteLesson } = useProgress();
  const completed = isLessonCompleted(lessonId);
  const repoSlug = lessonId.replace(/[^a-z0-9]+/g, '-');

  const starterBody = content.starterCode ?? STARTER_CODES[lessonId] ?? `package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hello, Go!")\n}`;
  const initialFiles: LabEditorFile[] = content.labFiles && content.labFiles.length > 0
    ? content.labFiles
    : [{ name: 'main.go', body: starterBody }];

  return (
    <div className="phase-content">
      <div className="project-block">
        <h4>Projeto prático</h4>
        <p>{content.projeto}</p>
      </div>

      <div className="requirements-block">
        <h4>Requisitos</h4>
        <ul>
          {content.requisitos.map((req, i) => (
            <li key={i}>{req}</li>
          ))}
        </ul>
      </div>

      <div className="criteria-block">
        <h4>Critérios de avaliação</h4>
        <ul>
          {content.criterios.map((crit, i) => (
            <li key={i}>{crit}</li>
          ))}
        </ul>
      </div>

      <LabEditor initialFiles={initialFiles} projectSlug={repoSlug} />

      {/* GitHub section */}
      <div className="github-section">
        <h4 className="github-section-title">
          <span aria-hidden="true">📦</span> Versione seu aprendizado no GitHub
        </h4>
        <ol className="github-steps">
          <li>
            <strong>Crie um repositório</strong> em{' '}
            <a href="https://github.com/new" target="_blank" rel="noopener noreferrer">github.com/new</a>{'. Sugestão de nome: '}<code>aprenda-go-{repoSlug}</code>
          </li>
          <li>
            <strong>Inicialize o módulo Go</strong> na pasta do projeto:
            <pre className="github-code-snippet">{`mkdir aprenda-go-${repoSlug} && cd aprenda-go-${repoSlug}
git init
go mod init github.com/SEU_USUARIO/aprenda-go-${repoSlug}`}</pre>
          </li>
          <li>
            <strong>Copie seus arquivos</strong> e faça o primeiro commit:
            <pre className="github-code-snippet">{`git add .
git commit -m "feat: ${content.projeto.slice(0, 50)}"`}</pre>
          </li>
          <li>
            <strong>Conecte ao GitHub</strong>:
            <pre className="github-code-snippet">{`git remote add origin https://github.com/SEU_USUARIO/aprenda-go-${repoSlug}.git
git branch -M main
git push -u origin main`}</pre>
          </li>
          <li>
            A cada novo exercício: <code>git commit -m "dia X/100: [o que aprendeu]"</code>
          </li>
        </ol>
        <div className="github-links">
          <a href="https://github.com/new" target="_blank" rel="noopener noreferrer" className="btn-github">
            <span aria-hidden="true">🐙</span> Criar repositório
          </a>
          <a href="https://docs.github.com/pt/get-started/quickstart/create-a-repo" target="_blank" rel="noopener noreferrer" className="btn-github btn-github-secondary">
            📖 Guia GitHub (pt-BR)
          </a>
          <a href="https://education.github.com/git-cheat-sheet-education.pdf" target="_blank" rel="noopener noreferrer" className="btn-github btn-github-secondary">
            📋 Git Cheat Sheet
          </a>
        </div>
      </div>

      <div className="completion-block">
        <button
          className={`btn ${completed ? 'btn-completed' : 'btn-primary'} btn-large`}
          onClick={() => completed ? uncompleteLesson(lessonId) : completeLesson(lessonId)}
          aria-pressed={completed}
        >
          {completed ? '✓ Aula concluída — clique para desmarcar' : 'Marcar aula como concluída'}
        </button>
      </div>
    </div>
  );
}
