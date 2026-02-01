
import re
import random

FILE_PATH = r'c:\Users\diego\Diktalo\utils\blogData.ts'

# Templates for expansion
IMPACT_TABLE_TEMPLATE = """
### Tabla de Impacto: ROI y Eficiencia en 2026
La implementación de esta tecnología no es opcional; es un requisito de supervivencia operativa.

| Métrica Crítica | Estado Actual (2025) | Con Diktalo Elite (2026) | Mejora Proyectada |
| :--- | :--- | :--- | :--- |
| **Tiempo de Procesamiento** | 4.5 Horas/Semana | 15 Minutos/Semana | **x18 Velocidad** |
| **Precisión de Datos** | 85% (Error Humano) | 99.9% (Verificación IA) | **Confianza Total** |
| **Coste Operativo** | Alto (Horas Hombre) | Marginal (SaaS) | **-70% OPEX** |
"""

USE_CASES_TEMPLATE = """
### Casos de Uso: Aplicación en la Vida Real
¿Cómo utilizan los líderes esta tecnología hoy?

1.  **Sector Financiero (Fintech)**: Automatización de actas de comité de riesgos. Reduce el tiempo de aprobación de créditos corporativos en un 40% al tener transcripciones auditables instantáneas.
2.  **Sector Salud (HealthTech)**: Doctores utilizando comandos de voz para actualizar historiales clínicos (EHR) durante la consulta, mejorando la atención al paciente sin perder contacto visual.
3.  **Legal & Compliance**: Abogados generando borradores de contratos vinculantes en tiempo real durante la negociación, cerrando acuerdos en la misma reunión.
"""

FAQ_TEMPLATE = """
### FAQ Técnica: Preguntas de Arquitectura
**¿Es compatible con sistemas Legacy?**
Sí. Nuestra API mantiene retrocompatibilidad con sistemas SOAP/XML bancarios, asegurando que la innovación no rompa procesos críticos antiguos.

**¿Qué latencia tiene el procesamiento en el Edge?**
Garantizamos <200ms para funciones críticas de voz, permitiendo una experiencia conversacional fluida que se siente instantánea.

**¿Cómo se maneja la soberanía de datos en entornos multinube?**
Utilizamos sharding geográfico. Tú eliges si tus datos residen en AWS Frankfurt, Azure Virginia o Google Cloud Singapur, cumpliendo estrictamente con la normativa local.
"""

def clean_slug(title, keyword):
    # Create semantic slug: keyword-rest-of-title-2026
    # Simplify: just keyword-topic-2026
    base = title.lower().replace(':', '').replace('?', '').replace('¿', '')
    words = base.split()
    # Find keyword index or just take first few words
    clean_words = [w for w in words if len(w) > 2][:4]
    slug = "-".join(clean_words) + "-2026"
    return re.sub(r'[^a-z0-9-]', '', slug)

def optimize_title(title):
    if "2026" not in title:
        return f"{title} (Edición 2026)"
    return title

def expand_content():
    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern to find blog posts
    # We rebuild the array item by item
    
    # Split by objects might be hard with regex alone due to nesting. 
    # But since we have a structured file, let's try a robust split.
    
    # Ensure strict separation of JSON-LD
    # Logic: Find content: `...`, check length. If short -> Append templates.
    
    # We will use a closure to process each match
    def process_post(match):
        full_block = match.group(0)
        
        # 1. Extract and Clean Content
        content_match = re.search(r'content:\s*`([^`]+)`', full_block)
        if not content_match: return full_block # Skip if weird
        
        body_text = content_match.group(1)
        original_len = len(body_text)
        
        # 2. Extract Category for Smarter Expansion (Optional/Simple)
        cat_match = re.search(r'category:\s*"([^"]+)"', full_block)
        category = cat_match.group(1) if cat_match else "General"
        
        # 3. Expansion Logic
        new_body = body_text
        if original_len < 2500:
            print(f"Expanding ID {get_id(full_block)} ({original_len} chars)...")
            
            # Append missing sections check
            if "Tabla de Impacto" not in new_body:
                new_body += "\n\n" + IMPACT_TABLE_TEMPLATE
            if "Casos de Uso" not in new_body:
                new_body += "\n\n" + USE_CASES_TEMPLATE
            if "FAQ Técnica" not in new_body:
                new_body += "\n\n" + FAQ_TEMPLATE
        
        # 4. SEO Polish: Slug & Title
        title_match = re.search(r'title:\s*"([^"]+)"', full_block)
        current_title = title_match.group(1) if title_match else ""
        
        new_title = optimize_title(current_title)
        new_slug = clean_slug(current_title, category)
        
        # Replace in block
        if title_match:
            full_block = full_block.replace(f'title: "{current_title}"', f'title: "{new_title}"')
            
        slug_match = re.search(r'slug:\s*"([^"]+)"', full_block)
        if slug_match:
            full_block = full_block.replace(f'slug: "{slug_match.group(1)}"', f'slug: "{new_slug}"')

        # Replace content
        # Escape backticks if any in new_body (unlikely in templates)
        full_block = full_block.replace(f'content: `{body_text}`', f'content: `{new_body}`')
        
        return full_block

    def get_id(block):
        m = re.search(r'id:\s*"(\d+)"', block)
        return m.group(1) if m else "?"

    # Regex find/replace with callback
    # Match everything between { and }, that looks like a post property
    # We assume objects start with { and contain id: "..."
    # Warning: simple regex for nested objects is risky. 
    # But blogData.ts is flat list of objects.
    
    # Better approach: Split string by `  {` (indentation) and rebuild
    
    # Specific regex to match the BlogPosting object
    # {
    #    id: ...
    #    ...
    # }
    
    new_content = re.sub(r'\{\s*id:\s*"\d+".*?(?=\},?\s*\{|\}\s*\])', process_post, content, flags=re.DOTALL)
    
    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print("Expansion Complete.")

if __name__ == "__main__":
    expand_content()
