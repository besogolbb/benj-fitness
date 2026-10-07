'use strict';
const CloudJournal = (() => {
  let config,key='',revision=null,pending=null,running=false,connected=false,conflict=false;
  let message='Saved on this device';
  function status(text){message=text;document.querySelectorAll('[data-sync-status]').forEach(node=>node.textContent=text);const node=document.querySelector('#save-status');if(node)node.textContent=text;}
  function panel(){return `<section class="section cloud-section"><div class="section-head"><h2>Your private journal</h2><span class="pill" data-sync-status>${message}</span></div><p class="muted">Save to your own server and open the same journal on your phone or computer.</p><form id="cloud-connect" class="form-grid"><label class="wide">Private access key<input name="key" type="password" minlength="32" required autocomplete="off" placeholder="Your server access key"></label><label class="check-line wide"><input type="checkbox" name="remember">Remember the key on this device</label><div class="actions wide"><button class="button">Connect journal</button><button type="button" class="button secondary" id="cloud-pull" ${connected?'':'disabled'}>Download latest</button><button type="button" class="button secondary" id="cloud-disconnect" ${connected?'':'disabled'}>Disconnect</button><button type="button" class="button secondary" id="cloud-retry" ${connected?'':'disabled'}>Retry sync</button></div></form><p class="muted"><small>Local saves keep working when you are offline. A newer journal from another device is never overwritten automatically. Export a backup before downloading over local changes.</small></p></section>`;}
  async function request(method='GET',journal){
    const response=await fetch('./api/journal',{method,headers:{Authorization:`Bearer ${key}`,...(method==='PUT'?{'Content-Type':'application/json','If-Match':`"${revision}"`}:{})},body:journal?JSON.stringify(journal):undefined,cache:'no-store'});
    const result=await response.json();if(!response.ok){const error=new Error(result.error||'Sync failed');error.status=response.status;throw error;}return result;
  }
  function remember(value){if(value)localStorage.setItem('benj-private-key',key);else localStorage.removeItem('benj-private-key');}
  async function connect(value,keep=false){
    if(running||connected){config.toast('Disconnect the current journal before connecting again.');return;}
    key=value.trim();status('Connecting...');
    try{
      const remote=await request();let goalsUpdated=false;
      if(remote.journal){config.validate(remote.journal);if(!confirm('Download your private server journal and replace the journal on this device? Export a local backup first if needed.')){key='';status('Saved on this device');return;}goalsUpdated=await config.replace(remote.journal);}
      else if(!confirm('Save this device’s journal to your private server?')){key='';status('Saved on this device');return;}
      revision=remote.revision;connected=true;conflict=false;pending=null;remember(keep);status('Connected to your server');
      if(!remote.journal||goalsUpdated)await sync(config.getState());
      config.render();
    }catch(error){connected=false;key='';status(error.message);config.toast(error.message);}
  }
  async function sync(journal){
    if(!connected||conflict)return;
    pending=JSON.parse(JSON.stringify(journal));if(running)return;
    running=true;
    try{while(pending&&connected&&!conflict){const snapshot=pending;pending=null;status('Saving to your server...');try{const result=await request('PUT',snapshot);revision=result.revision;status('Saved on your server');}catch(error){pending=pending||snapshot;if(error.status===409){conflict=true;status('Newer server journal — download latest');}else status('Saved locally — server sync pending');config.toast(error.message);break;}}}finally{running=false;}
  }
  async function pull(){
    if(running){config.toast('Wait for the current save to finish.');return;}
    try{const remote=await request();if(!remote.journal){config.toast('No server journal yet.');return;}config.validate(remote.journal);if(!confirm('Replace local changes with the latest server journal? Export a backup first if needed.'))return;connected=false;await config.replace(remote.journal);revision=remote.revision;pending=null;conflict=false;connected=true;status('Latest server journal downloaded');config.render();}catch(error){status(error.message);config.toast(error.message);}
  }
  function disconnect(){if(running){config.toast('Wait for the current save to finish.');return;}connected=false;key='';pending=null;revision=null;conflict=false;localStorage.removeItem('benj-private-key');status('Saved on this device');config.render();}
  function configure(options){config=options;const stored=localStorage.getItem('benj-private-key');if(stored){status('Private journal available — connect in Profile');}window.addEventListener('online',()=>{if(pending&&connected&&!conflict)sync(pending);});}
  document.addEventListener('submit',event=>{if(event.target.id!=='cloud-connect')return;event.preventDefault();const fields=new FormData(event.target);connect(fields.get('key'),fields.has('remember'));});
  document.addEventListener('click',event=>{const button=event.target.closest('button');if(!button||!config)return;if(button.id==='cloud-pull')pull();if(button.id==='cloud-disconnect')disconnect();if(button.id==='cloud-retry'&&connected&&!conflict)sync(pending||config.getState());});
  function mount(){const input=document.querySelector('#cloud-connect input[name="key"]');if(input){const stored=localStorage.getItem('benj-private-key');if(stored){input.value=stored;document.querySelector('#cloud-connect input[name="remember"]').checked=true;}}}
  return {configure,panel,mount,queue:journal=>{if(config&&connected)void sync(journal);},status:()=>message};
})();
