const now=new Date();
const end=new Date("2026-08-02T00:00:00Z");

// Minimal spinner + RRVI-tag styling, injected here so no separate
// CSS file needs to be touched.
const style=document.createElement("style");
style.textContent=`
  .spinner{
    display:inline-block;
    width:14px;height:14px;
    border:2px solid rgba(0,0,0,0.15);
    border-top-color:currentColor;
    border-radius:50%;
    animation:eu-ai-act-spin 0.8s linear infinite;
    vertical-align:middle;
    margin-right:6px;
  }
  @keyframes eu-ai-act-spin{
    to{transform:rotate(360deg);}
  }
  .no-result.waiting{opacity:0.85;}
  .rrvi-card{
    display:inline-block;
    margin-top:8px;
    margin-right:6px;
    padding:2px 8px;
    border-radius:4px;
    font-size:0.85em;
    background:rgba(0,0,0,0.06);
  }
  .rrvi-label{
    font-weight:600;
    margin-right:4px;
  }
`;
document.head.appendChild(style);

const meta=document.getElementById("meta");

if(meta){
  meta.innerHTML=
  "Version v0.4.0<br>Updated: "+
  now.toUTCString()+
  "<br>Days remaining: "+
  Math.max(0,Math.ceil((end-now)/86400000))+
  " days";
}

const API=
"https://eu-ai-act-conversation-worker-test.aipath512.workers.dev/search?q=";

const OFFICIAL_EU_AI_ACT_URL=
"https://eur-lex.europa.eu/eli/reg/2024/1689/oj";

// Rotating reassurance messages — shown while waiting, so a slow
// AI response reads as "working" instead of "broken". Cycles every
// 4 seconds; a live elapsed-seconds counter runs alongside.
const WAITING_MESSAGES=[
  "Reading the EU AI Act...",
  "Checking the official regulation text...",
  "Looking for the relevant articles...",
  "Preparing a grounded answer...",
  "Almost there — this can take up to a minute..."
];

let waitingInterval=null;
let waitingStartTime=null;

function startWaitingIndicator(answerEl){
  waitingStartTime=Date.now();
  let messageIndex=0;

  function render(){
    const elapsedSeconds=Math.floor((Date.now()-waitingStartTime)/1000);
    answerEl.innerHTML=
      "<div class='no-result waiting'>"+
      "<span class='spinner' aria-hidden='true'></span> "+
      escapeHtml(WAITING_MESSAGES[messageIndex % WAITING_MESSAGES.length])+
      " ("+elapsedSeconds+"s)"+
      "</div>";
  }

  render();

  waitingInterval=setInterval(function(){
    messageIndex++;
    render();
  },4000);
}

function stopWaitingIndicator(){
  if(waitingInterval){
    clearInterval(waitingInterval);
    waitingInterval=null;
  }
}

async function ask(){

  const answer=document.getElementById("answer");

  const question=
  document.getElementById("question").value.trim();


  if(!question){

    answer.innerHTML=
    "<div class='no-result'>Please ask a question first.</div>";

    return;
  }

  const askButton=document.getElementById("ask");
  if(askButton){
    askButton.disabled=true;
  }

  startWaitingIndicator(answer);


  try{

    const response=
    await fetch(API+encodeURIComponent(question));


    const data=
    await response.json();


    stopWaitingIndicator();

    // Conversational shape: { generated_answer, sources, generation_error, rrvi_results }
    if(data.generated_answer){

      const sourcesHtml=
      (data.sources||[]).map(s=>`
        <a href="${escapeAttr(s.url||s.source_url||OFFICIAL_EU_AI_ACT_URL)}"
           target="_blank"
           rel="noopener">
           ${escapeHtml(s.label||s.article||s.title||"EU AI Act Official Text")}
        </a>
      `).join("");

      const rrviHtml=
      (data.rrvi_results||[]).map(r=>`
        <div class="rrvi-card">
          <span class="rrvi-label">RRVI</span>
          ${escapeHtml(r.source||"")}
        </div>
      `).join("");

      answer.innerHTML=`
        <article class="result-card">
          <p class="result-text">
            ${escapeHtml(data.generated_answer)}
          </p>
          ${
            sourcesHtml
            ?
            `<div class="sources"><span>Sources</span>${sourcesHtml}</div>`
            :
            ""
          }
          ${rrviHtml}
        </article>
      `;

      if(data.generation_error){
        answer.innerHTML+=
        "<div class='no-result'>Note: "+
        escapeHtml(data.generation_error)+
        "</div>";
      }

      return;
    }


    // Fallback: old raw-snippet shape { results: [...] }
    const results=data.results||[];


    answer.innerHTML=
    results.map((x,i)=>`

      <article class="result-card">

        <div class="result-label">
          Act ${i+1}
        </div>

        <p class="result-text">
          ${escapeHtml(x.snippet||"")}
        </p>

        <div class="sources">

          <span>Sources</span>

          <a href="${escapeAttr(x.source_url||OFFICIAL_EU_AI_ACT_URL)}"
             target="_blank"
             rel="noopener">
             EU AI Act Official Text
          </a>

          ${
            x.article
            ?
            `<span>${escapeHtml(x.article)}</span>`
            :
            ""
          }

          ${
            x.title
            ?
            `<span>${escapeHtml(x.title)}</span>`
            :
            ""
          }

        </div>

      </article>

    `).join("")
    ||
    "<div class='no-result'>No answer found.</div>";

  }

  catch(error){

    stopWaitingIndicator();

    answer.innerHTML=
    "<div class='no-result'>"+
    escapeHtml(error.message)+
    "</div>";

  }

  finally{

    if(askButton){
      askButton.disabled=false;
    }
  }

}


function escapeHtml(value){

  return String(value)
  .replaceAll("&","&amp;")
  .replaceAll("<","&lt;")
  .replaceAll(">","&gt;")
  .replaceAll('"',"&quot;")
  .replaceAll("'","&#039;");

}


function escapeAttr(value){

  return escapeHtml(value);

}


document
.getElementById("ask")
.addEventListener(
"click",
ask
);


document
.getElementById("question")
.addEventListener(
"keydown",
function(event){

  if(event.key==="Enter"){
    ask();
  }

});
