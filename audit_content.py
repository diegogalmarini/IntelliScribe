
import re
import os

FILE_PATH = r'c:\Users\diego\Diktalo\utils\blogData.ts'

def audit_blog_data():
    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to capture individual blog post objects
    # This assumes standard formatting as seen in the file
    post_pattern = re.compile(r'\{\s*id:\s*"(\d+)",.*?(?=\s*\{|\s*\];\s*$)', re.DOTALL)
    
    matches = list(post_pattern.finditer(content))
    
    print(f"{'ID':<4} | {'Chars':<6} | {'Slug':<40} | {'Title Fragment'}")
    print("-" * 100)

    for match in matches:
        post_block = match.group(0)
        
        # Extract ID
        id_match = re.search(r'id:\s*"([^"]+)"', post_block)
        p_id = id_match.group(1) if id_match else "ERR"

        # Extract Slug
        slug_match = re.search(r'slug:\s*"([^"]+)"', post_block)
        slug = slug_match.group(1) if slug_match else "ERR"

        # Extract Title
        title_match = re.search(r'title:\s*"([^"]+)"', post_block)
        title = title_match.group(1) if title_match else "ERR"

        # Extract Content
        # Content is between content: ` and `, jsonLd
        content_match = re.search(r'content:\s*`([^`]+)`', post_block)
        if content_match:
            body_text = content_match.group(1)
            char_count = len(body_text)
        else:
            char_count = 0

        print(f"{p_id:<4} | {char_count:<6} | {slug[:38]:<40} | {title[:40]}...")

if __name__ == "__main__":
    audit_blog_data()
