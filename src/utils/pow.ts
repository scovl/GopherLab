interface Challenge {
  nonce: string;
  difficulty: number;
}

interface PowSolution {
  nonce: string;
  solution: string;
}

async function sha256(message: string): Promise<ArrayBuffer> {
  const data = new TextEncoder().encode(message);
  return crypto.subtle.digest('SHA-256', data);
}

function hasLeadingZeroBits(buffer: ArrayBuffer, bits: number): boolean {
  const view = new Uint8Array(buffer);
  let remaining = bits;
  for (const byte of view) {
    if (remaining >= 8) {
      if (byte !== 0) return false;
      remaining -= 8;
    } else if (remaining > 0) {
      const mask = 0xff << (8 - remaining);
      return (byte & mask) === 0;
    } else {
      break;
    }
  }
  return remaining <= 0;
}

export async function solveChallenge(): Promise<PowSolution> {
  const res = await fetch('/api/challenge');
  if (!res.ok) throw new Error('Falha ao obter desafio');
  const { nonce, difficulty } = (await res.json()) as Challenge;

  // Solve PoW: find a number N such that SHA-256(nonce + N) has `difficulty` leading zero bits
  for (let i = 0; ; i++) {
    const attempt = String(i);
    const hash = await sha256(nonce + attempt);
    if (hasLeadingZeroBits(hash, difficulty)) {
      return { nonce, solution: attempt };
    }
    // Yield to the main thread every 1000 iterations to prevent UI freeze
    if (i % 1000 === 999) {
      await new Promise(r => setTimeout(r, 0));
    }
  }
}
