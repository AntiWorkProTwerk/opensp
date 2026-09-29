// Local client for Penpot's official MCP server. No browser credentials.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
const args=process.argv.slice(2);
const credentialPath=path.join(process.env.LOCALAPPDATA,'OpenSP','penpot-mcp.xml');
const hosted=args[0]==='--hosted'||(args[0]!=='--local'&&fs.existsSync(credentialPath));
if(['--hosted','--local'].includes(args[0]))args.shift();
let endpoint = 'http://localhost:4401/mcp';
const headers = {'Content-Type':'application/json', Accept:'application/json, text/event-stream'};
async function connectHosted(){
  if(!fs.existsSync(credentialPath))throw Error('Hosted connection is not configured.');
  const url=execFileSync('pwsh',['-NoProfile','-Command',"$s=Import-Clixml -LiteralPath (Join-Path $env:LOCALAPPDATA 'OpenSP/penpot-mcp.xml'); [System.Net.NetworkCredential]::new('', $s).Password"],{encoding:'utf8',windowsHide:true}).trim();
  const parsed=new URL(url);
  if(parsed.origin!=='https://design.penpot.app'||parsed.pathname!=='/mcp/stream')throw Error('Unexpected hosted endpoint');
  endpoint=url;
}
async function rpc(method, params, id) {
  const r = await fetch(endpoint, {method:'POST', headers, body:JSON.stringify({jsonrpc:'2.0',id,method,params}),signal:AbortSignal.timeout(60000)});
  if (r.headers.get('mcp-session-id')) headers['Mcp-Session-Id'] = r.headers.get('mcp-session-id');
  const body = await r.text();
  if (!r.ok) throw new Error(`MCP returned HTTP ${r.status}`);
  const eventData = body.split('\n').find(l=>l.startsWith('data:'));
  const data = JSON.parse(eventData ? eventData.slice(5) : body);
  if (data.error) throw new Error(JSON.stringify(data.error));
  return data.result;
}
if(hosted)await connectHosted();
await rpc('initialize',{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'opensp-design',version:'1.1'}},1);
const [name, argument] = args;
const result = name === 'list' ? await rpc('tools/list',{},2) : await rpc('tools/call',{
  name,
  arguments: name === 'execute_code' ? {code:argument.startsWith('=') ? argument.slice(1) : fs.readFileSync(argument,'utf8')} : JSON.parse(argument || '{}')
},2);
for (const item of result.content || []) {
  if (item.type === 'text') {
    if(args[2]==='--out' && item.text.trimStart().startsWith('<svg')) {
      fs.writeFileSync(args[3],item.text);
      console.log('Exported SVG to '+args[3]);
    } else console.log(item.text);
  }
  if (item.type === 'image' && args[2]==='--out') {
    fs.writeFileSync(args[3],Buffer.from(item.data,'base64'));
    console.log('Exported image to '+args[3]);
  }
}
if (!result.content) console.log(JSON.stringify(result,null,2));
if(result.isError||result.content?.some(item=>item.type==='text'&&item.text.startsWith('Tool execution failed:')))process.exitCode=1;
