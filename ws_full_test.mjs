import WebSocket from 'ws';

console.log('=== FULL WebRTC SIGNALING TEST ===');

const viewerId = 'test-viewer-' + Date.now();
const streamId = 'main-live';

let viewerWs, broadcasterWs;
let steps = 0;
const expectedSteps = 8;

function log(label, msg) {
  console.log('[' + label + ']', typeof msg === 'string' ? msg : JSON.stringify(msg));
}

function checkComplete() {
  steps++;
  if (steps >= expectedSteps) {
    console.log('\n=== TEST COMPLETE: All ' + expectedSteps + ' signaling steps passed ===');
    if (viewerWs) viewerWs.close();
    if (broadcasterWs) broadcasterWs.close();
    process.exit(0);
  }
}

// VIEWER connects first
viewerWs = new WebSocket('ws://127.0.0.1:8030/ws');
viewerWs.on('open', () => {
  log('VIEWER', 'Connected, sending viewer-join');
  viewerWs.send(JSON.stringify({ type: 'viewer-join', streamId, viewerId }));
});

viewerWs.on('message', (data) => {
  const msg = JSON.parse(data);
  log('VIEWER RECV', msg);
  
  if (msg.type === 'broadcaster-ready') {
    log('VIEWER', 'Got broadcaster-ready, sending viewer-join again');
    viewerWs.send(JSON.stringify({ type: 'viewer-join', streamId, viewerId }));
  } else if (msg.type === 'offer') {
    log('VIEWER', 'Got offer, sending answer');
    viewerWs.send(JSON.stringify({
      type: 'answer',
      answer: { type: 'answer', sdp: 'mock-answer-sdp' },
      streamId,
      viewerId  // IMPORTANT: must include viewerId for server routing
    }));
    checkComplete();
  } else if (msg.type === 'ice-candidate') {
    log('VIEWER', 'Got ICE candidate from broadcaster');
    checkComplete();
  } else if (msg.type === 'viewer-count') {
    log('VIEWER', 'Got viewer-count:', msg.count);
    checkComplete();
  } else if (msg.type === 'heart') {
    log('VIEWER', 'Got heart');
    checkComplete();
  }
});

viewerWs.on('close', (code) => {
  log('VIEWER', 'Closed with code: ' + code);
});

// BROADCASTER connects after 500ms
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
      log('BROADCASTER', 'Got viewer-connected for ' + msg.viewerId + ', sending offer');
      broadcasterWs.send(JSON.stringify({
        type: 'offer',
        offer: { type: 'offer', sdp: 'mock-offer-sdp' },
        streamId,
        viewerId: msg.viewerId
      }));
      checkComplete();
    } else if (msg.type === 'answer') {
      log('BROADCASTER', 'Got answer from ' + msg.viewerId);
      checkComplete();
    } else if (msg.type === 'ice-candidate') {
      log('BROADCASTER', 'Got ICE candidate from ' + msg.viewerId);
      checkComplete();
    }
  });

  broadcasterWs.on('close', (code) => {
    log('BROADCASTER', 'Closed with code: ' + code);
  });
}, 500);

setTimeout(() => {
  console.log('\n=== TIMEOUT: Test incomplete ===');
  process.exit(1);
}, 15000);