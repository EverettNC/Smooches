import WebSocket from 'ws';

console.log('=== FULL WebRTC Signaling Test for main-live ===');

const viewerId = 'test-viewer-' + Date.now();
const streamId = 'main-live';

let viewerWs, broadcasterWs;
let steps = 0;
const expectedSteps = 6;

function log(label, msg) {
  console.log('[' + label + ']', typeof msg === 'string' ? msg : JSON.stringify(msg));
}

function checkComplete() {
  steps++;
  if (steps >= expectedSteps) {
    console.log('\n=== TEST COMPLETE: All signaling steps passed ===');
    if (viewerWs) viewerWs.close();
    if (broadcasterWs) broadcasterWs.close();
    process.exit(0);
  }
}

viewerWs = new WebSocket('ws://127.0.0.1:8030/ws');
viewerWs.on('open', () => {
  log('VIEWER', 'Connected, sending viewer-join');
  viewerWs.send(JSON.stringify({ type: 'viewer-join', streamId, viewerId }));
});

viewerWs.on('message', (data) => {
  const msg = JSON.parse(data);
  log('VIEWER RECV', msg);
  
  if (msg.type === 'broadcaster-ready') {
    log('VIEWER', 'Got broadcaster-ready, re-sending viewer-join');
    viewerWs.send(JSON.stringify({ type: 'viewer-join', streamId, viewerId }));
  } else if (msg.type === 'offer') {
    log('VIEWER', 'Got offer, sending answer');
    viewerWs.send(JSON.stringify({
      type: 'answer',
      answer: { type: 'answer', sdp: 'mock-answer-sdp' },
      streamId,
      viewerId
    }));
    checkComplete();
  } else if (msg.type === 'ice-candidate') {
    log('VIEWER', 'Got ICE from broadcaster');
    checkComplete();
  }
});

viewerWs.on('close', (code) => log('VIEWER', 'Closed: ' + code));

setTimeout(() => {
  broadcasterWs = new WebSocket('ws://127.0.0.1:8030/ws');
  broadcasterWs.on('open', () => {
    log('BROADCASTER', 'Connected, sending broadcaster-ready');
    broadcasterWs.send(JSON.stringify({ type: 'broadcaster-ready', streamId }));
  });

  broadcasterWs.on('message', (data) => {
    const msg = JSON.parse(data);
    log('BROADCASTER RECV', msg);
    
    if (msg.type === 'viewer-connected') {
      log('BROADCASTER', 'Viewer connected, sending offer');
      broadcasterWs.send(JSON.stringify({
        type: 'offer',
        offer: { type: 'offer', sdp: 'mock-offer-sdp' },
        streamId,
        viewerId: msg.viewerId
      }));
      checkComplete();
    } else if (msg.type === 'answer') {
      log('BROADCASTER', 'Got answer');
      checkComplete();
    } else if (msg.type === 'ice-candidate') {
      log('BROADCASTER', 'Got ICE from viewer');
      checkComplete();
    }
  });

  broadcasterWs.on('close', (code) => log('BROADCASTER', 'Closed: ' + code));
}, 500);

setTimeout(() => {
  console.log('\n=== TIMEOUT: Test incomplete ===');
  if (viewerWs) viewerWs.close();
  if (broadcasterWs) broadcasterWs.close();
  process.exit(1);
}, 15000);
