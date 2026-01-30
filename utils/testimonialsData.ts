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
        body: "Como residente, mi tiempo es oro. Antes pasaba hasta las 9 de la noche transcribiendo notas SOAP de forma manual. Con Diktalo, simplemente grabo la consulta (con el consentimiento del paciente, claro) y tengo el reporte estructurado en segundos. No solo me ahorra horas, sino que la precisión médica es sorprendente, capturando terminología compleja que otras herramientas ignoran por completo.",
        image: "https://xsgames.co/randomusers/assets/avatars/female/1.jpg",
        stars: 5
    },
    {
        id: "2",
        name: "Carlos M.",
        role: "VP de Ventas, TechFlow",
        body: "El análisis BANT automático ha cambiado las reglas del juego para nuestro CRM. Mi equipo ya no tiene que preocuparse por tomar notas durante las llamadas; ahora pueden centrarse al 100% en la relación con el cliente y el cierre de la venta. La integración con el marcador VoIP es un plus enorme que no esperaba encontrar en una herramienta tan accesible, y la capacidad de detectar sentimientos en la voz nos ayuda a calificar leads mucho más rápido.",
        image: "https://xsgames.co/randomusers/assets/avatars/male/2.jpg",
        stars: 5
    },
    {
        id: "3",
        name: "Elena R.",
        role: "Periodista de Investigación",
        body: "La precisión en inglés y español mezclados es superior. Muy seguro.",
        image: "https://xsgames.co/randomusers/assets/avatars/female/3.jpg",
        stars: 5
    },
    {
        id: "4",
        name: "James Wilson",
        role: "Senior Project Manager",
        body: "The Chrome extension is dead simple. I use it for every Google Meet call. Sometimes it glitches on very long calls (90+ mins), but the recovery feature always saves the data. Absolute lifesaver when the browser crashes or when the internet connection drops unexpectedly. The auto-summaries are also great for catching up if I joined late.",
        image: "https://xsgames.co/randomusers/assets/avatars/male/4.jpg",
        stars: 4
    },
    {
        id: "5",
        name: "Marta Sánchez",
        role: "Abogada Penalista",
        body: "Me salvó en un juicio.",
        image: "https://xsgames.co/randomusers/assets/avatars/female/5.jpg",
        stars: 5
    },
    {
        id: "6",
        name: "Sandeep K.",
        role: "Software Architect",
        body: "Diktalo's ability to handle technical jargon is impressive. We use it for our architecture reviews and brain-dumping sessions. It acts as our collective memory, ensuring that no design decision is lost in translation. The context-aware transcription handles acronyms perfectly, which is a rare find in the AI market currently.",
        image: "https://xsgames.co/randomusers/assets/avatars/male/6.jpg",
        stars: 5
    },
    {
        id: "7",
        name: "Lucía Fernández",
        role: "Estudiante de Psicología",
        body: "La uso para grabar mis clases y las prácticas. Me ayuda un montón a repasar conceptos que a veces se me pasan por alto mientras estoy escuchando al profesor. Poder buscar dentro de las grabaciones por palabras clave me permite estudiar mucho más rápido para los exámenes finales.",
        image: "https://xsgames.co/randomusers/assets/avatars/female/7.jpg",
        stars: 5
    },
    {
        id: "8",
        name: "Robert Moore",
        role: "Real Estate Broker",
        body: "Client walkthroughs became much more efficient. I just walk and talk, and then Diktalo extracts the key features the client liked into a tidy PDF summary. Way better than typing on a phone while walking through a multi-story property. Customers are also impressed by how quickly they receive the follow-up email after our meeting.",
        image: "https://xsgames.co/randomusers/assets/avatars/male/8.jpg",
        stars: 4
    },
    {
        id: "9",
        name: "Sofía V.",
        role: "UX Researcher",
        body: "Hacer tests de usuario es agotador si tienes que transcribir todo después. Con esta herramienta el proceso de análisis se redujo a la mitad del tiempo. Puedo centrarme en observar patrones de comportamiento y micro-expresiones en lugar de estar desesperada por teclear cada palabra que dice el participante. La exportación a DOCX es perfecta para mis reports.",
        image: "https://xsgames.co/randomusers/assets/avatars/female/9.jpg",
        stars: 5
    },
    {
        id: "10",
        name: "David T.",
        role: "Executive Coach",
        body: "Es como tener un compañero de responsabilidad privado que no juzga. Registro mis reflexiones después de cada sesión y me ayuda a ver mi propio progreso.",
        image: "https://xsgames.co/randomusers/assets/avatars/male/10.jpg",
        stars: 5
    },
    {
        id: "11",
        name: "Beatriz M.",
        role: "Traductora Jurada",
        body: "Me encanta que reconoce los cambios de idioma sobre la marcha de forma casi instantánea. Trabajo habitualmente entre Madrid y Londres para clientes internacionales y es la única herramienta que no se vuelve loca con el 'espanglish' o los tecnicismos legales cruzados. La seguridad de los datos es lo que más me tranquiliza, sabiendo que todo está encriptado punto a punto.",
        image: "https://xsgames.co/randomusers/assets/avatars/female/11.jpg",
        stars: 5
    },
    {
        id: "12",
        name: "Kevin L.",
        role: "Startup Founder",
        body: "Used it for our investor pitches. The AI summary helped us refine our messaging based on the questions they actually asked and where they seemed confused. We fixed 3 critical slide errors in our deck thanks to reviewing the Diktalo transcripts. It's an indispensable tool for any founder in the fundraising stage.",
        image: "https://xsgames.co/randomusers/assets/avatars/male/12.jpg",
        stars: 5
    },
    {
        id: "13",
        name: "Ricardo G.",
        role: "Ingeniero Civil",
        body: "Visitas de obra mucho más fáciles. Registro todo en audio mientras camino por la estructura y tomo fotos. Diktalo organiza mis comentarios por secciones automáticamente, lo que me ahorra horas frente al ordenador redactando el informe de progreso semanal. Es robusto y funciona bien incluso con el ruido de las máquinas de fondo.",
        image: "https://xsgames.co/randomusers/assets/avatars/male/13.jpg",
        stars: 4
    },
    {
        id: "14",
        name: "Sarah Jenkins",
        role: "Learning & Development Manager",
        body: "Creating training materials from workshop recordings used to be a nightmare that took weeks. Diktalo extracts the core lessons, action items, and key quotes automatically. I can now turn a 3-hour seminar into a comprehensive study guide in about 15 minutes. The level of detail is exactly what our employees need for continuous learning.",
        image: "https://xsgames.co/randomusers/assets/avatars/female/14.jpg",
        stars: 5
    },
    {
        id: "15",
        name: "Oscar Ruiz",
        role: "Podcaster",
        body: "La precisión es brutal. Me ahorro un montón de tiempo sacando los 'show notes' y los fragmentos más potentes para promocionar en redes sociales. Lo uso para cada episodio y ya no puedo imaginar mi flujo de trabajo sin Diktalo. La opción de múltiples altavoces (diarización) funciona sorprendentemente bien incluso con voces similares.",
        image: "https://xsgames.co/randomusers/assets/avatars/male/15.jpg",
        stars: 5
    },
    {
        id: "16",
        name: "Emily Chen",
        role: "Customer Success Lead",
        body: "We record our onboarding calls to ensure quality. The ability to search through months of conversations to find specific client requests or pain points is game-changing for our retention strategy. No more 'I think they mentioned X'—we have the verbatim record. It's made the handoff between sales and success much smoother.",
        image: "https://xsgames.co/randomusers/assets/avatars/female/16.jpg",
        stars: 5
    },
    {
        id: "17",
        name: "Felipe Soto",
        role: "Chef & Consultor",
        body: "Incluso con el ruido de la cocina, pilla bien todo. Notas de recetas y de costes sobre la marcha.",
        image: "https://xsgames.co/randomusers/assets/avatars/male/17.jpg",
        stars: 4
    },
    {
        id: "18",
        name: "Rachel Goldberg",
        role: "Therapist",
        body: "Being present with my patients is my absolute priority. Diktalo allows me to focus on them completely, knowing that the clinical notes will be accurate, secure, and ready for review shortly after the session. Patient privacy is respected throughout with their robust encryption, which was a deal-breaker for me with other apps.",
        image: "https://xsgames.co/randomusers/assets/avatars/female/18.jpg",
        stars: 5
    },
    {
        id: "19",
        name: "Jorge Blanco",
        role: "Director de Marketing",
        body: "Nuestras reuniones de brainstorming ahora son reales, no solo gente escribiendo en pizarras. Capturamos el flujo creativo y luego la IA nos da los 5 puntos clave para ejecutar la campaña.",
        image: "https://xsgames.co/randomusers/assets/avatars/male/19.jpg",
        stars: 5
    },
    {
        id: "20",
        name: "Nicole Smith",
        role: "Graduate Student",
        body: "I struggle with dyslexia, so taking fast notes in lectures is a constant source of stress. Diktalo changed everything for me. Now I can just listen, engage with the material, and ask questions. Having the full transcript to review at my own pace later is the most helpful accommodation I've ever experienced in my academic career.",
        image: "https://xsgames.co/randomusers/assets/avatars/female/20.jpg",
        stars: 5
    },
    {
        id: "21",
        name: "Paco Herrera",
        role: "Vendedor de Seguros",
        body: "Llamo a un montón de gente al día. El Dialer integrado con grabación me ayuda a no olvidar ninguna promesa que le hago al cliente, por pequeña que sea. Al final del día, reviso los resúmenes y sé exactamente qué tengo que enviar a cada persona sin tener que escuchar horas de grabaciones.",
        image: "https://xsgames.co/randomusers/assets/avatars/male/21.jpg",
        stars: 4
    },
    {
        id: "22",
        name: "Linda Wu",
        role: "E-commerce Specialist",
        body: "Managing suppliers across different time zones means lots of late-night, multi-lingual calls. Diktalo helps me keep track of all logistics details, price changes, and delivery timelines that are discussed. It's cut down on communication errors significantly, especially when dealing with complex shipping terms.",
        image: "https://xsgames.co/randomusers/assets/avatars/female/22.jpg",
        stars: 5
    },
    {
        id: "23",
        name: "Antonio P.",
        role: "Profesor de Historia",
        body: "Grabo mis propias lecciones para revisarlas y mejorar mi didáctica. También les paso las transcripciones estructuradas a mis alumnos con dificultades de audición o de atención. Facilita mucho la inclusión en el aula y permite que todos tengan acceso a la misma información de calidad.",
        image: "https://xsgames.co/randomusers/assets/avatars/male/23.jpg",
        stars: 5
    },
    {
        id: "24",
        name: "Susan Miller",
        role: "Freelance Producer",
        body: "Interviews, strategy calls, set notes... it all goes into Diktalo. It's like having a dedicated personal assistant for a fraction of the cost, available 24/7. The search functionality is particularly deep and fast.",
        image: "https://xsgames.co/randomusers/assets/avatars/female/24.jpg",
        stars: 4
    },
    {
        id: "25",
        name: "Mateo Díaz",
        role: "Head of Talent",
        body: "Las entrevistas de trabajo fluyen mucho mejor. Puedo mirar al candidato a los ojos y conectar de verdad con su historia, sin la barrera de una pantalla de portátil entre nosotros. Las notas automáticas de Diktalo capturan incluso los detalles sutiles de la conversación que luego son vitales para la decisión de contratación.",
        image: "https://xsgames.co/randomusers/assets/avatars/male/25.jpg",
        stars: 5
    },
    {
        id: "26",
        name: "Christopher E.",
        role: "Agile Coach",
        body: "Retrospectives are finally documented without being a boring chore for the team. The AI-generated action items are remarkably on point, often catching the consensus correctly even when the discussion gets a bit heated or disorganized. Team alignment has never been clearer since we started using this for our standups.",
        image: "https://xsgames.co/randomusers/assets/avatars/male/26.jpg",
        stars: 5
    },
    {
        id: "27",
        name: "Isabel Torres",
        role: "Diseñadora de Interiores",
        body: "Las notas de voz que me mando a mí misma mientras visito tiendas o almacenes se convierten en inventarios organizados gracias a Diktalo. Me permite mantener la creatividad alta sin perderme en la burocracia de los pedidos y las medidas de cada proyecto.",
        image: "https://xsgames.co/randomusers/assets/avatars/female/27.jpg",
        stars: 4
    },
    {
        id: "28",
        name: "Tom Harrison",
        role: "Sales Executive",
        body: "The dialer works flawlessly on mobile. Being able to record calls in compliance with local laws, while having an instant transcription and summary, has never been easier. It's a huge boost for our legal team too, as we have a clear paper trail for every verbal agreement. The audio quality is crystal clear.",
        image: "https://xsgames.co/randomusers/assets/avatars/male/28.jpg",
        stars: 5
    },
    {
        id: "29",
        name: "Claudia Romero",
        role: "Consultora de RRHH",
        body: "Cumple con RGPD y encripta todo. Muy profesional para manejar datos sensibles de empleados y candidatos en procesos de selección masivos. Muy recomendable.",
        image: "https://xsgames.co/randomusers/assets/avatars/female/29.jpg",
        stars: 5
    },
    {
        id: "30",
        name: "Alex Johnson",
        role: "Venture Capital Analyst",
        body: "Processing 20+ startup pitches a week is daunting. Diktalo's summaries give me the highlights and potential red flags so I can decide where to dive deep with my due diligence. It's saved me what feels like weeks of tedious manual work already. The ability to export the key data directly to our internal tool is a huge time-saver.",
        image: "https://xsgames.co/randomusers/assets/avatars/male/30.jpg",
        stars: 5
    },
    {
        id: "31",
        name: "Valeria N.",
        role: "Científica de Datos",
        body: "Como profesional técnica, aprecio mucho el vocabulario personalizado que Diktalo permite configurar. Pilla los nombres de modelos de ML y librerías de Python específicos que otras herramientas destrozan por completo. La API es limpia y fácil de integrar en mis propios pipelines de análisis de texto.",
        image: "https://xsgames.co/randomusers/assets/avatars/female/31.jpg",
        stars: 5
    },
    {
        id: "32",
        name: "Mark Peterson",
        role: "Logistical Coordinator",
        body: "It helps me document trucker conversations and delivery discrepancies on the fly. Very robust even in noisy environments—the heavy warehouse background noise doesn't seem to bother the AI much. It's accurately captured disputes that saved us thousands in potential insurance claims over the last quarter.",
        image: "https://xsgames.co/randomusers/assets/avatars/male/32.jpg",
        stars: 4
    },
    {
        id: "33",
        name: "Silvia Castro",
        role: "Farmacéutica",
        body: "Me ayuda a documentar las formaciones técnicas de nuevos medicamentos para el equipo de la farmacia. Convertir una sesión de 30 minutos en una lista de contraindicaciones y efectos secundarios clara es una maravilla.",
        image: "https://xsgames.co/randomusers/assets/avatars/female/33.jpg",
        stars: 5
    },
    {
        id: "34",
        name: "Paul Graham",
        role: "Education Consultant",
        body: "The multi-audio upload is perfect for research interviews. Comparing transcripts side-by-side using the AI to find common denominators saves so much time compared to manual coding. This has become the backbone of my qualitative analysis workflow for all my consulting projects.",
        image: "https://xsgames.co/randomusers/assets/avatars/male/34.jpg",
        stars: 4
    },
    {
        id: "35",
        name: "Enrique Rubio",
        role: "Auditor Externo",
        body: "Un nivel de detalle espectacular. Las entrevistas con los clientes quedan registradas con una precisión en cifras y fechas que no lograba con notas rápidas. Muy fiable para procesos de auditoría donde cada palabra puede ser auditada posteriormente. La interfaz es intuitiva y el soporte técnico responde muy rápido.",
        image: "https://xsgames.co/randomusers/assets/avatars/male/35.jpg",
        stars: 5
    },
    {
        id: "36",
        name: "Jessica White",
        role: "Social Media Strategist",
        body: "I brainstorm out loud while driving or walking the dog. Diktalo converts those chaotic voice memos into actionable social media calendars, post drafts, and even script outlines for Reels. It's allowed me to double my content output without increasing the hours I spend sitting at my desk.",
        image: "https://xsgames.co/randomusers/assets/avatars/female/36.jpg",
        stars: 5
    },
    {
        id: "37",
        name: "Rafa Martínez",
        role: "Entrenador Personal",
        body: "Registro el progreso de mis atletas durante el entrenamiento real, dictando pesos y repeticiones mientras los vigilo. Es mucho más rápido que pararme a escribir entre series. Al final de la semana, tengo un historial completo que puedo enviarles con un solo clic. Literalmente gano minutos de descanso real y profesionalizo mi servicio.",
        image: "https://xsgames.co/randomusers/assets/avatars/male/37.jpg",
        stars: 4
    },
    {
        id: "38",
        name: "Karen Thompson",
        role: "HR Generalist",
        body: "Handling exit interviews requires perfect records. Diktalo ensures we capture the true internal culture feedback without bias. It's helped us identify three systemic issues we've now resolved.",
        image: "https://xsgames.co/randomusers/assets/avatars/female/38.jpg",
        stars: 5
    },
    {
        id: "39",
        name: "Teresa L.",
        role: "Corredora de Seguros",
        body: "Antes me perdía la mitad de los detalles en las llamadas accidentadas. Ahora el Dialer me permite estar 100% presente con el cliente, escuchando sus preocupaciones reales mientras Diktalo se encarga de los datos técnicos. Gran mejora en mi ratio de cierre y en la satisfacción de mis clientes habituales.",
        image: "https://xsgames.co/randomusers/assets/avatars/female/39.jpg",
        stars: 5
    },
    {
        id: "40",
        name: "Simon de Clerk",
        role: "Renewable Energy Engineer",
        body: "Site surveys in windy areas are tough for microphones, but Diktalo does a solid job filtering the background noise. It actually works on the roof of a wind turbine during diagnostic tests! Being able to record my observations while my hands are busy with cables is a major safety and efficiency improvement for my field work.",
        image: "https://xsgames.co/randomusers/assets/avatars/male/40.jpg",
        stars: 4
    },
    {
        id: "41",
        name: "Gabriel O.",
        role: "Escritor de Ficción",
        body: "Dictarle mis capítulos me permite mantener el ritmo cuando la pantalla en blanco me bloquea. La transcripción es tan buena que el trabajo de edición posterior es mínimo comparado con lo que gané en velocidad de creación.",
        image: "https://xsgames.co/randomusers/assets/avatars/male/41.jpg",
        stars: 5
    },
    {
        id: "42",
        name: "Mariah J.",
        role: "Music Producer",
        body: "Capturing lyrical ideas and melody notes instantly is key. The cloud sync between my phone and studio computer works perfectly. It's how I write and collaborate now—it's replaced my old messy notebook. Being able to share a timestamped transcript with artists for quick edits is a feature I use every single day.",
        image: "https://xsgames.co/randomusers/assets/avatars/female/42.jpg",
        stars: 5
    },
    {
        id: "43",
        name: "Luis F.",
        role: "Co-founder, Sports Analytics",
        body: "Nuestras reuniones tácticas ahora se quedan grabadas y estructuradas. No más discusiones sobre qué decidimos para el próximo Q. La IA organiza los puntos de acción por departamento.",
        image: "https://xsgames.co/randomusers/assets/avatars/male/43.jpg",
        stars: 5
    },
    {
        id: "44",
        name: "Samantha F.",
        role: "Public Relations Officer",
        body: "In a PR crisis, every single word matters. Diktalo provides the verbatim record we need for fact-checking and official statements within minutes of a press briefing ending. It is absolutely essential for crisis management at scale, where speed and accuracy are the only things that save a brand's reputation.",
        image: "https://xsgames.co/randomusers/assets/avatars/female/44.jpg",
        stars: 5
    },
    {
        id: "45",
        name: "Pedro Salinas",
        role: "Agente Inmobiliario",
        body: "Hago las capturas por voz mientras enseño el piso. Luego el cliente recibe un resumen profesional con todo lo que hablamos: precios, reformas posibles y fechas clave. Quedo genial y el cliente siente que le presto una atención exclusiva. Mi proceso de venta es ahora digital, elegante y mucho más rápido que la competencia.",
        image: "https://xsgames.co/randomusers/assets/avatars/male/45.jpg",
        stars: 5
    },
    {
        id: "46",
        name: "Tiffany Amber",
        role: "Lifestyle Blogger",
        body: "Lo uso para borradores rápidos de mis posts y para grabar entrevistas con otros creadores. Me encanta la interfaz oscura y lo sencillo que es todo.",
        image: "https://xsgames.co/randomusers/assets/avatars/female/46.jpg",
        stars: 4
    },
    {
        id: "47",
        name: "Ramón J.",
        role: "Desarrollador Full Stack",
        body: "Lo uso para los 'daily standups' remotos. Así no tengo que estar pendiente de escribir quién dijo qué en Slack y puedo centrarme en los problemas de código complejos. La API también es muy decente y me permitió hacer un pequeño bot que sube los resúmenes directamente a nuestro canal de equipo de forma automática.",
        image: "https://xsgames.co/randomusers/assets/avatars/male/47.jpg",
        stars: 5
    },
    {
        id: "48",
        name: "Oliver T.",
        role: "Archive Specialist",
        body: "Digitizing old legacy voice records and indexing them by content? Impressive bulk handling. Diktalo handled over 500 hours of archives for our library without a single error. The keyword search allowed us to find historical mentions that would have taken years to find manually. A truly transformative tool for archivists.",
        image: "https://xsgames.co/randomusers/assets/avatars/male/48.jpg",
        stars: 5
    },
    {
        id: "49",
        name: "Natalia Gil",
        role: "Gestora Cultural",
        body: "Llevar el acta de las asambleas era un dolor de cabeza constante. Ahora grabamos y la IA nos da los puntos clave y los votos con una claridad meridiana. Ahorramos horas interminables de oficina y discusiones estériles sobre qué se dijo exactamente en la reunión de hace tres meses. La transparencia que aporta al equipo es incalculable.",
        image: "https://xsgames.co/randomusers/assets/avatars/female/49.jpg",
        stars: 5
    },
    {
        id: "50",
        name: "Will S.",
        role: "Junior Broker",
        body: "Diktalo is my secret vault of knowledge. I record every mentor session and the AI helps me extract the 'wisdom' from the casual chatter. I've learned more in 6 months using this than I did in 3 years of college.",
        image: "https://xsgames.co/randomusers/assets/avatars/male/50.jpg",
        stars: 4
    },
    {
        id: "51",
        name: "Victoria P.",
        role: "Especialista en SEO",
        body: "Me encanta para hacer 'keyword research' por voz. Lanzo ideas mientras paseo y luego Diktalo las transcribe de lujo, dándome una base sobre la que trabajar mucho más natural de la que tendría escribiendo en frío. Es como tener una conversación conmigo misma que queda perfectamente documentada para el análisis posterior.",
        image: "https://xsgames.co/randomusers/assets/avatars/female/51.jpg",
        stars: 5
    },
    {
        id: "52",
        name: "Barry A.",
        role: "Forensic Accountant",
        body: "The search capability is king for my field. Finding a specific figure mentioned in a 3-hour audit call with a client takes literally seconds now. My billing reviews are 90% faster because I can jump straight to the relevant part of the recording. It's increased the accuracy of our reports and saved the firm hundreds of billable hours.",
        image: "https://xsgames.co/randomusers/assets/avatars/male/52.jpg",
        stars: 5
    },
    {
        id: "53",
        name: "Gema Ruiz",
        role: "Organizadora de Eventos",
        body: "Nadie se pierde un detalle del briefing. Grabamos la visita técnica y todos los proveedores tienen acceso a la misma información detallada sobre logística y tiempos.",
        image: "https://xsgames.co/randomusers/assets/avatars/female/53.jpg",
        stars: 5
    },
    {
        id: "54",
        name: "Liam N.",
        role: "Security Consultant",
        body: "Data sovereignty is a must for us in the security sector. Diktalo's approach to encryption and private cloud sync is exactly what we needed for our high-stakes briefings. I've personally audited many transcription tools, and this one is the first that actually meets our strict internal standards for data handling and privacy. Legit.",
        image: "https://xsgames.co/randomusers/assets/avatars/male/54.jpg",
        stars: 5
    },
    {
        id: "55",
        name: "Concha López",
        role: "Asistente Social",
        body: "Tengo que redactar informes muy largos después de visitar familias. Diktalo me permite hacerlo mientras voy de una casa a otra, ganando un tiempo precioso para dedicarlo a ayudar a la gente en lugar de estar pegada a los papeles.",
        image: "https://xsgames.co/randomusers/assets/avatars/female/55.jpg",
        stars: 4
    },
    {
        id: "56",
        name: "Zoe K.",
        role: "Creative Director",
        body: "Vibe is everything in our agency. Diktalo lets me capture the true vibe and excitement of a meeting without the sterility of traditional minute-taking. It keeps the creative juice flowing without interruption, and the AI summaries are remarkably good at capturing the aesthetics we discuss, not just the technical points.",
        image: "https://xsgames.co/randomusers/assets/avatars/female/56.jpg",
        stars: 5
    },
    {
        id: "57",
        name: "Javier M.",
        role: "Presentador TV",
        body: "Lo usamos para preparar las entrevistas y las secciones de los programas. Súper rápido para sacar las ideas principales de reuniones larguísimas de guionistas. La capacidad de detectar diferentes voces nos ayuda a saber quién lanzó cada idea.",
        image: "https://xsgames.co/randomusers/assets/avatars/male/71.jpg",
        stars: 5
    }
];
