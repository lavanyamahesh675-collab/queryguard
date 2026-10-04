const pptxgen = require('pptxgenjs');

const pptx = new pptxgen();

pptx.layout = 'LAYOUT_16x9';

// Dark Theme Colors
const BG_DARK = '080B10';
const CARD_DARK = '0F172A';
const EMERALD = '10B981';
const CYAN = '06B6D4';
const VIOLET = '8B5CF6';
const ROSE = 'EF4444';
const WHITE = 'FFFFFF';
const SLATE_300 = 'CBD5E1';
const SLATE_400 = '94A3B8';

// SLIDE 1: Title Slide
let slide1 = pptx.addSlide();
slide1.background = { color: BG_DARK };
slide1.addText("iQOO NATIONAL HACKATHON MVP — GRAND FINALE (BENGALURU)", {
  x: 0.8, y: 0.6, w: 11.5, h: 0.4,
  fontFace: "Segoe UI", fontSize: 13, bold: true, color: EMERALD
});
slide1.addText("QueryGuard: Relational TCP Wire Proxy & N+1 Interceptor", {
  x: 0.8, y: 1.5, w: 11.5, h: 1.8,
  fontFace: "Segoe UI", fontSize: 32, bold: true, color: WHITE
});
slide1.addText("Drop-in zero-SDK database reliability interceptor detecting ORM bottlenecks in real-time.", {
  x: 0.8, y: 3.5, w: 11.5, h: 0.8,
  fontFace: "Segoe UI", fontSize: 18, color: SLATE_300
});

// Card Box for Team Info
slide1.addShape(pptx.shapes.RECTANGLE, {
  x: 0.8, y: 4.8, w: 11.5, h: 1.8,
  fill: { color: CARD_DARK }, line: { color: '1E293B', width: 1 }
});
slide1.addText("TEAM NEXORA (Developer Tools Track)", {
  x: 1.1, y: 5.0, w: 10.9, h: 0.3,
  fontFace: "Segoe UI", fontSize: 13, bold: true, color: CYAN
});
slide1.addText("Challa Lavanya (Leader)  •  Amrutha Varshini Reddy  •  Navadeep Chennapatnam", {
  x: 1.1, y: 5.4, w: 10.9, h: 0.4,
  fontFace: "Segoe UI", fontSize: 15, bold: true, color: WHITE
});
slide1.addText("GitHub: https://github.com/lavanyamahesh675-collab/queryguard  |  Live Prototype: https://queryguard-hackathon.loca.lt", {
  x: 1.1, y: 5.9, w: 10.9, h: 0.4,
  fontFace: "Segoe UI", fontSize: 12, color: SLATE_400
});

// SLIDE 2: Problem Statement
let slide2 = pptx.addSlide();
slide2.background = { color: BG_DARK };
slide2.addText("SLIDE 2 / 10  |  PROBLEM STATEMENT", { x: 0.8, y: 0.5, w: 11.5, h: 0.3, fontFace: "Segoe UI", fontSize: 11, bold: true, color: ROSE });
slide2.addText("The Invisible Crisis of ORM N+1 Query Explosions", { x: 0.8, y: 0.9, w: 11.5, h: 0.8, fontFace: "Segoe UI", fontSize: 26, bold: true, color: WHITE });

slide2.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 2.0, w: 3.6, h: 4.5, fill: { color: CARD_DARK }, line: { color: '1E293B', width: 1 } });
slide2.addText("01. ORM ABSTRACTION", { x: 1.0, y: 2.3, w: 3.2, h: 0.3, fontFace: "Segoe UI", fontSize: 12, bold: true, color: EMERALD });
slide2.addText("Hidden SQL Loops", { x: 1.0, y: 2.7, w: 3.2, h: 0.4, fontFace: "Segoe UI", fontSize: 18, bold: true, color: WHITE });
slide2.addText("Prisma, TypeORM, Django, and Hibernate abstract SQL behind object graphs, frequently executing child queries inside loops.", { x: 1.0, y: 3.3, w: 3.2, h: 2.8, fontFace: "Segoe UI", fontSize: 14, color: SLATE_300 });

slide2.addShape(pptx.shapes.RECTANGLE, { x: 4.7, y: 2.0, w: 3.6, h: 4.5, fill: { color: CARD_DARK }, line: { color: '1E293B', width: 1 } });
slide2.addText("02. SERIAL RTT EXHAUSTION", { x: 4.9, y: 2.3, w: 3.2, h: 0.3, fontFace: "Segoe UI", fontSize: 12, bold: true, color: CYAN });
slide2.addText("50+ Queries / Request", { x: 4.9, y: 2.7, w: 3.2, h: 0.4, fontFace: "Segoe UI", fontSize: 18, bold: true, color: WHITE });
slide2.addText("Retrieving 1 parent record triggers 50 serial roundtrips. Instead of 1 query, database handles 51 separate TCP packets.", { x: 4.9, y: 3.3, w: 3.2, h: 2.8, fontFace: "Segoe UI", fontSize: 14, color: SLATE_300 });

slide2.addShape(pptx.shapes.RECTANGLE, { x: 8.6, y: 2.0, w: 3.6, h: 4.5, fill: { color: CARD_DARK }, line: { color: ROSE, width: 1 } });
slide2.addText("03. CATASTROPHIC DEADLOCKS", { x: 8.8, y: 2.3, w: 3.2, h: 0.3, fontFace: "Segoe UI", fontSize: 12, bold: true, color: ROSE });
slide2.addText("Connection Exhaustion", { x: 8.8, y: 2.7, w: 3.2, h: 0.4, fontFace: "Segoe UI", fontSize: 18, bold: true, color: WHITE });
slide2.addText("Database connection pools freeze, app servers crash, and cloud infrastructure compute bills explode exponentially.", { x: 8.8, y: 3.3, w: 3.2, h: 2.8, fontFace: "Segoe UI", fontSize: 14, color: SLATE_300 });

// SLIDE 3: Root Cause Latency Paradox
let slide3 = pptx.addSlide();
slide3.background = { color: BG_DARK };
slide3.addText("SLIDE 3 / 10  |  THE LATENCY PARADOX", { x: 0.8, y: 0.5, w: 11.5, h: 0.3, fontFace: "Segoe UI", fontSize: 11, bold: true, color: CYAN });
slide3.addText("Why Local Testing Masks Production Disasters", { x: 0.8, y: 0.9, w: 11.5, h: 0.8, fontFace: "Segoe UI", fontSize: 26, bold: true, color: WHITE });

slide3.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 2.2, w: 5.6, h: 4.3, fill: { color: CARD_DARK }, line: { color: EMERALD, width: 1 } });
slide3.addText("LOCAL DEVELOPMENT (0.2ms Loopback RTT)", { x: 1.1, y: 2.5, w: 5.0, h: 0.3, fontFace: "Segoe UI", fontSize: 12, bold: true, color: EMERALD });
slide3.addText("50 Queries * 0.2ms = 10ms (Appears Fast!)", { x: 1.1, y: 3.0, w: 5.0, h: 0.6, fontFace: "Segoe UI", fontSize: 18, bold: true, color: WHITE });
slide3.addText("Developers test code on loopback (localhost), where network latency is near zero. The severe bottleneck is completely masked during local development.", { x: 1.1, y: 3.8, w: 5.0, h: 2.3, fontFace: "Segoe UI", fontSize: 14, color: SLATE_300 });

slide3.addShape(pptx.shapes.RECTANGLE, { x: 6.7, y: 2.2, w: 5.6, h: 4.3, fill: { color: CARD_DARK }, line: { color: ROSE, width: 1 } });
slide3.addText("CLOUD PRODUCTION (15ms-30ms RTT)", { x: 7.0, y: 2.5, w: 5.0, h: 0.3, fontFace: "Segoe UI", fontSize: 12, bold: true, color: ROSE });
slide3.addText("50 Queries * 15ms = 750ms - 1500ms (Catastrophic!)", { x: 7.0, y: 3.0, w: 5.0, h: 0.6, fontFace: "Segoe UI", fontSize: 18, bold: true, color: WHITE });
slide3.addText("When deployed to staging/production cloud topologies, latency multiplies by 50x. Application threads block, causing connection pool deadlocks under real traffic.", { x: 7.0, y: 3.8, w: 5.0, h: 2.3, fontFace: "Segoe UI", fontSize: 14, color: SLATE_300 });

// SLIDE 4: Solution Overview
let slide4 = pptx.addSlide();
slide4.background = { color: BG_DARK };
slide4.addText("SLIDE 4 / 10  |  QUERYGUARD ENGINE", { x: 0.8, y: 0.5, w: 11.5, h: 0.3, fontFace: "Segoe UI", fontSize: 11, bold: true, color: EMERALD });
slide4.addText("The Solution: Drop-In TCP Wire Proxy", { x: 0.8, y: 0.9, w: 11.5, h: 0.8, fontFace: "Segoe UI", fontSize: 26, bold: true, color: WHITE });

slide4.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 2.2, w: 3.6, h: 4.3, fill: { color: CARD_DARK }, line: { color: '1E293B', width: 1 } });
slide4.addText("ZERO-SDK PROXY", { x: 1.0, y: 2.5, w: 3.2, h: 0.3, fontFace: "Segoe UI", fontSize: 12, bold: true, color: CYAN });
slide4.addText("Port 5433 -> 5432", { x: 1.0, y: 2.9, w: 3.2, h: 0.4, fontFace: "Segoe UI", fontSize: 18, bold: true, color: WHITE });
slide4.addText("Simply change database port from 5432 to 5433. No application code changes or heavy SDKs required.", { x: 1.0, y: 3.5, w: 3.2, h: 2.6, fontFace: "Segoe UI", fontSize: 14, color: SLATE_300 });

slide4.addShape(pptx.shapes.RECTANGLE, { x: 4.7, y: 2.2, w: 3.6, h: 4.3, fill: { color: CARD_DARK }, line: { color: '1E293B', width: 1 } });
slide4.addText("PROTOCOL SNIFFER", { x: 4.9, y: 2.5, w: 3.2, h: 0.3, fontFace: "Segoe UI", fontSize: 12, bold: true, color: VIOLET });
slide4.addText("Wire Protocol 3.0", { x: 4.9, y: 2.9, w: 3.2, h: 0.4, fontFace: "Segoe UI", fontSize: 18, bold: true, color: WHITE });
slide4.addText("Inspects binary TCP frames for 'Q' (0x51 Simple Query) and 'P' (0x70 Parse Extended Query) packets.", { x: 4.9, y: 3.5, w: 3.2, h: 2.6, fontFace: "Segoe UI", fontSize: 14, color: SLATE_300 });

slide4.addShape(pptx.shapes.RECTANGLE, { x: 8.6, y: 2.2, w: 3.6, h: 4.3, fill: { color: CARD_DARK }, line: { color: '1E293B', width: 1 } });
slide4.addText("FINGERPRINTING", { x: 8.8, y: 2.5, w: 3.2, h: 0.3, fontFace: "Segoe UI", fontSize: 12, bold: true, color: EMERALD });
slide4.addText("SQL Fingerprints", { x: 8.8, y: 2.9, w: 3.2, h: 0.4, fontFace: "Segoe UI", fontSize: 18, bold: true, color: WHITE });
slide4.addText("Normalizes literals, strings, and UUIDs to canonical fingerprints (WHERE post_id = 42 -> WHERE post_id = ?).", { x: 8.8, y: 3.5, w: 3.2, h: 2.6, fontFace: "Segoe UI", fontSize: 14, color: SLATE_300 });

// SLIDE 5: Deep Dive Architecture
let slide5 = pptx.addSlide();
slide5.background = { color: BG_DARK };
slide5.addText("SLIDE 5 / 10  |  ALGORITHMIC CORRECTION", { x: 0.8, y: 0.5, w: 11.5, h: 0.3, fontFace: "Segoe UI", fontSize: 11, bold: true, color: VIOLET });
slide5.addText("Deep-Dive: 80ms Sliding Window Evaluator", { x: 0.8, y: 0.9, w: 11.5, h: 0.8, fontFace: "Segoe UI", fontSize: 26, bold: true, color: WHITE });

slide5.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 2.0, w: 5.6, h: 4.5, fill: { color: CARD_DARK }, line: { color: '1E293B', width: 1 } });
slide5.addText("1. SLIDING TEMPORAL WINDOW", { x: 1.1, y: 2.3, w: 5.0, h: 0.3, fontFace: "Segoe UI", fontSize: 12, bold: true, color: CYAN });
slide5.addText("Groups incoming queries by connection socket within rolling 80ms temporal windows.", { x: 1.1, y: 2.7, w: 5.0, h: 0.8, fontFace: "Segoe UI", fontSize: 13, color: SLATE_300 });

slide5.addText("2. N+1 EXPLOSION DETECTION", { x: 1.1, y: 3.6, w: 5.0, h: 0.3, fontFace: "Segoe UI", fontSize: 12, bold: true, color: ROSE });
slide5.addText("If count >= 4 identical query fingerprints within 80ms, flags an N+1 Query Explosion.", { x: 1.1, y: 4.0, w: 5.0, h: 0.8, fontFace: "Segoe UI", fontSize: 13, color: SLATE_300 });

slide5.addText("3. LATENCY WASTED FORMULA", { x: 1.1, y: 4.9, w: 5.0, h: 0.3, fontFace: "Segoe UI", fontSize: 12, bold: true, color: VIOLET });
slide5.addText("TimeWastedMs = (BurstCount - 1) * NetworkLatency", { x: 1.1, y: 5.3, w: 5.0, h: 0.8, fontFace: "Consolas", fontSize: 13, bold: true, color: EMERALD });

slide5.addShape(pptx.shapes.RECTANGLE, { x: 6.7, y: 2.0, w: 5.6, h: 4.5, fill: { color: '020617' }, line: { color: EMERALD, width: 1 } });
slide5.addText("WEBSOCKET TELEMETRY FRAME (PORT 4000)", { x: 7.0, y: 2.3, w: 5.0, h: 0.3, fontFace: "Consolas", fontSize: 11, bold: true, color: SLATE_400 });
slide5.addText(
  "{\n" +
  '  "id": "q_1711928340123_abc",\n' +
  '  "rawSql": "SELECT * FROM comments WHERE post_id = 12;",\n' +
  '  "fingerprint": "SELECT * FROM comments WHERE post_id = ?;",\n' +
  '  "isNPlusOne": true,\n' +
  '  "burstCount": 14,\n' +
  '  "timeWastedMs": 49.4,\n' +
  '  "detectedORM": "Prisma / TypeORM"\n' +
  "}",
  { x: 7.0, y: 2.8, w: 5.0, h: 3.4, fontFace: "Consolas", fontSize: 13, color: EMERALD }
);

// SLIDE 6: Desktop Dashboard
let slide6 = pptx.addSlide();
slide6.background = { color: BG_DARK };
slide6.addText("SLIDE 6 / 10  |  DESKTOP TELEMETRY", { x: 0.8, y: 0.5, w: 11.5, h: 0.3, fontFace: "Segoe UI", fontSize: 11, bold: true, color: EMERALD });
slide6.addText("Widescreen Telemetry Dashboard", { x: 0.8, y: 0.9, w: 11.5, h: 0.8, fontFace: "Segoe UI", fontSize: 26, bold: true, color: WHITE });

slide6.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 2.2, w: 3.6, h: 4.3, fill: { color: CARD_DARK }, line: { color: '1E293B', width: 1 } });
slide6.addText("GANTT WATERFALL TIMELINE", { x: 1.0, y: 2.5, w: 3.2, h: 0.3, fontFace: "Segoe UI", fontSize: 12, bold: true, color: EMERALD });
slide6.addText("Streaming Gantt Rows", { x: 1.0, y: 2.9, w: 3.2, h: 0.4, fontFace: "Segoe UI", fontSize: 18, bold: true, color: WHITE });
slide6.addText("Horizontal Gantt duration bars with highlighted crimson N+1 explosion warning indicators.", { x: 1.0, y: 3.5, w: 3.2, h: 2.6, fontFace: "Segoe UI", fontSize: 14, color: SLATE_300 });

slide6.addShape(pptx.shapes.RECTANGLE, { x: 4.7, y: 2.2, w: 3.6, h: 4.3, fill: { color: CARD_DARK }, line: { color: '1E293B', width: 1 } });
slide6.addText("POOL HEATMAP", { x: 4.9, y: 2.5, w: 3.2, h: 0.3, fontFace: "Segoe UI", fontSize: 12, bold: true, color: CYAN });
slide6.addText("100-Slot DB Pool Map", { x: 4.9, y: 2.9, w: 3.2, h: 0.4, fontFace: "Segoe UI", fontSize: 18, bold: true, color: WHITE });
slide6.addText("Live visualization of connection pool states (Active, Idle, Burst Warning, Deadlocked).", { x: 4.9, y: 3.5, w: 3.2, h: 2.6, fontFace: "Segoe UI", fontSize: 14, color: SLATE_300 });

slide6.addShape(pptx.shapes.RECTANGLE, { x: 8.6, y: 2.2, w: 3.6, h: 4.3, fill: { color: CARD_DARK }, line: { color: '1E293B', width: 1 } });
slide6.addText("LIVE SQL SANDBOX", { x: 8.8, y: 2.5, w: 3.2, h: 0.3, fontFace: "Segoe UI", fontSize: 12, bold: true, color: VIOLET });
slide6.addText("Refactoring Lab", { x: 8.8, y: 2.9, w: 3.2, h: 0.4, fontFace: "Segoe UI", fontSize: 18, bold: true, color: WHITE });
slide6.addText("Test SQL statements live and generate automated Prisma & TypeORM eager JOIN batch fixes.", { x: 8.8, y: 3.5, w: 3.2, h: 2.6, fontFace: "Segoe UI", fontSize: 14, color: SLATE_300 });

// SLIDE 7: Mobile Companion
let slide7 = pptx.addSlide();
slide7.background = { color: BG_DARK };
slide7.addText("SLIDE 7 / 10  |  MOBILE DIAGNOSTICS (/mobile)", { x: 0.8, y: 0.5, w: 11.5, h: 0.3, fontFace: "Segoe UI", fontSize: 11, bold: true, color: CYAN });
slide7.addText("Mobile Diagnostic Companion App", { x: 0.8, y: 0.9, w: 11.5, h: 0.8, fontFace: "Segoe UI", fontSize: 26, bold: true, color: WHITE });

slide7.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 2.2, w: 3.6, h: 4.3, fill: { color: CARD_DARK }, line: { color: '1E293B', width: 1 } });
slide7.addText("TOUCH OPTIMIZED APP", { x: 1.0, y: 2.5, w: 3.2, h: 0.3, fontFace: "Segoe UI", fontSize: 12, bold: true, color: CYAN });
slide7.addText("Smartphone Shell", { x: 1.0, y: 2.9, w: 3.2, h: 0.4, fontFace: "Segoe UI", fontSize: 18, bold: true, color: WHITE });
slide7.addText("Dedicated /mobile endpoint formatted for smartphone touchscreens.", { x: 1.0, y: 3.5, w: 3.2, h: 2.6, fontFace: "Segoe UI", fontSize: 14, color: SLATE_300 });

slide7.addShape(pptx.shapes.RECTANGLE, { x: 4.7, y: 2.2, w: 3.6, h: 4.3, fill: { color: CARD_DARK }, line: { color: '1E293B', width: 1 } });
slide7.addText("SYSTEM HEALTH SHIELD", { x: 4.9, y: 2.5, w: 3.2, h: 0.3, fontFace: "Segoe UI", fontSize: 12, bold: true, color: EMERALD });
slide7.addText("Radial Score Gauge", { x: 4.9, y: 2.9, w: 3.2, h: 0.4, fontFace: "Segoe UI", fontSize: 18, bold: true, color: WHITE });
slide7.addText("Calculates real-time database efficiency score based on active burst ratios.", { x: 4.9, y: 3.5, w: 3.2, h: 2.6, fontFace: "Segoe UI", fontSize: 14, color: SLATE_300 });

slide7.addShape(pptx.shapes.RECTANGLE, { x: 8.6, y: 2.2, w: 3.6, h: 4.3, fill: { color: CARD_DARK }, line: { color: '1E293B', width: 1 } });
slide7.addText("ACCORDION DRAWERS", { x: 8.8, y: 2.5, w: 3.2, h: 0.3, fontFace: "Segoe UI", fontSize: 12, bold: true, color: VIOLET });
slide7.addText("One-Tap Refactors", { x: 8.8, y: 2.9, w: 3.2, h: 0.4, fontFace: "Segoe UI", fontSize: 18, bold: true, color: WHITE });
slide7.addText("Touch to expand copyable code snippets for Prisma, TypeORM, and raw SQL batch JOINs.", { x: 8.8, y: 3.5, w: 3.2, h: 2.6, fontFace: "Segoe UI", fontSize: 14, color: SLATE_300 });

// SLIDE 8: Code Comparisons
let slide8 = pptx.addSlide();
slide8.background = { color: BG_DARK };
slide8.addText("SLIDE 8 / 10  |  ACTIONABLE REFACTORS", { x: 0.8, y: 0.5, w: 11.5, h: 0.3, fontFace: "Segoe UI", fontSize: 11, bold: true, color: EMERALD });
slide8.addText("Automated ORM Code Refactoring", { x: 0.8, y: 0.9, w: 11.5, h: 0.8, fontFace: "Segoe UI", fontSize: 26, bold: true, color: WHITE });

slide8.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 2.2, w: 5.6, h: 4.3, fill: { color: '1A0505' }, line: { color: ROSE, width: 1 } });
slide8.addText("BEFORE: N+1 SERIAL LOOP (14 DB CALLS)", { x: 1.1, y: 2.5, w: 5.0, h: 0.3, fontFace: "Consolas", fontSize: 11, bold: true, color: ROSE });
slide8.addText(
  "const posts = await prisma.post.findMany();\n\n" +
  "for (const post of posts) {\n" +
  "  const comments = await prisma.comment.findMany({\n" +
  "    where: { postId: post.id }\n" +
  "  });\n" +
  "}",
  { x: 1.1, y: 3.0, w: 5.0, h: 3.2, fontFace: "Consolas", fontSize: 13, color: ROSE }
);

slide8.addShape(pptx.shapes.RECTANGLE, { x: 6.7, y: 2.2, w: 5.6, h: 4.3, fill: { color: '021A10' }, line: { color: EMERALD, width: 1 } });
slide8.addText("AFTER: EAGER BATCH JOIN (1 DB CALL)", { x: 7.0, y: 2.5, w: 5.0, h: 0.3, fontFace: "Consolas", fontSize: 11, bold: true, color: EMERALD });
slide8.addText(
  "const postsWithComments = await prisma.post.findMany({\n" +
  "  include: {\n" +
  "    comments: true\n" +
  "  }\n" +
  "});",
  { x: 7.0, y: 3.0, w: 5.0, h: 3.2, fontFace: "Consolas", fontSize: 13, color: EMERALD }
);

// SLIDE 9: Benchmarks & Offline Reliability
let slide9 = pptx.addSlide();
slide9.background = { color: BG_DARK };
slide9.addText("SLIDE 9 / 10  |  SYSTEM RELIABILITY", { x: 0.8, y: 0.5, w: 11.5, h: 0.3, fontFace: "Segoe UI", fontSize: 11, bold: true, color: VIOLET });
slide9.addText("Technical Benchmarks & Offline Resilience", { x: 0.8, y: 0.9, w: 11.5, h: 0.8, fontFace: "Segoe UI", fontSize: 26, bold: true, color: WHITE });

slide9.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 2.2, w: 3.6, h: 4.3, fill: { color: CARD_DARK }, line: { color: '1E293B', width: 1 } });
slide9.addText("ZERO DEPENDENCIES", { x: 1.0, y: 2.5, w: 3.2, h: 0.3, fontFace: "Segoe UI", fontSize: 12, bold: true, color: CYAN });
slide9.addText("Pure Node.js Core", { x: 1.0, y: 2.9, w: 3.2, h: 0.4, fontFace: "Segoe UI", fontSize: 18, bold: true, color: WHITE });
slide9.addText("Uses native net, crypto, and ws modules. Zero proxy overhead.", { x: 1.0, y: 3.5, w: 3.2, h: 2.6, fontFace: "Segoe UI", fontSize: 14, color: SLATE_300 });

slide9.addShape(pptx.shapes.RECTANGLE, { x: 4.7, y: 2.2, w: 3.6, h: 4.3, fill: { color: CARD_DARK }, line: { color: '1E293B', width: 1 } });
slide9.addText("OFFLINE MOCK ENGINE", { x: 4.9, y: 2.5, w: 3.2, h: 0.3, fontFace: "Segoe UI", fontSize: 12, bold: true, color: EMERALD });
slide9.addText("Standalone Demo", { x: 4.9, y: 2.9, w: 3.2, h: 0.4, fontFace: "Segoe UI", fontSize: 18, bold: true, color: WHITE });
slide9.addText("Automatically returns simulated ready packets if no live DB is running on 5432.", { x: 4.9, y: 3.5, w: 3.2, h: 2.6, fontFace: "Segoe UI", fontSize: 14, color: SLATE_300 });

slide9.addShape(pptx.shapes.RECTANGLE, { x: 8.6, y: 2.2, w: 3.6, h: 4.3, fill: { color: CARD_DARK }, line: { color: '1E293B', width: 1 } });
slide9.addText("STRESS BENCHMARK", { x: 8.8, y: 2.5, w: 3.2, h: 0.3, fontFace: "Segoe UI", fontSize: 12, bold: true, color: VIOLET });
slide9.addText("High-QPS Simulator", { x: 8.8, y: 2.9, w: 3.2, h: 0.4, fontFace: "Segoe UI", fontSize: 18, bold: true, color: WHITE });
slide9.addText("Simulates load testing and measures QPS throughput directly from browser controls.", { x: 8.8, y: 3.5, w: 3.2, h: 2.6, fontFace: "Segoe UI", fontSize: 14, color: SLATE_300 });

// SLIDE 10: Conclusion & Submission Info
let slide10 = pptx.addSlide();
slide10.background = { color: BG_DARK };
slide10.addText("SLIDE 10 / 10  |  GRAND FINALE READY", { x: 0.8, y: 0.5, w: 11.5, h: 0.3, fontFace: "Segoe UI", fontSize: 11, bold: true, color: EMERALD });
slide10.addText("Why TeamNexora & QueryGuard Win", { x: 0.8, y: 0.9, w: 11.5, h: 0.8, fontFace: "Segoe UI", fontSize: 26, bold: true, color: WHITE });

slide10.addShape(pptx.shapes.RECTANGLE, { x: 0.8, y: 2.0, w: 5.6, h: 4.5, fill: { color: CARD_DARK }, line: { color: '1E293B', width: 1 } });
slide10.addText("1. Real Systems Depth: TCP wire-level packet sniffing vs standard web wrappers.", { x: 1.1, y: 2.3, w: 5.0, h: 0.8, fontFace: "Segoe UI", fontSize: 14, bold: true, color: WHITE });
slide10.addText("2. Dual Widescreen + Mobile UX: Widescreen desktop dashboard + touch-optimized mobile app.", { x: 1.1, y: 3.2, w: 5.0, h: 0.8, fontFace: "Segoe UI", fontSize: 14, bold: true, color: WHITE });
slide10.addText("3. Zero-Setup Demo: Built-in 1-tap simulation trigger buttons in the header navbar.", { x: 1.1, y: 4.1, w: 5.0, h: 0.8, fontFace: "Segoe UI", fontSize: 14, bold: true, color: WHITE });

slide10.addShape(pptx.shapes.RECTANGLE, { x: 6.7, y: 2.0, w: 5.6, h: 4.5, fill: { color: CARD_DARK }, line: { color: EMERALD, width: 1 } });
slide10.addText("TEAM NEXORA SUBMISSION LINKS", { x: 7.0, y: 2.3, w: 5.0, h: 0.3, fontFace: "Segoe UI", fontSize: 12, bold: true, color: EMERALD });
slide10.addText("Challa Lavanya (Leader)\nAmrutha Varshini Reddy\nNavadeep Chennapatnam", { x: 7.0, y: 2.7, w: 5.0, h: 1.0, fontFace: "Segoe UI", fontSize: 14, color: WHITE });
slide10.addText("GitHub Repository:\nhttps://github.com/lavanyamahesh675-collab/queryguard", { x: 7.0, y: 3.8, w: 5.0, h: 0.8, fontFace: "Consolas", fontSize: 12, color: CYAN });
slide10.addText("Live Prototype URL:\nhttps://queryguard-hackathon.loca.lt", { x: 7.0, y: 4.8, w: 5.0, h: 0.8, fontFace: "Consolas", fontSize: 12, color: VIOLET });

// Save PowerPoint file
pptx.writeFile({ fileName: "QueryGuard_Pitch_Deck_TeamNexora.pptx" })
  .then(fileName => {
    console.log(`Successfully generated PowerPoint file: ${fileName}`);
  })
  .catch(err => {
    console.error(`Error generating PPTX file:`, err);
  });
