const apiHeaders = {'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'};
const json=(data,status=200)=>Response.json(data,{status,headers:apiHeaders});

function cleanMap(value,accept){
  if(!value||typeof value!=='object'||Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([key,item])=>
    key.length<=80&&!['__proto__','constructor','prototype'].includes(key)&&accept(item)).slice(0,300));
}

function cleanProgress(value){
  if(!value||typeof value!=='object'||Array.isArray(value)) return null;
  const counter=number=>Number.isSafeInteger(number)?Math.max(0,Math.min(10000000,number)):0;
  const answered=counter(value.answered);
  return {
    answered,correct:Math.min(answered,counter(value.correct)),
    checks:cleanMap(value.checks,item=>typeof item==='boolean'),
    lessons:cleanMap(value.lessons,item=>item===true),
    drafts:cleanMap(value.drafts,item=>typeof item==='string'&&item.length<=5000),
    deadline:Number.isSafeInteger(value.deadline)&&value.deadline>=0?value.deadline:0,
    instrument:typeof value.instrument==='string'?value.instrument.slice(0,80):''
  };
}

async function readBody(request){
  const reader=request.body?.getReader();
  if(!reader) return null;
  const decoder=new TextDecoder();
  let size=0;
  let text='';
  while(true){
    const {value,done}=await reader.read();
    if(done) break;
    size+=value.byteLength;
    if(size>180000){
      await reader.cancel();
      return null;
    }
    text+=decoder.decode(value,{stream:true});
  }
  try {return JSON.parse(text+decoder.decode());}catch{return null;}
}

function record(account){
  return {displayName:account.display_name,progress:JSON.parse(account.progress_json),revision:account.revision};
}

async function api(request,env,url){
  const accountRoute=url.pathname==='/api/account';
  const progressRoute=url.pathname==='/api/progress';
  if(!accountRoute&&!progressRoute) return json({error:'not_found'},404);
  const isRead=accountRoute&&request.method==='GET';
  const register=accountRoute&&request.method==='POST';
  const update=progressRoute&&request.method==='PUT';
  if(!isRead&&!register&&!update) return json({error:'method_not_allowed'},405);
  const user=request.headers.get('oai-authenticated-user-id');
  if(!user) return isRead?json({state:'signed-out'}):json({error:'sign_in_required'},401);
  if(!env.DB) return json({error:'database_unavailable'},503);
  const account=()=>env.DB.prepare(
    'SELECT display_name, progress_json, revision FROM learner_accounts WHERE user_id = ?'
  ).bind(user).first();
  if(isRead){
    const row=await account();
    return row?json({state:'registered',accountId:user,...record(row)}):json({state:'unregistered',accountId:user});
  }
  if(request.headers.get('Origin')!==url.origin||
    request.headers.get('Content-Type')?.split(';')[0]!=='application/json'){
    return json({error:'invalid_origin'},403);
  }
  const body=await readBody(request);
  if(!body) return json({error:'invalid_body'},400);
  if(body.accountId!==user) return json({error:'account_changed'},401);
  if(register){
    const name=typeof body.displayName==='string'?body.displayName.trim():'';
    if(!name||name.length>60||/[\u0000-\u001f\u007f]/.test(name)){
      return json({error:'invalid_name'},400);
    }
    await env.DB.prepare('INSERT INTO learner_accounts (user_id, display_name) VALUES (?, ?) ON CONFLICT(user_id) DO NOTHING')
      .bind(user,name).run();
    return json({state:'registered',accountId:user,...record(await account())},201);
  }
  const progress=cleanProgress(body.progress);
  if(!progress||!Number.isSafeInteger(body.revision)||body.revision<0) return json({error:'invalid_progress'},400);
  const updated=await env.DB.prepare(
    'UPDATE learner_accounts SET progress_json = ?, revision = revision + 1 WHERE user_id = ? AND revision = ? RETURNING revision'
  ).bind(JSON.stringify(progress),user,body.revision).first();
  if(updated) return json({revision:updated.revision});
  return await account()?json({error:'progress_conflict'},409):json({error:'register_first'},403);
}

export default {
  async fetch(request,env){
    const url=new URL(request.url);
    if(url.pathname.startsWith('/api/')){
      try{return await api(request,env,url);}
      catch{return json({error:'service_unavailable'},503);}
    }
    if(!['GET','HEAD'].includes(request.method)) return new Response('Method not allowed',{status:405});
    const asset=assets[url.pathname==='/'?'/index.html':url.pathname];
    if(!asset) return new Response('Not found',{status:404});
    const headers={
      'Content-Type':asset.type,
      'Cache-Control':asset.binary?'private, max-age=86400':'private, no-cache',
      'X-Content-Type-Options':'nosniff'
    };
    const body=request.method==='HEAD'?null:asset.binary?Uint8Array.from(atob(asset.body),char=>char.charCodeAt(0)):asset.body;
    return new Response(body,{headers});
  }
};
