export function newestFirst(entries){
  for(const entry of entries){
    if(typeof entry.sortDate!=='string'||!/^\d{4}(?:-(?:0[1-9]|1[0-2])(?:-(?:0[1-9]|[12]\d|3[01]))?)?$/.test(entry.sortDate)){
      throw new Error(`Missing or invalid chronology date: ${entry.slug||entry.name||entry.title}`);
    }
  }
  return [...entries].sort((a,b)=>b.sortDate.localeCompare(a.sortDate));
}
