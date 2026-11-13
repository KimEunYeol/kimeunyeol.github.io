export async function copyPortfolioLink(url,writeText){
  if(typeof writeText!=='function')return 'manual';
  try{await writeText(url);return 'copied';}catch{return 'manual';}
}

export async function sharePortfolio(data,share){
  if(typeof share!=='function')return 'unsupported';
  try{await share(data);return 'handed-off';}
  catch(error){return error?.name==='AbortError'?'cancelled':'failed';}
}

export function configurePortfolioSharing(root=document,platform=navigator){
  const dialog=root.querySelector('#portfolio-share-dialog');
  if(!dialog)return;
  const input=dialog.querySelector('#portfolio-share-url');
  const copyButton=dialog.querySelector('[data-copy-portfolio]');
  const nativeButton=dialog.querySelector('[data-native-portfolio-share]');
  const status=dialog.querySelector('.share-status');
  const title=dialog.querySelector('[data-portfolio-share-title]').textContent;
  nativeButton.hidden=typeof platform.share!=='function';

  root.querySelectorAll('[data-portfolio-share]').forEach(trigger=>{
    trigger.addEventListener('click',event=>{
      if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button!==0)return;
      event.preventDefault();
      status.textContent='';
      copyButton.textContent='링크 복사';
      if(!dialog.open)dialog.showModal();
      input.focus();input.select();
    });
  });

  copyButton.addEventListener('click',async()=>{
    copyButton.disabled=true;
    const writeText=typeof platform.clipboard?.writeText==='function'?url=>platform.clipboard.writeText(url):undefined;
    const result=await copyPortfolioLink(input.value,writeText);
    copyButton.disabled=false;
    if(result==='copied'){
      copyButton.textContent='복사 완료';
      status.textContent='공유 링크를 복사했습니다.';
    }else{
      input.focus();input.select();
      status.textContent='링크를 선택했습니다. 길게 누르거나 Ctrl+C 또는 ⌘C로 복사해 주세요.';
    }
  });

  nativeButton.addEventListener('click',async()=>{
    const share=typeof platform.share==='function'?data=>platform.share(data):undefined;
    const result=await sharePortfolio({title,text:title,url:input.value},share);
    status.textContent={
      'handed-off':'기기의 공유 창에 링크를 전달했습니다.',
      cancelled:'공유를 취소했습니다. 링크 복사로도 공유할 수 있습니다.',
      unsupported:'링크를 복사해 원하는 메신저에 붙여넣어 주세요.',
      failed:'공유 창을 열지 못했습니다. 링크 복사로 공유해 주세요.'
    }[result];
  });
}
