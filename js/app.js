const now=new Date();
const end=new Date("2026-08-02T00:00:00Z");

const meta=document.getElementById("meta");

if(meta){
  meta.innerHTML=
  "Version v0.2.0<br>Updated: "+
  now.toUTCString()+
  "<br>Days remaining: "+
  Math.max(0,Math.ceil((end-now)/86400000))+
  " days";
}

const API=
"https://eu-ai-act-search-api.aipath512.workers.dev/search?q=";

const OFFICIAL_EU_AI_ACT_URL=
"https://eur-lex.europa.eu/eli/reg/2024/1689/oj";


async function ask(){

  const answer=document.getElementById("answer");

  const question=
  document.getElementById("question").value.trim();


  if(!question){

    answer.innerHTML=
    "<div class='no-result'>Please ask a question first.</div>";

    return;
  }


  answer.innerHTML=
  "<div class='no-result'>Asking the EU AI Act...</div>";


  try{

    const response=
    await fetch(API+encodeURIComponent(question));


    const data=
    await response.json();


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

    answer.innerHTML=
    "<div class='no-result'>"+
    escapeHtml(error.message)+
    "</div>";

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
