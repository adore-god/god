import os

# The replacement content
replacement = '''<body>
<div class="header">
<a href="index.html">The Way</a>
</div>'''

# Loop through all files in the current directory
for filename in os.listdir('.'):
    if filename.endswith('.html'):
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()

        # Replace only the first occurrence of <body>
        new_content = content.replace('<body>', replacement, 1)

        # Write back only if there was a change
        if new_content != content:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filename}")
        else:
            print(f"No <body> tag found in {filename}")
