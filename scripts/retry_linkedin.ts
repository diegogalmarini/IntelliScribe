
const SOCIAL_WEBHOOK_URL = "https://hook.eu1.make.com/jee1wehpjjx2cd2hn9i4m1tu7ay3a2ke";

const articles = [
    {
        title: "La Huella Vocal en la Era de la IA Multimodal: Desafíos y Horizontes",
        slug: "huella-vocal-ia-multimodal-desafios-horizontes",
        image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1200",
        linkedin_text: "La voz humana es una impronta única. Descubre cómo la IA multimodal está redefiniendo la identidad vocal y los desafíos éticos que enfrentamos. \n\nLee el análisis completo aquí: https://diktalo.com/blog/huella-vocal-ia-multimodal-desafios-horizontes #IA #Voz #Diktalo"
    },
    {
        title: "La Ola de Fraude por Deepfakes de Voz IA en 2026: Estrategias Proactivas de Prevención",
        slug: "fraude-deepfake-voz-ia-prevencion-2026",
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200",
        linkedin_text: "El avance de la IA trae nuevas amenazas. Los deepfakes de voz serán un reto crítico en 2026. Aprende cómo protegernos con biometría avanzada y Zero Trust. \n\nSoberanía de Voz: https://diktalo.com/blog/fraude-deepfake-voz-ia-prevencion-2026 #Ciberseguridad #Deepfake #IA"
    }
];

async function retry() {
    for (const article of articles) {
        console.log(`📤 Retrying: ${article.title}`);
        const payload = {
            title: article.title,
            url: `https://diktalo.com/blog/${article.slug}`,
            image_url: article.image,
            linkedin_text: article.linkedin_text
        };

        try {
            const response = await fetch(SOCIAL_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            console.log(`Status: ${response.status}`);
            if (!response.ok) {
                console.error(`Failed: ${await response.text()}`);
            } else {
                console.log("✅ Sent successfully!");
            }
        } catch (e) {
            console.error(`Error: ${e}`);
        }
    }
}

retry();
