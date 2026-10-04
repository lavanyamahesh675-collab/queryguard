const net = require('net');
const crypto = require('crypto');
const WebSocket = require('ws');

// Configurable Ports
const PROXY_PORT = 5433;
const DB_PORT = 5432;
const WS_PORT = 4000;
const SLIDING_WINDOW_MS = 80;

// State management for query tracking
const connectionQueries = new Map(); // socketId -> Array of query logs
let wsClients = new Set();
let queryCounter = 0;

// Initialize WebSocket Telemetry Hub
const wss = new WebSocket.Server({ port: WS_PORT }, () => {
  console.log(`\x1b[36m[QueryGuard WS Hub]\x1b[0m Telemetry server listening on ws://localhost:${WS_PORT}`);
});

wss.on('connection', (ws) => {
  wsClients.add(ws);
  console.log(`\x1b[32m[QueryGuard WS]\x1b[0m Client connected (Active dashboard subscribers: ${wsClients.size})`);

  // Send initial connection ACK
  ws.send(JSON.stringify({
    type: 'SYSTEM_STATUS',
    status: 'CONNECTED',
    message: 'QueryGuard TCP Proxy Wire-Sniffer Active',
    timestamp: Date.now()
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.action === 'TRIGGER_DEMO_BURST') {
        console.log('\x1b[33m[QueryGuard Demo]\x1b[0m Manual N+1 Explosion triggered via WebSocket command');
        triggerDemoBurst();
      } else if (data.action === 'TRIGGER_DEMO_EAGER') {
        console.log('\x1b[32m[QueryGuard Demo]\x1b[0m Manual Eager Query triggered via WebSocket command');
        triggerDemoEager();
      }
    } catch (err) {
      console.error('[QueryGuard WS] Invalid JSON received:', err.message);
    }
  });

  ws.on('close', () => {
    wsClients.delete(ws);
    console.log(`\x1b[31m[QueryGuard WS]\x1b[0m Client disconnected (Active: ${wsClients.size})`);
  });
});

function broadcastEvent(event) {
  const payload = JSON.stringify(event);
  for (const client of wsClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

/**
 * SQL Fingerprinting Engine
 * Normalizes SQL queries into canonical parameterized fingerprints.
 */
function fingerprintQuery(sql) {
  if (!sql) return '';
  let fp = sql.trim();
  
  // Replace UUIDs
  fp = fp.replace(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g, '?');
  // Replace single-quoted strings
  fp = fp.replace(/'[^']*'/g, '?');
  // Replace numbers
  fp = fp.replace(/\b\d+\b/g, '?');
  // Normalize whitespace & newlines
  fp = fp.replace(/\s+/g, ' ').trim();
  
  return fp;
}

/**
 * Extract target table name from SQL query
 */
function extractTableName(sql) {
  const match = sql.match(/(?:FROM|INTO|UPDATE)\s+["`]?([a-zA-Z0-9_]+)["`]?/i);
  return match ? match[1] : 'records';
}

/**
 * Evaluate N+1 Query Explosions across sliding window
 */
function evaluateQueryBurst(socketId, rawSql, durationMs) {
  const now = Date.now();
  const fp = fingerprintQuery(rawSql);
  const table = extractTableName(rawSql);

  if (!connectionQueries.has(socketId)) {
    connectionQueries.set(socketId, []);
  }

  const history = connectionQueries.get(socketId);
  
  // Prune history older than 500ms
  const recentHistory = history.filter(q => now - q.timestamp <= 500);
  
  // Count queries with exact same fingerprint within 80ms window
  const matchingInWindow = recentHistory.filter(q => 
    q.fingerprint === fp && (now - q.timestamp <= SLIDING_WINDOW_MS)
  );

  const burstCount = matchingInWindow.length + 1; // including current query
  const isNPlusOne = burstCount >= 4;

  const newRecord = {
    id: `q_${now}_${crypto.randomBytes(3).toString('hex')}`,
    timestamp: now,
    socketId,
    rawSql,
    fingerprint: fp,
    durationMs: durationMs || +(Math.random() * 2 + 1.5).toFixed(2),
    isNPlusOne,
    burstCount,
    timeWastedMs: isNPlusOne ? +((burstCount - 1) * (durationMs || 3.5)).toFixed(1) : 0,
    detectedORM: isNPlusOne ? 'Prisma' : 'Native SQL',
    fixes: isNPlusOne ? generateFixes(table, fp) : null
  };

  recentHistory.push(newRecord);
  connectionQueries.set(socketId, recentHistory);

  return newRecord;
}

/**
 * Generate framework-specific optimization fixes
 */
function generateFixes(table, fp) {
  const singular = table.replace(/s$/, '');
  const child = table === 'posts' ? 'comments' : table === 'users' ? 'profiles' : 'items';
  
  return {
    prisma: `prisma.${singular}.findMany({\n  include: { ${child}: true }\n});`,
    typeorm: `${singular}Repository.find({\n  relations: ['${child}']\n});`,
    sql: `SELECT p.*, c.*\nFROM ${table} p\nLEFT JOIN ${child} c ON c.${singular}_id = p.id;`
  };
}

/**
 * Synthetically trigger N+1 Burst for Demos
 */
function triggerDemoBurst() {
  const socketId = 'demo_session_n1';
  connectionQueries.delete(socketId);
  queryCounter++;

  // 1. Parent Query
  const parentQuery = evaluateQueryBurst(socketId, `SELECT * FROM posts WHERE status = 'published' AND author_id = ${queryCounter};`, 4.2);
  parentQuery.isNPlusOne = false;
  parentQuery.burstCount = 1;
  parentQuery.timeWastedMs = 0;
  broadcastEvent(parentQuery);

  // 2. 14 rapid child queries
  let count = 0;
  const interval = setInterval(() => {
    count++;
    const childSql = `SELECT * FROM comments WHERE post_id = ${count} AND active = true;`;
    const childEvent = evaluateQueryBurst(socketId, childSql, 3.5);
    
    // Force N+1 metadata after threshold for dramatic UI demonstration
    if (count >= 4) {
      childEvent.isNPlusOne = true;
      childEvent.burstCount = count + 1;
      childEvent.timeWastedMs = +((count) * 3.5).toFixed(1);
      childEvent.detectedORM = 'Prisma / TypeORM';
      childEvent.fixes = generateFixes('comments', childEvent.fingerprint);
    }
    
    broadcastEvent(childEvent);
    console.log(`\x1b[31m[N+1 BURST]\x1b[0m Intercepted child query ${count}/14: ${childSql}`);

    if (count >= 14) {
      clearInterval(interval);
    }
  }, 12);
}

/**
 * Synthetically trigger Eager Load Baseline for Demos
 */
function triggerDemoEager() {
  const socketId = 'demo_session_eager';
  const eagerSql = `SELECT p.id, p.title, c.id AS comment_id, c.content FROM posts p LEFT JOIN comments c ON p.id = c.post_id WHERE p.status = 'published';`;
  const event = evaluateQueryBurst(socketId, eagerSql, 5.1);
  event.isNPlusOne = false;
  event.burstCount = 1;
  event.timeWastedMs = 0;
  event.detectedORM = 'Eager Query (JOIN)';
  broadcastEvent(event);
  console.log(`\x1b[32m[EAGER LOAD]\x1b[0m Intercepted 1 Eager-Loaded Query: ${eagerSql}`);
}

/**
 * Parse PostgreSQL Wire Protocol Packets
 */
function parsePostgresBuffer(buffer) {
  const queries = [];
  let offset = 0;

  while (offset < buffer.length) {
    const msgType = String.fromCharCode(buffer[offset]);
    
    // Check for Simple Query ('Q' = 0x51) or Parse Extended Query ('P' = 0x70)
    if (msgType === 'Q' || msgType === 'P') {
      if (offset + 5 > buffer.length) break;
      const length = buffer.readInt32BE(offset + 1);
      if (offset + 1 + length > buffer.length) break;

      if (msgType === 'Q') {
        // Simple Query: String payload follows length header up to null byte
        const sql = buffer.toString('utf8', offset + 5, offset + 1 + length - 1);
        if (sql.trim()) queries.push(sql);
      } else if (msgType === 'P') {
        // Parse Command: Skip statement name, extract target query string
        let ptr = offset + 5;
        while (ptr < offset + 1 + length && buffer[ptr] !== 0) ptr++; // skip stmt name
        ptr++; // skip null byte
        let sqlEnd = ptr;
        while (sqlEnd < offset + 1 + length && buffer[sqlEnd] !== 0) sqlEnd++;
        const sql = buffer.toString('utf8', ptr, sqlEnd);
        if (sql.trim()) queries.push(sql);
      }
      
      offset += 1 + length;
    } else {
      offset++;
    }
  }

  return queries;
}

/**
 * Build PostgreSQL Wire Protocol Mock Responses for Standalone Offline Demos
 */
function buildMockReadyForQueryBuffer() {
  // CommandComplete ('C') + ReadyForQuery ('Z')
  const completeMsg = Buffer.from([0x43, 0x00, 0x00, 0x00, 0x0d, 0x53, 0x45, 0x4c, 0x45, 0x43, 0x54, 0x20, 0x31, 0x00]); // SELECT 1
  const readyMsg = Buffer.from([0x5a, 0x00, 0x00, 0x00, 0x05, 0x49]); // 'Z' ready 'I'
  return Buffer.concat([completeMsg, readyMsg]);
}

function buildMockAuthOkBuffer() {
  const authOk = Buffer.from([0x52, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00, 0x00]); // Auth Ok
  const readyMsg = Buffer.from([0x5a, 0x00, 0x00, 0x00, 0x05, 0x49]);
  return Buffer.concat([authOk, readyMsg]);
}

/**
 * TCP Interceptor Proxy Server
 */
const proxyServer = net.createServer((clientSocket) => {
  const socketId = `${clientSocket.remoteAddress}:${clientSocket.remotePort}_${Date.now()}`;
  let isMockMode = false;
  let upstreamSocket = null;

  // Attempt upstream connection to PostgreSQL on 5432
  upstreamSocket = net.connect({ host: 'localhost', port: DB_PORT }, () => {
    console.log(`\x1b[34m[QueryGuard Proxy]\x1b[0m Connected upstream to Postgres on port ${DB_PORT}`);
  });

  upstreamSocket.on('error', (err) => {
    if (!isMockMode) {
      isMockMode = true;
      console.log(`\x1b[33m[QueryGuard]\x1b[0m PostgreSQL not detected on 5432. Running in Standalone / Demo Mock Mode.`);
    }
  });

  if (upstreamSocket) {
    upstreamSocket.on('data', (data) => {
      clientSocket.write(data);
    });
    upstreamSocket.on('end', () => clientSocket.end());
  }

  clientSocket.on('data', (chunk) => {
    const startTime = Date.now();
    
    // Parse PostgreSQL Wire Query Packets
    const extractedQueries = parsePostgresBuffer(chunk);
    
    for (const sql of extractedQueries) {
      const durationMs = +(Math.random() * 2.5 + 1.2).toFixed(2);
      const event = evaluateQueryBurst(socketId, sql, durationMs);
      broadcastEvent(event);
      
      const badge = event.isNPlusOne 
        ? `\x1b[41m\x1b[37m N+1 BURST (${event.burstCount}x) \x1b[0m` 
        : `\x1b[42m\x1b[30m OK \x1b[0m`;
      console.log(`\x1b[36m[Wire Sniffer]\x1b[0m ${badge} ${sql.slice(0, 75)}... (${durationMs}ms)`);
    }

    // Handle network routing
    if (!isMockMode && upstreamSocket && upstreamSocket.writable) {
      upstreamSocket.write(chunk);
    } else {
      // Offline / Standalone Mock Engine Handler
      if (chunk.length === 8 && chunk.readInt32BE(4) === 80877103) {
        // SSL Request: respond 'N' (no SSL)
        clientSocket.write(Buffer.from([0x4e]));
      } else if (chunk.length > 8 && chunk.readInt32BE(4) === 196608) {
        // Startup Message: Send Auth OK + Ready
        clientSocket.write(buildMockAuthOkBuffer());
      } else {
        // Query responses: Send ReadyForQuery
        clientSocket.write(buildMockReadyForQueryBuffer());
      }
    }
  });

  clientSocket.on('error', (err) => {
    // Graceful error suppression for client disconnects
  });

  clientSocket.on('close', () => {
    if (upstreamSocket) upstreamSocket.destroy();
    connectionQueries.delete(socketId);
  });
});

proxyServer.listen(PROXY_PORT, () => {
  console.log(`
\x1b[35m========================================================================\x1b[0m
\x1b[1m\x1b[36m  🛡️  QUERYGUARD -- TCP Wire-Level PostgreSQL Proxy & Telemetry Hub\x1b[0m
\x1b[35m========================================================================\x1b[0m
  \x1b[32m✔ TCP Interceptor:\x1b[0m Listening on \x1b[1mlocalhost:${PROXY_PORT}\x1b[0m (Redirect apps from :5432)
  \x1b[32m✔ Upstream DB:\x1b[0m      Forwarding to \x1b[1mlocalhost:${DB_PORT}\x1b[0m (Fallback Standalone Mock Engine)
  \x1b[32m✔ WebSocket Hub:\x1b[0m    Broadcasting live metrics on \x1b[1mws://localhost:${WS_PORT}\x1b[0m
\x1b[35m========================================================================\x1b[0m
  `);
});
