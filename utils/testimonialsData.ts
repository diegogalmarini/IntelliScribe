export interface Testimonial {
    id: string;
    name: string;
    role: string;
    body: string;
    image: string;
    stars: number;
}

export const testimonialsData: Testimonial[] = [
    {
        id: "1",
        name: "Dra. Ana López",
        role: "Residente de Cardiología",
        body: "Antes pasaba 2 horas transcribiendo notas SOAP. Con Diktalo, grabo la consulta (con permiso) y tengo el reporte en el EHR en segundos. Es magia pura.",
        image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "2",
        name: "Carlos Méndez",
        role: "VP de Ventas, TechFlow",
        body: "El análisis BANT automático ha cambiado nuestro CRM. Mi equipo ya no toma notas, solo vende. La integración con el marcador VoIP es un plus enorme.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "3",
        name: "Elena R.",
        role: "Periodista de Investigación",
        body: "La precisión en inglés y español mezclados es superior a cualquier otra herramienta. Y saber que mis fuentes están seguras en servers encriptados es vital.",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "4",
        name: "James Wilson",
        role: "Senior Project Manager",
        body: "The Chrome extension is dead simple. I use it for every Google Meet call. Sometimes it glitches on very long calls, but the recovery feature always saves the data.",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 4
    },
    {
        id: "5",
        name: "Marta Sánchez",
        role: "Abogada Penalista",
        body: "Me salvó en un juicio. La transcripción no es perfecta al 100% pero el buscador me permitió encontrar el momento exacto donde el testigo se contradijo.",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "6",
        name: "Sandeep K.",
        role: "Software Architect",
        body: "Diktalo's ability to handle technical jargon is impressive. We use it for our sprint planning and architecture reviews. It's our collective memory.",
        image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "7",
        name: "Lucía Fernández",
        role: "Estudiante de Psicología",
        body: "La uso para grabar mis clases y las prácticas. Me ayuda un montón a repasar conceptos que a veces se me pasan cuando tomo notas a mano.",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "8",
        name: "Robert Moore",
        role: "Real Estate Broker",
        body: "Client walkthroughs became much more efficient. I just walk and talk, and then Diktalo extracts the key features the client liked into a tidy PDF.",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 4
    },
    {
        id: "9",
        name: "Sofía V.",
        role: "UX Researcher",
        body: "Hacer tests de usuario es agotador si tienes que transcribir todo después. Con esta herramienta el proceso de análisis se redujo a la mitad del tiempo.",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "10",
        name: "David T.",
        role: "Executive Coach",
        body: "It's my private accountability partner. Reviewing my own sessions with clients allows me to spot my own speaking patterns and improve.",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "11",
        name: "Beatriz M.",
        role: "Traductora Jurada",
        body: "Me encanta que reconoce los cambios de idioma sobre la marcha. Trabajo entre Madrid y Londres y es la única que no se vuelve loca con el espanglish.",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "12",
        name: "Kevin Lee",
        role: "Startup Founder",
        body: "Used it for our investor pitches. The AI summary helped us refine our messaging based on the questions they actually asked.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "13",
        name: "Ricardo G.",
        role: "Ingeniero Civil",
        body: "Visitas de obra mucho más fáciles. Registro todo en audio mientras camino por la estructura y luego genero el acta en la oficina.",
        image: "https://images.unsplash.com/photo-1492562080023-ab3dbdf9bbbd?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 4
    },
    {
        id: "14",
        name: "Sarah Jenkins",
        role: "Learning & Development Manager",
        body: "Creating training materials from workshop recordings used to be a nightmare. Diktalo extracts the core lessons automatically.",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "15",
        name: "Oscar Ruiz",
        role: "Podcaster",
        body: "La precisión es brutal. Me ahorro un montón de tiempo sacando los 'show notes' y los fragmentos para redes sociales.",
        image: "https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "16",
        name: "Emily Chen",
        role: "Customer Success Lead",
        body: "We record our onboarding calls. The ability to search through months of conversations to find specific client requests is game-changing.",
        image: "https://images.unsplash.com/photo-1531123897727-8f129e16fd3c?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "17",
        name: "Felipe Soto",
        role: "Chef & Consultor",
        body: "Incluso con el ruido de la cocina, Diktalo pilla bien mis notas mentales para los nuevos menús. Muy práctico.",
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 4
    },
    {
        id: "18",
        name: "Rachel Goldberg",
        role: "Therapist",
        body: "Being present with my patients is my priority. Diktalo allows me to focus on them, knowing the clinical notes will be accurate and secure.",
        image: "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "19",
        name: "Jorge Blanco",
        role: "Director de Marketing",
        body: "Nuestras reuniones de brainstorming ahora son reales. Nadie tiene que estar pegado al teclado, todos aportan.",
        image: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "20",
        name: "Nicole Smith",
        role: "Graduate Student",
        body: "I struggle with dyslexia, so taking fast notes is hard. Diktalo changed everything for me. Now I can just listen and engage.",
        image: "https://images.unsplash.com/photo-1557296387-5358ad7997bb?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "21",
        name: "Paco Herrera",
        role: "Vendedor de Seguros",
        body: "Llamo a un montón de gente al día. El Dialer integrado con grabación me ayuda a no olvidar ninguna promesa que le hago al cliente.",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 4
    },
    {
        id: "22",
        name: "Linda Wu",
        role: "E-commerce Specialist",
        body: "Managing suppliers across different time zones means lots of late-night calls. Diktalo helps me keep track of all logistics details.",
        image: "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "23",
        name: "Antonio P.",
        role: "Profesor de Historia",
        body: "Grabo mis propias lecciones para revisarlas y mejorar mi didáctica. También les paso las transcripciones a mis alumnos con dificultades.",
        image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "24",
        name: "Susan Miller",
        role: "Freelance Producer",
        body: "Interviews, strategy calls, set notes... it all goes into Diktalo. It's like having a personal assistant for a fraction of the cost.",
        image: "https://images.unsplash.com/photo-1567532939604-b6b5b0ad2f04?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 4
    },
    {
        id: "25",
        name: "Mateo Díaz",
        role: "Head of Talent",
        body: "Las entrevistas de trabajo fluyen mucho mejor. Puedo mirar al candidato a los ojos y luego analizar sus respuestas con calma.",
        image: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "26",
        name: "Chris Evans",
        role: "Agile Coach",
        body: "Retrospectives are finally documented without being boring. The AI-generated action items are remarkably on point.",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "27",
        name: "Isabel Torres",
        role: "Diseñadora de Interiores",
        body: "Las notas de voz que me mando a mí misma mientras visito tiendas se convierten en inventarios organizados. Un sueño.",
        image: "https://images.unsplash.com/photo-1594744188884-d2c37bc1493b?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 4
    },
    {
        id: "28",
        name: "Tom Harrison",
        role: "Sales Executive",
        body: "The dialer works flawlessly. Being able to record calls in compliance with local laws has never been easier.",
        image: "https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "29",
        name: "Claudia Romero",
        role: "Consultora de RRHH",
        body: "Manejo mucha información confidencial. Me da mucha tranquilidad saber que Diktalo cumple con RGPD y encripta todo.",
        image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "30",
        name: "Alex Johnson",
        role: "Venture Capital Analyst",
        body: "Processing 10 startup pitches a day is daunting. Diktalo's summaries give me the highlights so I can decide where to dive deep.",
        image: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "31",
        name: "Valeria N.",
        role: "Científica de Datos",
        body: "Como profesional técnico, aprecio mucho el vocabulario personalizado. Ahora pilla bien términos como 'gradient boosting' o 'backpropagation'.",
        image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "32",
        name: "Mark Peterson",
        role: "Logistical Coordinator",
        body: "It helps me document trucker conversations and delivery discrepancies. Very robust even in noisy environments.",
        image: "https://images.unsplash.com/photo-1492562080023-ab3dbdf9bbbd?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 4
    },
    {
        id: "33",
        name: "Silvia Castro",
        role: "Farmacéutica",
        body: "Me ayuda a documentar las formaciones técnicas de nuevos medicamentos. Luego las comparto con el resto del equipo.",
        image: "https://images.unsplash.com/photo-1594744188884-d2c37bc1493b?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "34",
        name: "Paul Graham",
        role: "Education Consultant",
        body: "The multi-audio upload is perfect for research interviews. Comparing transcripts side-by-side saves so much time.",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 4
    },
    {
        id: "35",
        name: "Enrique Rubio",
        role: "Auditor Externo",
        body: "Un nivel de detalle espectacular. Las entrevistas con los clientes quedan registradas con una precisión que no lograba con notas rápidas.",
        image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "36",
        name: "Jessica White",
        role: "Social Media Strategist",
        body: "I brainstorm out loud while driving. Diktalo converts those voice memos into actionable social media calendars. Essential tool.",
        image: "https://images.unsplash.com/photo-1567532939604-b6b5b0ad2f04?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "37",
        name: "Rafa Martínez",
        role: "Entrenador Personal",
        body: "Registro el progreso de mis atletas durante el entrenamiento. Es mucho más rápido que pararme a escribir entre series.",
        image: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 4
    },
    {
        id: "38",
        name: "Karen Thompson",
        role: "HR Generalist",
        body: "Handling exit interviews and employee grievances requires perfect records. Diktalo is my most trusted tool for documentation.",
        image: "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "39",
        name: "Teresa L.",
        role: "Corredora de Seguros",
        body: "Antes me perdía la mitad de los detalles en las llamadas. Ahora el Dialer me permite estar 100% presente con el cliente.",
        image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "40",
        name: "Simon de Clerk",
        role: "Renewable Energy Engineer",
        body: "Site surveys in windy areas are tough for microphones, but Diktalo does a solid job filtering the background noise.",
        image: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 4
    },
    {
        id: "41",
        name: "Gabriel O.",
        role: "Escritor de Ficción",
        body: "Dictarle mis capítulos a Diktalo me permite mantener el ritmo creativo sin trabarme con el teclado. Luego solo tengo que editar.",
        image: "https://images.unsplash.com/photo-1492562080023-ab3dbdf9bbbd?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "42",
        name: "Mariah Carey",
        role: "Music Producer",
        body: "Capturing lyrical ideas and melody notes instantly is key. The cloud sync between my phone and studio computer works perfectly.",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "43",
        name: "Luis Figo",
        role: "Co-founder, Sports Analytics",
        body: "Nuestras reuniones tácticas ahora se quedan grabadas para que el equipo de datos pueda extraer métricas. Muy potente.",
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "44",
        name: "Samantha Fox",
        role: "Public Relations Officer",
        body: "In a PR crisis, every word matters. Diktalo provides the verbatim record we need for fact-checking and official statements.",
        image: "https://images.unsplash.com/photo-1557296387-5358ad7997bb?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "45",
        name: "Pedro Salinas",
        role: "Agente Inmobiliario",
        body: "Hago las capturas mientras enseño el piso. Luego el cliente recibe un resumen con todo lo que hablamos. Quedo genial.",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "46",
        name: "Tiffany Amber",
        role: "Lifestyle Blogger",
        body: "Not everything is for publishing, but I use it for drafting my posts. It's much faster than typing on my phone while traveling.",
        image: "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 4
    },
    {
        id: "47",
        name: "Ramón J.",
        role: "Desarrollador Full Stack",
        body: "Lo uso para los 'daily standups'. Así no tengo que estar pendiente de escribir quién dijo qué y puedo centrarme en el código.",
        image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "48",
        name: "Oliver Twist",
        role: "Archive Specialist",
        body: "Digitizing old voice records and indexing them by content? Diktalo's upload feature handles bulk files impressively well.",
        image: "https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "49",
        name: "Natalia Gil",
        role: "Gestora Cultural",
        body: "Llevar el acta de las asambleas era un dolor de cabeza. Ahora grabamos y la IA nos da los puntos clave. Ahorramos horas de oficina.",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "50",
        name: "Will Smithson",
        role: "Junior Broker",
        body: "Learning the trade means remembering every detail of veteran brokers' advice. Diktalo is my secret vault of knowledge.",
        image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 4
    },
    {
        id: "51",
        name: "Victoria P.",
        role: "Especialista en SEO",
        body: "Me encanta para hacer 'keyword research' por voz. Lanzo ideas mientras paseo y luego Diktalo las transcribe de lujo.",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "52",
        name: "Barry Allen",
        role: "Forensic Accountant",
        body: "The search capability is king. Finding a specific figure mentioned in a 3-hour audit call takes seconds now.",
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "53",
        name: "Gema Ruiz",
        role: "Organizadora de Eventos",
        body: "Nadie se pierde un detalle del briefing. Mandamos el resumen de Diktalo a todos los proveedores y listo.",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "54",
        name: "Liam Neeson",
        role: "Security Consultant",
        body: "Data sovereignty is a must for us. Diktalo's approach to encryption and private cloud sync is exactly what we needed.",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "55",
        name: "Concha López",
        role: "Asistente Social",
        body: "Tengo que redactar informes muy largos después de cada visita. Grabar las impresiones en caliente me ayuda un mundo.",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 4
    },
    {
        id: "56",
        name: "Zoe Kravitz",
        role: "Creative Director",
        body: "Vibe is everything. Diktalo lets me capture the vibe of a meeting without the sterility of minute-taking.",
        image: "https://images.unsplash.com/photo-1531123897727-8f129e16fd3c?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    },
    {
        id: "57",
        name: "Pablo Motos",
        role: "Presentador TV",
        body: "Lo usamos para preparar las entrevistas. Súper rápido para sacar los puntos clave de las charlas previas con los invitados.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200",
        stars: 5
    }
];
