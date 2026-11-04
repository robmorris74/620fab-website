"""Check original sales content and unchanged pages against the reviewed main."""
from pathlib import Path
import re, subprocess, json
root=Path(__file__).resolve().parent.parent
base='6e3c7be'
def old(name): return subprocess.check_output(['git','show',f'{base}:{name}'],cwd=root,text=True)
for n in [1,2]:
 name=f'cabin-{n}.html';a=old(name);b=(root/name).read_text();b=re.sub(r'<form .*?</form>','',b,flags=re.S)
 assert re.findall(r'<script type="application/ld\+json">(.*?)</script>',a)==re.findall(r'<script type="application/ld\+json">(.*?)</script>',b)
 assert re.findall(r'<dl.*?</dl>',a)==re.findall(r'<dl.*?</dl>',b)
 assert re.findall(r'<a[^>]+href="tel:[^"]+"[^>]*>.*?</a>',a)==re.findall(r'<a[^>]+href="tel:[^"]+"[^>]*>.*?</a>',b)
 assert re.findall(r'<head>.*?</head>',a)==re.findall(r'<head>.*?</head>',b)
 assert re.findall(r'<header.*?</header>',a)==re.findall(r'<header.*?</header>',b)
 assert re.findall(r'<footer.*?</footer>',a)==re.findall(r'<footer.*?</footer>',b)
 print(f'PASS: {name} original metadata, specs, prices, call links, header and footer')
a=old('index.html');b=(root/'index.html').read_text()
b=re.sub(r'<section id="project-request".*?</section>\n','',b,flags=re.S)
b=b.replace('<a class="btn secondary" href="#project-request">Start a Project</a>','')
assert a==b
print('PASS: homepage byte-identical outside two additions')
for name in ['homes.html','about.html','offices.html','farms.html','specialty.html','service-area.html','job-site-boxes.html','inventory.css','CNAME','.htaccess','sitemap.xml','robots.txt']:
 assert (root/name).read_text()==old(name),name
print('PASS: 12 unrelated content/configuration files unchanged')
