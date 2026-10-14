from pathlib import Path
import json,zipfile,hashlib,argparse
root=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--repository',default='STR4DZN/holosuite-mana');args=p.parse_args()
m=json.loads((root/'module.json').read_text());url='https://github.com/'+args.repository
assert m['compatibility']=={'minimum':'13','maximum':'13'}
assert not any(m.get('relationships',{}).values()), 'O banco não deve declarar dependências'
m.update(url=url,manifest=url+'/releases/latest/download/module.json',download=url+'/releases/download/v'+m['version']+'/module.zip')
out=root/'dist';out.mkdir(exist_ok=True)
manifest=(json.dumps(m,ensure_ascii=False,indent=2)+'\n').encode();(out/'module.json').write_bytes(manifest)
files=[root/n for n in ['README.md','CHANGELOG.md','LICENSE','docs/design-research.md']]+sorted((root/'scripts').glob('*.js'))+sorted((root/'styles').glob('*.css'))+sorted((root/'assets').glob('*.svg'))
with zipfile.ZipFile(out/'module.zip','w',zipfile.ZIP_DEFLATED) as z:
 z.writestr('module.json',manifest)
 for path in files:z.write(path,str(path.relative_to(root)))
with zipfile.ZipFile(out/'module.zip') as z:
 assert z.testzip() is None
 assert z.read('module.json')==manifest
 for path in files:assert z.read(str(path.relative_to(root)))==path.read_bytes()
assert (root/'Banco-Mana-Preview.html').is_file()
(out/'Banco-Mana-Preview.html').write_bytes((root/'Banco-Mana-Preview.html').read_bytes())
(out/'release-notes.md').write_bytes((root/'docs/release-notes.md').read_bytes())
(out/'SHA256SUMS.txt').write_text(''.join(hashlib.sha256((out/name).read_bytes()).hexdigest()+'  '+name+'\n' for name in ['module.json','module.zip','Banco-Mana-Preview.html']))
print(json.dumps({'version':m['version'],'package_bytes':(out/'module.zip').stat().st_size,'files':len(files)+1,'integrity':'OK'},indent=2))
