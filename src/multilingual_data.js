export const getSoilData = (lang) => {
  const data = [
    {
      lat: 22.1, lng: 84.0, // Sundargarh
      imgUrl: "https://upload.wikimedia.org/wikipedia/commons/4/41/Mustard_field_in_Bangladesh.jpg",
      en: { zone: "North Western Plateau (Sundargarh)", soil: "Red & Yellow Soil", crops: ["Paddy", "Maize", "Arhar"], rotCurrent: "Paddy", rotNext: "Mustard", rotReason: "After harvesting Paddy, planting Mustard is like a natural shield for your farm. Its wide leaves lock moisture into the ground during dry winters, and its sharp smell naturally drives away the pests that usually attack your rice!" },
      or: { zone: "ଉତ୍ତର ପଶ୍ଚିମ ମାଳଭୂମି (ସୁନ୍ଦରଗଡ଼)", soil: "ଲାଲ୍ ଏବଂ ହଳଦିଆ ମାଟି", crops: ["ଧାନ", "ମକା", "ହରଡ଼"], rotCurrent: "ଧାନ", rotNext: "ସୋରିଷ", rotReason: "ଧାନ ଅମଳ ପରେ ସୋରିଷ ଲଗାଇବା ଆପଣଙ୍କ କ୍ଷେତ ପାଇଁ ଏକ ପ୍ରାକୃତିକ କବଚ ଭଳି କାମ କରେ। ଏହାର ବଡ଼ ପତ୍ର ଶୀତଦିନେ ମାଟିର ଆର୍ଦ୍ରତା ବଜାୟ ରଖେ ଏବଂ ଏହାର ଗନ୍ଧ ଧାନରେ ଲାଗୁଥିବା ପୋକମାନଙ୍କୁ ଦୂରେଇ ଦିଏ।" },
      hi: { zone: "उत्तर पश्चिमी पठार (सुंदरगढ़)", soil: "लाल और पीली मिट्टी", crops: ["धान", "मक्का", "अरहर"], rotCurrent: "धान", rotNext: "सरसों", rotReason: "धान काटने के बाद सरसों लगाना आपके खेत के लिए एक ढाल की तरह काम करता है। इसके बड़े पत्ते सर्दियों में मिट्टी की नमी को बनाए रखते हैं, और इसकी तेज गंध धान के कीड़ों को दूर भगाती है!" }
    },
    {
      lat: 19.8, lng: 85.8, // Puri/Coastal
      imgUrl: "https://upload.wikimedia.org/wikipedia/commons/6/69/Mung_beans_plant.jpg",
      en: { zone: "Coastal Plain (Puri, Khurda)", soil: "Coastal Alluvial", crops: ["Paddy", "Groundnut", "Green Gram"], rotCurrent: "Paddy", rotNext: "Green Gram (Mung)", rotReason: "Growing Rice takes a lot of energy out of the soil. By planting Mung beans next, you are giving the soil its vitamins back! Mung roots pull nitrogen directly from the air and put it back into the ground like a free fertilizer." },
      or: { zone: "ଉପକୂଳ ସମତଳ (ପୁରୀ, ଖୋର୍ଦ୍ଧା)", soil: "ଉପକୂଳ ପଟୁ ମାଟି", crops: ["ଧାନ", "ଚିନାବାଦାମ", "ମୁଗ"], rotCurrent: "ଧାନ", rotNext: "ମୁଗ", rotReason: "ଧାନ ଚାଷ କଲେ ମାଟିରୁ ଅନେକ ଶକ୍ତି କମିଯାଏ। ଧାନ ପରେ ମୁଗ ଚାଷ କରିବା ଦ୍ୱାରା ମାଟି ତାର ପୋଷକ ତତ୍ତ୍ୱ ଫେରିପାଏ। ମୁଗ ଚେର ପବନରୁ ଯବକ୍ଷାରଜାନ ଆଣି ମାଟିରେ ଜମା କରେ, ଯାହା ଏକ ପ୍ରାକୃତିକ ଖତ ଭଳି କାମ କରେ।" },
      hi: { zone: "तटीय मैदान (पुरी, खुर्दा)", soil: "तटीय जलोढ़", crops: ["धान", "मूंगफली", "मूंग"], rotCurrent: "धान", rotNext: "मूंग", rotReason: "धान उगाने से मिट्टी की बहुत सारी ताकत खत्म हो जाती है। इसके बाद मूंग बोने से मिट्टी को उसकी ताकत वापस मिल जाती है! मूंग की जड़ें हवा से नाइट्रोजन खींचकर मिट्टी में मिला देती हैं, जो मुफ्त खाद का काम करती है।" }
    },
    {
      lat: 19.5, lng: 83.9, // Rayagada
      imgUrl: "https://upload.wikimedia.org/wikipedia/commons/d/df/Turmeric_rhizome.jpg",
      en: { zone: "North Eastern Ghat (Rayagada)", soil: "Brown Forest Soil", crops: ["Turmeric", "Ginger", "Maize"], rotCurrent: "Turmeric", rotNext: "Black Gram (Urad)", rotReason: "Farming on hillsides can cause your good soil to wash away when it rains. Urad acts like a net! Its roots hold the soil tightly in place on the slopes, while also feeding the ground." },
      or: { zone: "ଉତ୍ତର ପୂର୍ବ ଘାଟ (ରାୟଗଡ଼ା)", soil: "ବାଦାମୀ ଜଙ୍ଗଲ ମାଟି", crops: ["ହଳଦୀ", "ଅଦା", "ମକା"], rotCurrent: "ହଳଦୀ", rotNext: "ବିରି", rotReason: "ପାହାଡ଼ିଆ ଅଞ୍ଚଳରେ ଚାଷ କଲେ ବର୍ଷା ଦିନେ ଉର୍ବର ମାଟି ଧୋଇଯିବାର ଭୟ ଥାଏ। ବିରି ଚାଷ ଏକ ଜାଲ ଭଳି କାମ କରେ! ଏହାର ଚେର ମାଟିକୁ ଧରି ରଖେ ଏବଂ ମାଟିକୁ ଏତେ ବଳ ଦିଏ ଯେ ପରବର୍ତ୍ତୀ ହଳଦୀ ଫସଲ ଆହୁରି ଭଲ ହୁଏ।" },
      hi: { zone: "उत्तर पूर्वी घाट (रायगड़ा)", soil: "भूरी वन मिट्टी", crops: ["हल्दी", "अदरक", "मक्का"], rotCurrent: "हल्दी", rotNext: "उड़द", rotReason: "पहाड़ी ढलानों पर खेती करने से बारिश में अच्छी मिट्टी बह सकती है। उड़द की फसल एक जाल की तरह काम करती है! इसकी जड़ें मिट्टी को मजबूती से पकड़े रखती हैं।" }
    },
    {
      lat: 20.0, lng: 83.1, // Kalahandi
      imgUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Cotton_Plant.jpg",
      en: { zone: "Western Zone (Kalahandi)", soil: "Mixed Red and Black Soil", crops: ["Cotton", "Paddy", "Pulses"], rotCurrent: "Cotton", rotNext: "Pigeon Pea (Arhar)", rotReason: "Cotton attracts a lot of harmful whitefly insects. If you plant Arhar (Pigeon Pea) after cotton, you completely break the insect's food cycle! Plus, Arhar has deep roots that easily punch through dry soil to find hidden water." },
      or: { zone: "ପଶ୍ଚିମ ତରଙ୍ଗାୟିତ ଅଞ୍ଚଳ (କଳାହାଣ୍ଡି)", soil: "ମିଶ୍ରିତ ଲାଲ୍ ଏବଂ କଳା ମାଟି", crops: ["କପା", "ଧାନ", "ଡାଲି ଜାତୀୟ ଫସଲ"], rotCurrent: "କପା", rotNext: "ହରଡ଼", rotReason: "କପା ଗଛରେ ସାଧାରଣତଃ ଧଳା ମାଛି ବହୁତ ଆକ୍ରମଣ କରନ୍ତି। କପା ପରେ ହରଡ଼ ଚାଷ କଲେ ଏହି ପୋକମାନଙ୍କର ଖାଦ୍ୟ ଚକ୍ର ସମ୍ପୂର୍ଣ୍ଣ ରୂପେ ଭାଙ୍ଗିଯାଏ! ଆହୁରି ମଧ୍ୟ, ହରଡ଼ ଗଛର ଚେର ବହୁତ ଗଭୀରକୁ ଯାଇ ଶୁଖିଲା ଓ ଟାଣ ମାଟିରୁ ପାଣି ଶୋଷି ଆଣିପାରେ।" },
      hi: { zone: "पश्चिमी क्षेत्र (कालाहांडी)", soil: "मिश्रित लाल और काली मिट्टी", crops: ["कपास", "धान", "दलहन"], rotCurrent: "कपास", rotNext: "अरहर", rotReason: "कपास के पौधे अक्सर सफेद मक्खियों को आकर्षित करते हैं। कपास के बाद अरहर बोने से इन कीड़ों का भोजन चक्र टूट जाता है! साथ ही, अरहर की गहरी जड़ें कठोर और सूखी मिट्टी को भेदकर पानी निकाल लेती हैं।" }
    },
    {
      lat: 20.8, lng: 85.1, // Angul
      imgUrl: "https://upload.wikimedia.org/wikipedia/commons/9/91/Cowpea_pods.jpg",
      en: { zone: "Central Table Land (Angul)", soil: "Laterite Soil", crops: ["Mango", "Cashew", "Vegetables"], rotCurrent: "Vegetables", rotNext: "Cowpea", rotReason: "Heavy monsoon rains can damage delicate laterite soils. Cowpea is a fast-growing creeping plant that quickly covers the bare ground like a thick green blanket. It protects the soil from heavy raindrops!" },
      or: { zone: "ମଧ୍ୟ କେନ୍ଦ୍ରୀୟ ଟେବୁଲ୍ ଲ୍ୟାଣ୍ଡ (ଅନୁଗୁଳ)", soil: "ମାଙ୍କଡ଼ା ମାଟି (ଲାଟେରାଇଟ୍)", crops: ["ଆମ୍ବ", "କାଜୁ", "ପନିପରିବା"], rotCurrent: "ପନିପରିବା", rotNext: "ଝୁଡ଼ଙ୍ଗ", rotReason: "ପ୍ରବଳ ବର୍ଷା ଲାଟେରାଇଟ୍ (ମାଙ୍କଡ଼ା) ମାଟିକୁ ନଷ୍ଟ କରିଦିଏ। ଝୁଡ଼ଙ୍ଗ ହେଉଛି ଏକ ଦ୍ରୁତ ଗତିରେ ମାଡୁଥିବା ଫସଲ ଯାହା ଖାଲି ପଡ଼ିଥିବା ଜମିକୁ ଏକ ସବୁଜ ଗାଲିଚା ଭଳି ଘୋଡେଇ ରଖେ। ଏହା ମାଟିକୁ ବର୍ଷା ମାଡ଼ରୁ ରକ୍ଷା କରେ ଏବଂ ଅନାବନା ଘାସକୁ ବଢ଼ିବାକୁ ଦିଏ ନାହିଁ!" },
      hi: { zone: "मध्य केंद्रीय क्षेत्र (अंगुल)", soil: "लेटराइट मिट्टी", crops: ["आम", "काजू", "सब्जियां"], rotCurrent: "सब्जियां", rotNext: "लोबिया", rotReason: "भारी बारिश लेटराइट मिट्टी को नुकसान पहुंचा सकती है। लोबिया एक तेजी से फैलने वाली फसल है जो खाली जमीन को एक हरे कंबल की तरह ढक लेती है। यह मिट्टी को बारिश की बूंदों से बचाती है और जंगली घास को पनपने नहीं देती!" }
    }
  ];
  return data.map(d => ({ ...d[lang] || d['en'], imgUrl: d.imgUrl, lat: d.lat, lng: d.lng }));
};

export const getTelemetryData = (lang) => {
  const data = [
    {
      lat: 19.37, lng: 84.79,
      en: { origin: "Ganjam", target: "Khurda", pest: "Brown Plant Hopper", crop: "Paddy (Rice)", severity: "High", advice: "Farmers in Khurda should check paddy fields today. Outbreak detected in Ganjam." },
      or: { origin: "ଗଞ୍ଜାମ", target: "ଖୋର୍ଦ୍ଧା", pest: "ମାଟିଆ ଗୁଣ୍ଡି ପୋକ", crop: "ଧାନ", severity: "ଉଚ୍ଚ", advice: "ଖୋର୍ଦ୍ଧାର ଚାଷୀମାନେ ଆଜି ଧାନ କ୍ଷେତ ଯାଞ୍ଚ କରିବା ଉଚିତ୍। ଗଞ୍ଜାମରେ ପୋକ ଆକ୍ରମଣ ଦେଖାଦେଇଛି।" },
      hi: { origin: "गंजम", target: "खुर्दा", pest: "ब्राउन प्लांट हॉपर", crop: "धान", severity: "उच्च", advice: "खुर्दा के किसानों को धान के खेतों की जांच करनी चाहिए। गंजम में प्रकोप देखा गया है।" }
    },
    {
      lat: 19.90, lng: 83.16,
      en: { origin: "Kalahandi", target: "Balangir", pest: "Whitefly", crop: "Cotton", severity: "Moderate", advice: "Use Neem oil spray as precaution. Pests spreading north." },
      or: { origin: "କଳାହାଣ୍ଡି", target: "ବଲାଙ୍ଗୀର", pest: "ଧଳା ମାଛି", crop: "କପା", severity: "ମଧ୍ୟମ", advice: "ସତର୍କତା ମୂଳକ ପଦକ୍ଷେପ ସ୍ୱରୂପ ନିମ୍ବ ତେଲ ସ୍ପ୍ରେ କରନ୍ତୁ। ପୋକ ଉତ୍ତର ଆଡକୁ ବ୍ୟାପୁଛି।" },
      hi: { origin: "कालाहांडी", target: "बलांगीर", pest: "सफेद मक्खी", crop: "कपास", severity: "मध्यम", advice: "नीम के तेल का स्प्रे करें। कीट उत्तर की ओर फैल रहे हैं।" }
    }
  ];
  return data.map(d => ({ ...d[lang] || d['en'], lat: d.lat, lng: d.lng }));
};
