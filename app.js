const BENCHMARK=[/* lascia invariato il benchmark già presente */];

let st={lang:'en',i:0,ans:[],tasks:[]};

function r(h){document.getElementById('app').innerHTML=h}
function sh(a){return [...a].sort(()=>Math.random()-0.5)}

function start(){
r(`<div class=card>
<h1>Museum AI Label Challenge</h1>
<select id=l>
<option value=en>English</option>
<option value=it>Italiano</option>
</select>
<button onclick='welcome()'>Continue</button>
</div>`)
}

function welcome(){
st.lang=document.getElementById('l').value;
r(`<div class=card>
<img class='hero' src='MuseumVsAi1.jpg'>
<h2>${TEXT[st.lang].welcome}</h2>
<button onclick='profile()'>${TEXT[st.lang].cont}</button>
</div>`)
}

function profile(){
r(`<div class=card>
<h2>${TEXT[st.lang].profile}</h2>

<label>Age</label>
<select id=age>
<option>&lt;18</option>
<option>18-30</option>
<option>31-50</option>
<option>51-65</option>
<option>&gt;65</option>
</select>

<br>

<label>Language</label>
<select id=nl>
<option>Italian</option>
<option>English</option>
<option>French</option>
<option>Spanish</option>
<option>German</option>
<option>Other</option>
</select>

<br>

<label>Expertise</label>
<select id=ex>
<option>None</option>
<option>Amateur naturalist</option>
<option>Entomologist</option>
<option>Museum curator</option>
</select>

<br>

<button onclick='tutorial()'>${TEXT[st.lang].cont}</button>
</div>`)
}

function tutorial(){

st.age_class=document.getElementById('age').value;
st.native_language=document.getElementById('nl').value;
st.expertise=document.getElementById('ex').value;

r(`
<div class="card">
<img style="max-width:100%" src="images/Tutorial_${st.lang.toUpperCase()}.jpg">
<br>
<button onclick="begin()">Continue</button>
</div>
`)
}

function begin(){
st.tasks=sh(BENCHMARK)
.slice(0,3)
.flatMap(s=>s.tasks.map(t=>({...t,image:s.image,stack_id:s.stack_id})));

st.i=0;
next();
}

function norm(s){
return (s||'').toLowerCase().trim().replace(/\s+/g,' ')
}

function lev(a,b){
let m=Array(b.length+1).fill().map(()=>Array(a.length+1).fill(0));
for(let i=0;i<=b.length;i++)m[i][0]=i;
for(let j=0;j<=a.length;j++)m[0][j]=j;
for(let i=1;i<=b.length;i++)
for(let j=1;j<=a.length;j++)
m[i][j]=b[i-1]==a[j-1]?
m[i-1][j-1]:
1+Math.min(m[i-1][j],m[i][j-1],m[i-1][j-1]);
return m[b.length][a.length]
}

function acc(a,b){
a=norm(a);
b=norm(b);
return 100*(1-lev(a,b)/Math.max(1,b.length))
}

function next(){

if(st.i>=st.tasks.length)return res();

let t=st.tasks[st.i];
st.t=Date.now();

r(`
<div class=card>
<div class=bar>
<div class=fill style='width:${st.i/9*100}%'></div>
</div>

<div class=layout>

<div class=img>
<img src='images/${t.image}'>
</div>

<div>
<h3>${st.i+1}/9</h3>
<p>${st.lang=='it'?t.question_it:t.question_en}</p>
<input id=a>
<button onclick='save()'>Next</button>
</div>

</div>
</div>
`)
}

function save(){

let t=st.tasks[st.i];
let a=document.getElementById('a').value;

st.ans.push({
stack_id:t.stack_id||'',
task_type:t.type,
answer:a,
expected:t.expected,
acc:acc(a,t.expected),
time:(Date.now()-st.t)/1000
});

st.i++;
next();
}

async function res(){

const GOOGLE_SCRIPT_URL='https://script.google.com/macros/s/AKfycbyGUPZYWYvUb0FB9jUijpPRg-jQ1TyDoYigZPLQTZ3l3vIZn1E3EHtpQRBciMpOdTHy/exec';

let A=st.ans.reduce((s,x)=>s+x.acc,0)/9;
let T=st.ans.reduce((s,x)=>s+x.time,0)/9;
let S=Math.min(100,100*(30/T));
let F=.7*A+.3*S;

let participantId=localStorage.participant_id||(localStorage.participant_id='P-'+Math.random().toString(36).slice(2,10));
let sessionId='S-'+Date.now();

let saved=0;

for(const row of st.ans){

if(!row) continue;

fetch(GOOGLE_SCRIPT_URL,{
method:'POST',
mode:'no-cors',
body:JSON.stringify({

participant_id:participantId,
session_id:sessionId,

language_ui:st.lang,
native_language:st.native_language || '',
age_class:st.age_class || '',
expertise:st.expertise || '',

stack_id:(row?.stack_id || ""),
task_type:(row?.task_type || ""),
answer:(row?.answer || ""),
expected:(row?.expected || ""),
accuracy:Number(row?.acc || 0),
time_seconds:Number(row?.time || 0),
completion_status:'completed'

})
}).catch(console.error);

saved++;
}

saved=st.ans.length;

r(`
<div class=card>
<h2>Results</h2>
<p>Accuracy: ${A.toFixed(1)}</p>
<p>Average Time: ${T.toFixed(1)} s</p>
<p>Speed Score: ${S.toFixed(1)}</p>
<p>Final Score: ${F.toFixed(1)}</p>
<p>Rows saved: ${saved}/9</p>
</div>
`)
}

start();
