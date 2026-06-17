import WebSocket from 'ws';

console.log('=== FULL WebRTC Signaling Test ===');

let viewerWs, broadcasterWs;
let viewerConnected = false;
let broadcasterReady = false;
let offerReceived = false;
let answerReceived = false;
let iceReceived = 0;

function checkDone() {
  if (viewerConnected && broadcasterReady && offerReceived && answerReceived && iceReceived >= 2) {
    console.log('\n✅ ALL SIGNALING STEPS COMPLETE!');
    process.exit(0);
  }
}

// VIEWER connects first
viewerWs = new WebSocket('ws://127.0.0.1:8030/ws');
viewerWs.on('open', () => {
  console.log('[VIEWER] Connected - sending viewer-join');
  viewerWs.send(JSON.stringify({ 
    type: 'viewer-join', 
    streamId: 'main-live', 
    viewerId: 'test-viewer-1' 
  }));
});

viewerWs.on('message', (data) => {
  const msg = JSON.parse(data);
  console.log('[VIEWER] RECV:', JSON.stringify(msg));
  
  if (msg.type === 'broadcaster-ready') {
    console.log('[VIEWER] Got broadcaster-ready');
    viewerConnected = true;
    checkDone();
  }
  
  if (msg.type === 'offer') {
    console.log('[VIEWER] Got offer - sending answer');
    offerReceived = true;
    checkDone();
    
    // Create mock answer
    viewerWs.send(JSON.stringify({
      type: 'answer',
      answer: { type: 'answer', sdp: 'v=0\r\no=- 123456789 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\na=msid-semantic: WMS\r\nm=video 9 UDP/TLS/RTP/SAVPF 96\r\nc=IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=ice-ufrag:test\r\na=ice-pwd:test123\r\na=fingerprint:sha-256 AA:BB:CC:DD:EE:FF\r\na=setup:active\r\na=mid:0\r\na=sendrecv\r\na=rtcp-mux\r\na=rtpmap:96 H264/90000\r\na=fmtp:96 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f\r\n' },
      streamId: 'main-live',
      viewerId: 'test-viewer-1'
    }));
  }
  
  if (msg.type === 'ice-candidate') {
    console.log('[VIEWER] Got ICE candidate from broadcaster');
    iceReceived++;
    checkDone();
  }
});

viewerWs.on('close', (code) => console.log('[VIEWER] Closed:', code));
viewerWs.on('error', (e) => console.log('[VIEWER] Error:', e.message));

// BROADCASTER connects after 1 second
setTimeout(() => {
  broadcasterWs = new WebSocket('ws://127.0.0.1:8030/ws');
  broadcasterWs.on('open', () => {
    console.log('[BROADCASTER] Connected - sending broadcaster-ready');
    broadcasterWs.send(JSON.stringify({ 
      type: 'broadcaster-ready', 
      streamId: 'main-live' 
    }));
  });
  
  broadcasterWs.on('message', (data) => {
    const msg = JSON.parse(data);
    console.log('[BROADCASTER] RECV:', JSON.stringify(msg));
    
    if (msg.type === 'viewer-connected') {
      console.log('[BROADCASTER] Viewer connected - sending offer');
      broadcasterReady = true;
      checkDone();
      
      // Send mock offer
      broadcasterWs.send(JSON.stringify({
        type: 'offer',
        offer: { type: 'offer', sdp: 'v=0\r\no=- 123456789 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\na=msid-semantic: WMS\r\nm=video 9 UDP/TLS/RTP/SAVPF 96\r\nc=IN IP4 0.0.0.0\r\na=rtcp:9 IN IP4 0.0.0.0\r\na=ice-ufrag:test\r\na=ice-pwd:test123\r\na=fingerprint:sha-256 AA:BB:CC:DD:EE:FF\r\na=setup:actpass\r\na=mid:0\r\na=sendrecv\r\na=rtcp-mux\r\na=rtpmap:96 H264/90000\r\na=fmtp:96 level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f\r\n' },
        viewerId: msg.viewerId,
        streamId: 'main-live'
      }));
    }
    
    if (msg.type === 'answer') {
      console.log('[BROADCASTER] Got answer');
      answerReceived = true;
      checkDone();
    }
    
    if (msg.type === 'ice-candidate') {
      console.log('[BROADCASTER] Got ICE candidate from viewer');
      iceReceived++;
      checkDone();
    }
  });
  
  broadcasterWs.on('close', (code) => console.log('[BROADCASTER] Closed:', code));
  broadcasterWs.on('error', (e) => console.log('[BROADCASTER] Error:', e.message));
}, 1000);

// Timeout
setTimeout(() => {
  console.log('\n❌ TIMEOUT - Signaling incomplete');
  process.exit(1);
}, 10000);