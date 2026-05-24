import os, re

base = r'C:\Users\Sayem\ToughYuff2.0'

# Read and fix index.html
fp = os.path.join(base, 'index.html')
with open(fp, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove all SEO-related tags that got duplicated
content = re.sub(r'<meta property="og:[^"]*"[^>]*>', '', content)
content = re.sub(r'<meta name="twitter:[^"]*"[^>]*>', '', content)
content = re.sub(r'<link rel="canonical"[^>]*>', '', content)
content = re.sub(r'<meta name="robots"[^>]*>', '', content)
content = re.sub(r'<script type="application/ld\\+json">.*?</script>', '', content, flags=re.DOTALL)
content = re.sub(r'<meta name="format-detection"[^>]*>', '', content)

# Clean up extra blank lines
content = re.sub(r'\n[ \t]*\n[ \t]*\n+', '\n\n', content)

with open(fp, 'w', encoding='utf-8') as f:
    f.write(content)

print('index.html cleaned')
print('Done!')
