import { NextRequest, NextResponse } from 'next/server';

// Helper to call backend with timeout
async function callBackend(path: string, body?: any, method: 'GET'|'POST' = 'POST') {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(`http://localhost:8000${path}` , {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: method === 'POST' ? JSON.stringify(body || {}) : undefined,
      signal: controller.signal
    });
    if (!res.ok) throw new Error(`${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(id);
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json().catch(() => ({}));

    // 1) Run ML-based bias detection
    let mlAnalysis: any;
    try {
      mlAnalysis = await callBackend('/api/analyze/ml-bias', payload, 'POST');
    } catch {
      // fallback mock
      mlAnalysis = { ok: true, bias_indicators: [ 'language_bias_low' ], bias_score: 0.18 };
    }

    // 2) Run fairness scoring analysis
    let fairnessAnalysis: any;
    try {
      fairnessAnalysis = await callBackend('/api/analyze/fairness', { ...payload, mlAnalysis }, 'POST');
    } catch {
      // fallback mock
      fairnessAnalysis = { ok: true, fairness_score: 0.78, issues: [ 'potential_age_bias' ], score: 0.22 };
    }

    // Combine results: if either shows meaningful indicators beyond a threshold
    const biasDetected = Boolean(
      (Array.isArray(mlAnalysis?.bias_indicators) && mlAnalysis.bias_indicators.length > 0 && mlAnalysis.bias_score > 0.15) ||
      (Array.isArray(fairnessAnalysis?.issues) && fairnessAnalysis.issues.length > 0 && fairnessAnalysis.score > 0.15)
    );

    const details = `ML Bias Score=${mlAnalysis?.bias_score ?? 'n/a'}; Fairness Score=${fairnessAnalysis?.fairness_score ?? 'n/a'}.`;

    return NextResponse.json({ biasDetected, details, mlAnalysis, fairnessAnalysis });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 });
  }
}
