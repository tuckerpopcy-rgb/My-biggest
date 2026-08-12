type Knowledge = { keys: string[]; answer: string };

const KB: Knowledge[] = [
  {
    keys: ['capital', 'freetown'],
    answer:
      'Freetown is the capital and largest city of Sierra Leone. Founded in 1792 as a Province of Freedom for resettled Africans, it sits on one of the world’s great natural harbours. Neighbourhoods run from Hill Station and Leicester Peak down to Kroo Bay, Lumley and Aberdeen. The Cotton Tree, State House, Fourah Bay College and the National Museum sit in the historic core.',
  },
  {
    keys: ['independence', '1961', 'milton margai', 'independence day'],
    answer:
      'Sierra Leone became independent from the United Kingdom on 27 April 1961. Sir Milton Margai, a medical doctor from Gbangbatoke, was the first Prime Minister. The country became a republic in 1971 under Siaka Stevens. Independence Day remains 27 April — green, white and blue in the streets.',
  },
  {
    keys: ['flag', 'colours', 'colors', 'green white blue'],
    answer:
      'The flag is a horizontal tricolour: green (land, agriculture, mountains), white (unity and justice), blue (the Atlantic and Freetown’s harbour). It was raised at independence in 1961. The coat of arms shows a lion, oil palms and a rising sun — Unity, Freedom, Justice.',
  },
  {
    keys: ['krio', 'creole', 'language', 'lingua'],
    answer:
      'English is official, used in law and schools. Krio, an English-based creole born among freed settlers in Freetown, is the national lingua franca — most Sierra Leoneans understand it. Mende dominates the south and east; Temne the north. Limba, Kono, Fula, Mandingo, Loko, Sherbro/Bullom, Kuranko, Susu, Yalunka, Kissi and Krim also live on the tongue of the nation. Kushe o means hello. Tenki means thank you. How di bodi? means how are you?',
  },
  {
    keys: ['temne', 'mende', 'tribe', 'ethnic', 'limba', 'kono', 'fula', 'sherbro'],
    answer:
      'Sierra Leone is a mosaic. Temne (about a third) are strongest in the north and northwest. Mende (about 30%) shape the south and east. Limba are among the oldest communities of the north. Kono live in the diamond east. Fula (Fulani) are traders and cattle keepers nationwide. Mandingo, Loko, Sherbro, Kuranko, Susu, Kissi, Yalunka, Vai and Krio each hold land, story and ceremony. Poro and Sande/Bondo initiation societies still teach adulthood in many chiefdoms.',
  },
  {
    keys: ['food', 'eat', 'cassava', 'jollof', 'plasas', 'rice', 'groundnut'],
    answer:
      'Rice is life. If rice nor cook, the day nor done. Cassava-leaf stew (plasas) with palm oil, fish or meat is a national favourite. Potato leaf, crain crain, groundnut stew, okra soup, palava sauce, fried fish, roast plantain, akara, fufu and soup, and peppery jollof all sit on Salone tables. Ginger beer, palm wine and star apple belong to the street as much as the kitchen.',
  },
  {
    keys: ['diamond', 'kono', 'koidu', 'mineral', 'mine', 'rutile', 'bauxite'],
    answer:
      'Sierra Leone is rich in diamonds (especially Kono / Koidu), rutile, bauxite, iron ore and gold. The diamond story brought both wealth and wartime pain. Today mining, agriculture (rice, cassava, cocoa, coffee, oil palm), fisheries and a growing services scene carry the economy. The currency is the Leone.',
  },
  {
    keys: ['war', 'civil war', 'ruf', '1991', '2002', 'peace'],
    answer:
      'The civil war lasted from 1991 to 2002. The Revolutionary United Front invaded from Liberia in March 1991. The conflict scarred a generation. Peace was declared in January 2002 under President Ahmad Tejan Kabbah, with UN and regional help. Sierra Leone has since held multiple elections and rebuilt institutions, though poverty and infrastructure remain hard daily work.',
  },
  {
    keys: ['ebola', '2014', 'health'],
    answer:
      'The 2014–2016 West African Ebola outbreak hit Sierra Leone very hard. Thousands died, including many health workers. Communities, burial teams and international partners eventually stopped the chain of transmission. The experience reshaped public health surveillance. COVID-19 later tested those systems again.',
  },
  {
    keys: ['tiwai', 'tacugama', 'outamba', 'park', 'chimpanzee', 'wildlife'],
    answer:
      'Wild Salone is generous. Tiwai Island in the Moa River is one of the most primate-dense forests on earth. Tacugama Chimpanzee Sanctuary above Freetown rescues and protects chimps. Outamba-Kilimi in the northwest holds hippos, monkeys and woodland savanna. Gola Rainforest on the Liberian border is a birding treasure. The Western Area Peninsula forest still wraps Freetown’s hills.',
  },
  {
    keys: ['cotton tree', 'fourah bay', 'college', 'monument'],
    answer:
      'The Cotton Tree in central Freetown is a living monument — a meeting place, a symbol, a witness. Fourah Bay College, founded in 1827, is the oldest western-style university in West Africa and earned Freetown the name Athens of West Africa. Bunce Island in the Sierra Leone River is a preserved slave-trade fort of painful memory.',
  },
  {
    keys: ['bo', 'kenema', 'makeni', 'koidu', 'port loko', 'kabala', 'bonthe'],
    answer:
      'Beyond Freetown: Bo is the southern commercial capital. Kenema leads the east (cocoa, coffee, diamonds). Makeni is the northern hub. Koidu (Sefadu) is the diamond city of Kono. Port Loko, Magburaka, Kabala, Kailahun, Pujehun, Moyamba, Bonthe and Waterloo each hold markets, chiefdoms and stories. There are 16 districts across five regions.',
  },
  {
    keys: ['president', 'government', 'politics', 'election', 'bio', 'koroma'],
    answer:
      'Sierra Leone is a constitutional republic with a President, a unicameral Parliament and a judiciary. Julius Maada Bio, a former military head of state, won the 2018 and 2023 elections under the SLPP. Earlier civilian leaders include Ahmad Tejan Kabbah and Ernest Bai Koroma (APC). Politics is competitive; the great parties are SLPP and APC.',
  },
  {
    keys: ['music', 'dance', 'culture', 'bubu', 'gumbe', 'drumm'],
    answer:
      'Salone culture is drum, voice and masquerade. Gumbe, milo jazz, bubu, gospel and modern Afropop share the airwaves. Dr. Oloh, S.E. Rogie, Ebenezer Calendar, Steady Bongo, Emmerson, Kao Denero and many younger artists carry the sound. Bundu and Poro masquerades, lantern parades at Christmas in Freetown, and beach carnivals at Lumley are part of the calendar.',
  },
  {
    keys: ['beach', 'lumley', 'river no 2', 'banana', 'bureh', 'tourism'],
    answer:
      'The peninsula beaches are a gift: Lumley, Aberdeen, River Number Two, Bureh, Tokeh, Kent. Banana Islands (Dublin and Ricketts) sit a short boat ride from Kent. Turtle Islands and Sherbro feel farther and quieter. Best dry season for travel is roughly November to April.',
  },
  {
    keys: ['henry tucker', 'developer', 'who built', 'who made this', 'founder'],
    answer:
      'Salone Na We Yon was built by Henry Tucker, a Sierra Leonean developer. He designed it as a full social square — news feed, market, real messaging, quizzes, and Salon AI — so Salone people can stay connected in their own languages. You can read more and see his photo in About the Developer.',
  },
  {
    keys: ['world', 'united nations', 'un', 'earth', 'planet'],
    answer:
      'Earth is home to about 8 billion people across 195 recognised states. The United Nations was founded in 1945 in San Francisco; its headquarters is in New York. Sierra Leone joined the UN in 1961, the year of independence, and contributes to peacekeeping and the African Union. The world faces climate change, inequality and conflict — and also extraordinary science, art and solidarity.',
  },
  {
    keys: ['climate', 'weather', 'rain', 'harmattan'],
    answer:
      'Sierra Leone has a tropical monsoon climate. The rains are heavy, roughly May to November, especially July–September. The dry season brings clearer skies and, from December to February, the dusty Harmattan wind from the Sahara. Freetown’s hills catch huge rainfall. Farmers time rice and cassava to this calendar.',
  },
  {
    keys: ['population', 'how many people', 'demograph'],
    answer:
      'Sierra Leone’s population is about 8.6 to 9 million people, young and growing. A large share is under 25. Freetown’s Western Area is densely packed; the provinces remain more rural. Krio binds the cities; chiefdoms still structure much of rural life.',
  },
  {
    keys: ['religion', 'islam', 'christian', 'mosque', 'church'],
    answer:
      'Most Sierra Leoneans are Muslim, with a large Christian minority and enduring traditional practice. Religious coexistence is a point of national pride — families often mix mosque and church. Friday prayers and Sunday services share the same streets in Freetown, Bo and Makeni.',
  },
  {
    keys: ['football', 'leone stars', 'sport'],
    answer:
      'Football is a national passion. The Leone Stars are the national team. Club life runs through Freetown and the districts. Sierra Leone has also produced athletes in sprinting and, historically, made deep runs of hope around AFCON qualifying nights when the whole street goes quiet for the radio.',
  },
  {
    keys: ['education', 'school', 'university'],
    answer:
      'Fourah Bay College (University of Sierra Leone) is historic. Njala University, University of Makeni, EBKUST and Milton Margai have widened access. Free quality school reforms in recent years aimed to lift enrolment. Challenges remain: classrooms, teachers, rural access and the jump from school to work.',
  },
  {
    keys: ['hello', 'hi', 'kushe', 'how are you'],
    answer:
      'Kushe o! I de fine. I am Salon AI — built for Salone Na We Yon. Ask me about our tribes, towns, food, history, or about the wider world. I go talk true.',
  },
  {
    keys: ['premium', 'boost', 'verified', 'gold mark'],
    answer:
      'Salone Premium unlocks cloud video in Studio, boosted posts and market stalls, a verified gold mark, saved shelves and deeper Salon AI answers. Activate it from your profile. Henry Tucker’s founder seat is Premium for life.',
  },
  {
    keys: ['video', 'upload', 'supabase', 'cloud', 'studio'],
    answer:
      'Studio sends your real clips through the Salone media lane (Supabase Storage bucket salon-media, plus a permanent copy on your account). No demo reels. Pick a video, write a caption, publish — it appears on the feed and in your cloud library.',
  },
  {
    keys: ['leone stars', 'afcon', 'keister', 'musa'],
    answer:
      'The Leone Stars are Sierra Leone’s national football team. Home nights at the Siaka Stevens / National Stadium in Freetown can stop the city. Players from the diaspora and the local league have worn the green, white and blue at AFCON and in World Cup qualifying.',
  },
  {
    keys: ['bunce', 'slave', 'province of freedom', '1787', '1792'],
    answer:
      'In 1787 British abolitionists tried a Province of Freedom on the peninsula; the 1792 Nova Scotian settlers founded Freetown properly. Bunce Island, up the Sierra Leone River, was a major slave-trading fort. That double story — bondage and freedom — still sits in the city’s bones.',
  },
  {
    keys: ['rice', 'farm', 'agriculture', 'cocoa', 'coffee', 'oil palm'],
    answer:
      'Most Sierra Leoneans still live close to the land. Upland and swamp rice, cassava, groundnut, oil palm, cocoa and coffee (especially the east) feed homes and export. The hungry season before harvest is a real calendar. Market stalls on this app are built for that trade.',
  },
];

function score(q: string, keys: string[]): number {
  let s = 0;
  for (const k of keys) {
    if (q.includes(k)) s += k.length > 8 ? 3 : 2;
  }
  return s;
}

function worldFallback(q: string): string | null {
  if (/(who is|who was|what is|what are|where is|when did|why do|how do|explain|tell me)/.test(q)) {
    if (/(ocean|sea|atlantic|pacific)/.test(q)) {
      return 'The world ocean covers about 71% of Earth. The Atlantic washes Sierra Leone’s coast — that blue on our flag. The Pacific is the largest ocean; the Indian Ocean lies east of Africa. Oceans drive weather, food and trade. Freetown Harbour is a deep natural door onto the Atlantic.';
    }
    if (/(africa|african union|au\b)/.test(q)) {
      return 'Africa has 54 recognised countries, over 1.4 billion people, and thousands of languages. The African Union, headquartered in Addis Ababa, works on peace, trade (AfCFTA) and integration. Sierra Leone is a founding spirit of West African cooperation through ECOWAS and contributes to African diplomacy.';
    }
    if (/(climate change|global warming)/.test(q)) {
      return 'Climate change is driven mainly by greenhouse gases from fossil fuels. Sierra Leone is highly exposed: coastal flooding in Freetown, harder rains, and pressure on rice farms. The world agreed in Paris (2015) to limit warming. Local answers include protecting mangrove and peninsula forest, cleaner cookstoves, and resilient rice.';
    }
    if (/(united states|usa|america\b)/.test(q)) {
      return 'The United States is a federal republic of 50 states, capital Washington, D.C. It is a major UN member and has historic links with Sierra Leone through the slave trade, the founding of Freetown’s settler community, and later diplomacy, health and education partnerships.';
    }
    if (/(china|india|europe|uk|britain|england)/.test(q)) {
      return 'The United Kingdom colonised Sierra Leone and granted independence in 1961. China and India are major partners in infrastructure, trade and medicine across Africa. Europe remains a key market and diplomatic bloc. Salone foreign policy works these relationships while staying non-aligned in spirit.';
    }
    if (/(covid|coronavirus|pandemic)/.test(q)) {
      return 'COVID-19, first identified in 2019, became a global pandemic in 2020. Sierra Leone used Ebola-era tools — surveillance, isolation, community messaging — and kept a comparatively lower recorded death toll, though the economic shock was real.';
    }
    if (/(computer|ai\b|artificial intelligence|internet)/.test(q)) {
      return 'I am Salon AI, a knowledge system inside Salone Na We Yon. I reason over a curated Sierra Leone and world knowledge base, then compose a direct answer. I do not invent user accounts or demo chats. For live news beyond my training, check the Feed and trusted outlets.';
    }
  }
  return null;
}

export function askSalonAI(raw: string): string {
  const q = raw.trim().toLowerCase();
  if (!q) return 'Ask me something real — Sierra Leone or the world.';

  const ranked = KB.map((row, i) => ({ i, s: score(q, row.keys) }))
    .filter((r) => r.s >= 2)
    .sort((a, b) => b.s - a.s);

  if (ranked.length >= 2 && ranked[1].s >= 2) {
    return `${KB[ranked[0].i].answer}\n\nAlso worth knowing:\n${KB[ranked[1].i].answer}`;
  }
  if (ranked.length >= 1) {
    return KB[ranked[0].i].answer;
  }

  const world = worldFallback(q);
  if (world) return world;

  if (q.length < 8) {
    return 'Give me a fuller question. Try: “What does the Salone flag mean?” or “Who was Sir Milton Margai?” or “What is climate change?”';
  }

  return (
    'I read your question with care. Here is what I can stand on.\n\n' +
    'Sierra Leone is a West African nation on the Atlantic, independent since 27 April 1961, capital Freetown. ' +
    'Our people include Temne, Mende, Limba, Kono, Fula, Krio and many more; Krio is the language that ties the street together. ' +
    'The land holds diamonds, rainforest, rice farms and one of the world’s great harbours.\n\n' +
    'If you want a sharper answer, name a town, a tribe, a year, a food, a leader, or a world topic (oceans, Africa, climate, history). ' +
    'I am Salon AI — I stay with facts, not gossip.'
  );
}
