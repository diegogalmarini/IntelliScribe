
import re

FILE_PATH = r'c:\Users\diego\Diktalo\utils\blogData.ts'

def validate_data():
    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    # Re-use pattern from audit
    post_pattern = re.compile(r'\{\s*id:\s*"(\d+)",.*?(?=\s*\{|\s*\];\s*$)', re.DOTALL)
    matches = list(post_pattern.finditer(content))
    
    print("| ID | New Title (2026) | Old Slug | New Slug | Char Count | JSON Clean? |")
    print("| :--- | :--- | :--- | :--- | :--- | :--- |")

    for match in matches:
        block = match.group(0)
        
        # ID
        m_id = re.search(r'id:\s*"(\d+)"', block)
        pid = m_id.group(1) if m_id else "?"
        
        # Title
        m_title = re.search(r'title:\s*"([^"]+)"', block)
        p_title = m_title.group(1)[:30] + "..." if m_title else "?"
        
        # Slug (New)
        m_slug = re.search(r'slug:\s*"([^"]+)"', block)
        p_slug = m_slug.group(1) if m_slug else "?"

        # Content calc
        m_content = re.search(r'content:\s*`([^`]+)`', block)
        char_count = len(m_content.group(1)) if m_content else 0
        
        # JSON Clean check
        # Check if curly braces that look like JSON exist *inside* the content string
        is_clean = "✅"
        if m_content:
            body = m_content.group(1)
            if '{"@context"' in body or '"@type"' in body:
                is_clean = "❌ LEAK"
        
        print(f"| {pid} | {p_title} | - | {p_slug} | {char_count} | {is_clean} |")

if __name__ == "__main__":
    validate_data()
