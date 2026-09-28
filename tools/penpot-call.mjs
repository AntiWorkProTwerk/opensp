// Local client for Penpot's official MCP server. No browser credentials.
import fs from 'node:fs';
const endpoint = 'http://localhost:4401/mcp';
const headers = {'Content-Type':'application/json', Accept:'application/json, text/event-stream'};
async function rpc(method, params, id) {
  const r = await fetch(endpoint, {method:'POST', headers, body:JSON.stringify({jsonrpc:'2.0',id,method,params})});
  if (r.headers.get('mcp-session-id')) headers['Mcp-Session-Id'] = r.headers.get('mcp-session-id');
  const body = await r.text();
  if (!r.ok) throw new Error(`${r.status}: ${body}`);
  const eventData = body.split('\n').find(l=>l.startsWith('data:'));
  const data = JSON.parse(eventData ? eventData.slice(5) : body);
  if (data.error) throw new Error(JSON.stringify(data.error));
  return data.result;
}
await rpc('initialize',{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'opensp-design',version:'1.0'}},1);
const [name, argument] = process.argv.slice(2);
const result = name === 'list' ? await rpc('tools/list',{},2) : await rpc('tools/call',{
  name,
  arguments: name === 'execute_code' ? {code:argument.startsWith('=') ? argument.slice(1) : fs.readFileSync(argument,'utf8')} : JSON.parse(argument || '{}')
},2);
for (const item of result.content || []) {
  if (item.type === 'text') console.log(item.text);
}
if (!result.content) console.log(JSON.stringify(result,null,2));
