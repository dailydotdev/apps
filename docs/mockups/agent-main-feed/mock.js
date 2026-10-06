(() => {
  const root = document.getElementById('agent-feed-mock');
  const posts = [
    {title:'The quiet power of boring technology',source:'The Pragmatic Engineer',mark:'P',tags:'#engineering  #career',time:'2h',read:'6',votes:128,comments:24,art:'Keep it simple.',label:'ENGINEERING NOTES'},
    {title:'Building reliable AI agents with structured outputs',source:'Simon Willison',mark:'S',tags:'#ai  #agents',time:'38m',read:'8',votes:86,comments:12,art:'agents → action',label:'TOOLS · MEMORY · EVALS',agent:'AI engineering',reason:'Your agent is looking for practical guides to building AI agents. This covers tool calls, structured outputs, and failure handling.'},
    {title:'What actually makes a React app feel fast?',source:'Frontend Masters',mark:'F',tags:'#react  #performance',time:'1h',read:'5',votes:214,comments:31,art:'Less waiting.',label:'THE WEB, AT SPEED'},
    {title:'Postgres indexes: the mental model I wish I had',source:'Crunchy Data',mark:'C',tags:'#postgresql  #database',time:'3h',read:'7',votes:97,comments:9,art:'SELECT faster',label:'EXPLAIN ANALYZE'},
    {title:'React Server Components, without the magic',source:'Josh W. Comeau',mark:'J',tags:'#react  #webdev',time:'24m',read:'10',votes:163,comments:18,art:'server ↔ client',label:'A PRACTICAL DEEP DIVE',agent:'Frontend deep dives',reason:'Your agent tracks in-depth React architecture articles. This explains server and client boundaries with practical examples.'},
    {title:'A small guide to making better pull requests',source:'GitHub Blog',mark:'G',tags:'#git  #productivity',time:'4h',read:'4',votes:76,comments:8,art:'Ship together.',label:'SMALL DIFFS, BIG IMPACT'}
  ];
  const icon = name => `<svg aria-hidden="true">
<use href="#icon-${name}">
</use>
</svg>`;
  const state = {showAgents:true, ai:true, frontend:true};
  function enabled(p) {return state.showAgents && (p.agent === 'AI engineering' ? state.ai : state.frontend);}
  function actions(p,index) {return `<div class="actions">
<button class="action " data-vote="${index}" aria-label="Upvote ${p.title}" aria-pressed="false">${icon('arrow-big-up')}<span>${p.votes}</span>
</button>
<span class="action">${icon('message-circle')}${p.comments}</span>
<button class="action " data-save="${index}" aria-label="Save ${p.title}" aria-pressed="false">${icon('bookmark')}</button>
</div>`;}
  function card(p,index) {return `<article class="post ${p.agent?'agent':''}" ${p.agent?`data-agent="${p.agent}"`:''}>${p.agent?`<div class="ribbon">${icon('sparkles')} Found by your agent</div>`:''}<div class="post-body">
<div class="source">
<span class="source-mark">${p.mark}</span>${p.source}</div>
<h2>${p.title}</h2>
<div class="tags">${p.tags}</div>
<div class="meta">${p.time} ago · ${p.read} min read</div>
<div class="cover ${p.agent?'agent-art':''}">
<div class="cover-pattern">
</div>
<span class="cover-label">${p.label}</span>
<span class="cover-title">${p.art}</span>
</div>${actions(p,index)}</div>${p.agent?`<div class="agent-footer">
<span>${p.agent}</span>
<button class="why " aria-expanded="false">Why this?</button>
</div>
<div class="reason" hidden>${p.reason}</div>`:''}</article>`;}
  function digestRow(p,index) {return `<article class="digest-row" data-agent="${p.agent}">
<div class="digest-copy">
<div class="source">${p.source} · ${p.read} min read</div>
<h2>${p.title}</h2>
<span class="sub">${p.agent}</span> · <button class="why " aria-expanded="false">Why this?</button>
<div class="reason" hidden>${p.reason}</div>${actions(p,index)}</div>
<div class="digest-thumb">${p.agent==='AI engineering'?'AI':'React'}</div>
</article>`;}
  root.querySelectorAll('section[data-variant]').forEach((section, variantIndex) => {
    section.innerHTML = `<div class="stage">
<header class="top">
<span class="logo">⌁ daily.dev</span>
<span class="internal">INTERNAL CONCEPT</span>
<span class="avatar">CB</span>
</header>
<div class="shell">
<aside class="side">
<div class="navitem active">${icon('house')} My feed</div>
<div class="navitem">${icon('flame')} Popular</div>
<div class="navitem">${icon('bookmark')} Bookmarks</div>
<div class="side-label">Your agents</div>
<div class="agent-name">${icon('sparkles')} AI engineering</div>
<div class="hunting">Hunting</div>
<div class="agent-name">${icon('sparkles')} Frontend deep dives</div>
<div class="hunting">Hunting</div>
</aside>
<main>
<div class="heading">
<div>
<h1>Your daily dose</h1>
<div class="sub">Good reads. A little closer to what matters to you.</div>
</div>
<button class="feed-button " data-settings aria-expanded="false">${icon('sliders-horizontal')} Feed preferences</button>
</div>
<div class="settings" hidden>
<div class="settings-head">
<h2>Agent picks in your feed</h2>
<button class="feed-button " data-close aria-label="Close feed preferences">${icon('x')}</button>
</div>
<div class="sub">Your agents keep hunting. Choose which picks appear here.</div>
<label class="setting-row">
<span>AI engineering<small>Practical guides to building AI agents</small>
</span>
<input type="checkbox" data-pref="ai" checked aria-label="AI engineering picks in feed">
</label>
<label class="setting-row">
<span>Frontend deep dives<small>React architecture and performance</small>
</span>
<input type="checkbox" data-pref="frontend" checked aria-label="Frontend deep dive picks in feed">
</label>
</div>
<div class="heading">
<div class="tabs">
<span class="tab">For you</span>
<span class="quiet-tab">Following</span>
</div>
<label class="switch-label">
<input type="checkbox" data-show checked> Include agent picks ${icon('sparkles')}</label>
</div>
<div class="feed-grid">${variantIndex===0?posts.map(card).join(''):card(posts[0],0)+card(posts[2],2)+card(posts[3],3)+`<section class="digest">
<div class="digest-header">${icon('sparkles')}<div>
<h2>Your agents found a few good reads</h2>
<div class="sub">Picked for your interests, right here in your feed.</div>
</div>
</div>${digestRow(posts[1],1)}${digestRow(posts[4],4)}</section>`+card(posts[5],5)}</div>
<div class="status" role="status" aria-live="polite">
</div>
</main>
</div>
</div>`;
  });
  function sync() {
    root.querySelectorAll('[data-show]').forEach(el=>el.checked=state.showAgents);
    root.querySelectorAll('[data-pref]').forEach(el=>el.checked=state[el.dataset.pref]);
    root.querySelectorAll('[data-agent]').forEach(el=>el.hidden=!enabled({agent:el.dataset.agent}));
    root.querySelectorAll('.digest').forEach(el=>el.hidden=!(state.showAgents && (state.ai||state.frontend)));
  }
  root.querySelector('[data-variant-picker]').addEventListener('change', event => {
    root.querySelectorAll('section[data-variant]').forEach(section => {
      section.hidden = section.dataset.variant !== event.target.value;
    });
  });
  sync();
  root.addEventListener('change',event=>{
    const el=event.target;
    if(el.matches('[data-show]'))state.showAgents=el.checked;
    if(el.matches('[data-pref]'))state[el.dataset.pref]=el.checked;
    sync();
  });
  root.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    const section=button.closest('[data-variant]');
    if(button.matches('[data-settings],[data-close]')) {
      const panel=section.querySelector('.settings');panel.hidden=!panel.hidden;
      section.querySelector('[data-settings]').setAttribute('aria-expanded',String(!panel.hidden));
      (panel.hidden?section.querySelector('[data-settings]'):panel.querySelector('[data-close]')).focus();
    }
    if(button.matches('.why')) {
      const reason=button.closest('article').querySelector('.reason');reason.hidden=!reason.hidden;
      button.setAttribute('aria-expanded',String(!reason.hidden));button.textContent=reason.hidden?'Why this?':'Less';
    }
    if(button.matches('[data-save],[data-vote]')) {
      const pressed=button.getAttribute('aria-pressed')!=='true';button.setAttribute('aria-pressed',String(pressed));
      if(button.matches('[data-vote]'))button.querySelector('span').textContent=posts[Number(button.dataset.vote)].votes+(pressed?1:0);
      section.querySelector('.status').textContent=button.matches('[data-save]')?(pressed?'Saved to your bookmarks.':'Removed from bookmarks.'):(pressed?'Upvoted.':'Upvote removed.');
    }
  });
})();
