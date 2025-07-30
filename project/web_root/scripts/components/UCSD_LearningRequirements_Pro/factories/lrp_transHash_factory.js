'use strict';
define(function(require) {
    const module = require('components/UCSD_LearningRequirements_Pro/module');

    module.factory('transHashFactory', ['CryptoJS', (CryptoJS) => {
        const gsLookup = {
            '274d5df9f21fc6b1925192d1619496d2': { // Exceeds
                'bs': 'Izvanredno',
                'sw': 'Inazidi matarajio',
                'lo': 'A hnaṭang',
                'my': 'အထက်ကျော်လွန်သည်',
                'es': 'Excede',
            },
            '00c6733d3ba016d7abcbbf831f237879': { // Partially Exceeding
                'bs': 'Djelomično izvanredno',
                'sw': 'Inazidi kwa sehemu',
                'lo': 'A hnaṭang ṭan ṭang',
                'my': 'တစ်စိတ်တစ်ပိုင်းအထက်ကျော်လွန်သည်',
                'es': 'Parcialmente excede',
            },
            '52cd4d71c7578fbe820b278f788eb82c': { // Meets
                'bs': 'Zadovoljava',
                'sw': 'Inakidhi matarajio',
                'lo': 'A hman',
                'my': 'အဆင့်မှီသည်',
                'es': 'Cumple',
            },
            '5d0e31f00069e2a0463646a07089cb48': { // Partially Meeting
                'bs': 'Djelomično zadovoljava',
                'sw': 'Inakidhi matarajio kwa sehemu',
                'lo': 'A hman ṭan ṭang',
                'my': 'တစ်စိတ်တစ်ပိုင်းအဆင့်မှီသည်',
                'es': 'Parcialmente cumple',
            },
            'fb1a3d53e180aa06850d3bdf9ce14785': { // Approaching
                'bs': 'Približava se standardima',
                'sw': 'Inakaribia matarajio',
                'lo': 'A khat lian nak ah',
                'my': 'အဆင့်နီးကပ်လာသည်',
                'es': 'Se aproxima',
            },
            'ea9284e904218039f8769085a7c05530': { // Partially Approaching
                'bs': 'Djelomično se približava standardima',
                'sw': 'Inakaribia matarajio kwa sehemu',
                'lo': 'A khat lian ṭan ṭang nak ah',
                'my': 'တစ်စိတ်တစ်ပိုင်းအဆင့်နီးကပ်လာသည်',
                'es': 'Parcialmente se aproxima',
            },
            '0558dcc45dad1cfe3d4e55ca16bfbb12': { // Beginning
                'bs': 'Početak razvoja',
                'sw': 'Kuanza matarajio',
                'lo': 'Khan khat khia nak',
                'my': 'အစပြုသည်',
                'es': 'Comienza',
            },
            'b2202bad74e876e684b81005c8a181b2': { // Low Evidence
                'bs': 'Malo dokaza',
                'sw': 'Ushahidi mdogo',
                'lo': 'Kha siar ngah lomi',
                'my': 'သက်သေမရှိထောင့်သတ်မှတ်သည်',
                'es': 'Evidencia baja',
            },
            '4b741fb748a78f988a7704363eefe2cf': { // Missing Evidence
                'bs': 'Nedostaju dokazi',
                'sw': 'Ushahidi umekosekana',
                'lo': 'Kha a siar ngah deuh',
                'my': 'သက်သေမရှိ',
                'es': 'Evidencia faltante',
            },
            '08707019462574697b0b37c91cc77c9e': { // No Evidence
                'bs': 'Bez dokaza',
                'sw': 'Hakuna ushahidi',
                'lo': 'Kha a siar lomi',
                'my': 'သက်သေပြချက်မရှိပါ',
                'es': 'Sin evidencia',
            },
            '0398d5be18c442b5fe7f1f7e6cfb5a67': { // The student consistently and independently demonstrates understanding of grade-level standards. Student performance reveals they consistently demonstrate in-depth inferences and applications that go beyond what was explicitly taught in class.
                'bs': 'Učenik dosljedno i samostalno pokazuje razumijevanje standarda za razredni nivo. Učinak učenika otkriva da dosljedno demonstriraju duboke zaključke i primjene koje nadilaze ono što je eksplicitno podučavano na času.',
                'sw': 'Mwanafunzi mara kwa mara na kwa uhuru huonyesha uelewa wa viwango vya kiwango cha darasa. Utendaji wa mwanafunzi unaonyesha mara kwa mara wanaonyesha maelezo ya kina na matumizi yanayozidi yale yaliyoelekezwa darasani.',
                'lo': 'Minung sun hlonak in hlan lo mi theihhlumhnak ngandamnak a ummi a si. Minung zohkhenh zohkhenh in ruangmi theihhlum tein a ruahnak le a bawmh thawn hlonak in a ummi a si.',
                'my': 'ကျောင်းသားသည်အဆင့်မီစံနှုန်းများကို ဆက်လက်ပြီးလွတ်လပ်စွာ နားလည်မှုကို ပြသသည်။ ကျောင်းသား၏ဆောင်ရွက်မှုသည် သင်ခန်းစာတွင် အကြောင်းအားဖြင့် သင်ကြားထားသည့်အကြောင်းများကို ကျော်လွန်သည့်နက်ရှိုင်းသော သင်္ချာနှင့် လက်တွေ့လေ့ကျင့်မှုများကို ဆက်လက်ပြသပါသည်။',
                'es': 'El estudiante demuestra constantemente y de manera independiente comprensión de los estándares de nivel de grado. El desempeño del estudiante revela que constantemente demuestran inferencias y aplicaciones profundas que van más allá de lo que se enseñó explícitamente en clase.',
            },
            'f8b3c9ef4a323017980e079a6b27738f': { // The student consistently and independently demonstrates understanding of grade-level standards. Student performance reveals they occasionally demonstrate in-depth inferences and applications that go beyond what was explicitly taught in class.
                'bs': 'Učenik dosljedno i samostalno pokazuje razumijevanje standarda za razredni nivo. Učinak učenika otkriva da povremeno demonstriraju duboke zaključke i primjene koje nadilaze ono što je eksplicitno podučavano na času.',
                'sw': 'Mwanafunzi mara kwa mara na kwa uhuru huonyesha uelewa wa viwango vya kiwango cha darasa. Utendaji wa mwanafunzi unaonyesha mara kwa mara wanaponyesha maelezo ya kina na matumizi yanayozidi yale yaliyoelekezwa darasani.',
                'lo': 'Minung sun hlonak in hlan lo mi theihhlumhnak ngandamnak a ummi a si. Minung zohkhenh tikah ruangmi theihhlum tein a ruahnak le bawmh tein a ummi a si.',
                'my': 'ကျောင်းသားသည်အဆင့်မီစံနှုန်းများကို ဆက်လက်ပြီးလွတ်လပ်စွာ နားလည်မှုကို ပြသသည်။ ကျောင်းသား၏ဆောင်ရွက်မှုသည် သင်ခန်းစာတွင် အကြောင်းအားဖြင့် သင်ကြားထားသည့်အကြောင်းများကို ကျော်လွန်သည့်နက်ရှိုင်းသော သင်္ချာနှင့် လက်တွေ့လေ့ကျင့်မှုများကို တခါတရံပြသပါသည်။',
                'es': 'El estudiante demuestra constantemente y de manera independiente comprensión de los estándares de nivel de grado. El desempeño del estudiante revela que ocasionalmente demuestran inferencias y aplicaciones profundas que van más allá de lo que se enseñó explícitamente en clase.',
            },
            '1c6dc734f245be4f147f2963e0c66576': { // The student consistently and independently demonstrates understanding of information and skills—simple and complex—that represent grade-level standards and expectations for learning.
                'bs': 'Učenik dosljedno i samostalno pokazuje razumijevanje informacija i vještina – jednostavnih i složenih – koje predstavljaju standarde razrednog nivoa i očekivanja za učenje.',
                'sw': 'Mwanafunzi mara kwa mara na kwa uhuru huonyesha uelewa wa taarifa na ujuzi—rahisi na changamano—ambayo yanawakilisha viwango vya kiwango cha darasa na matarajio ya kujifunza.',
                'lo': 'Minung sun hlonak in ngandam lo theihhlumhnak le pawlnak – ziang le hlanah pawlin ngandamna a ummi hmun ahcun kan i theih a si.',
                'my': 'ကျောင်းသားသည် အဆင့်မီစံနှုန်းများနှင့် သင်ယူမှုအတွက် မျှော်လင့်ချက်များကို ကိုယ်စားပြုသည့် ရိုးရှင်းသောနှင့်ရှုပ်ထွေးသောအချက်များနှင့်ကျွမ်းကျင်မှုများကို ဆက်လက်လွတ်လပ်စွာ နားလည်မှုကို ပြသသည်။',
                'es': 'El estudiante demuestra constantemente y de manera independiente comprensión de la información y habilidades—simples y complejas—que representan los estándares de nivel de grado y las expectativas de aprendizaje.',
            },
            '5c4b907813647f53ec7f1f4cb99cab73': { // The student demonstrates some understanding of information and skills that are represented in grade-level standards, although he/she has gaps.
                'bs': 'Učenik pokazuje određeno razumijevanje informacija i vještina koje su predstavljene u standardima za razredni nivo, iako ima nedostatke.',
                'sw': 'Mwanafunzi anaonyesha kiwango fulani cha uelewa wa taarifa na ujuzi unaowakilishwa katika viwango vya kiwango cha darasa, ingawa ana mapungufu.',
                'lo': 'Minung sun zohkhenh in a si mi a tuahmi nawnpawl hi zohkhenh le than bikah a ummi thawhnak a si.',
                'my': 'ကျောင်းသားသည် အဆင့်မီစံနှုန်းများတွင် ဖော်ပြထားသည့် အချက်အလက်များနှင့် ကျွမ်းကျင်မှုများကို တစ်စိတ်တစ်ပိုင်း နားလည်မှုကို ပြသပြီး လိုအပ်ချက်များရှိသည်။',
                'es': 'El estudiante demuestra cierta comprensión de la información y habilidades que se representan en los estándares de nivel de grado, aunque tiene lagunas.',
            },
            '8a6672b32b2d8a77025a2ac7d49993f6': { // The student demonstrates an understanding of foundational information and skills that are represented in grade-level standards. Though the student has gaps in learning with more complex information and skills. The student is beginning to understand grade-level standards.
                'bs': 'Učenik pokazuje razumijevanje osnovnih informacija i vještina koje su predstavljene u standardima za razredni nivo. Ipak, učenik ima praznine u učenju složenijih informacija i vještina. Učenik počinje razumijevati standarde razrednog nivoa.',
                'sw': 'Mwanafunzi anaonyesha uelewa wa taarifa za msingi na ujuzi unaowakilishwa katika viwango vya kiwango cha darasa. Hata hivyo, mwanafunzi ana mapungufu katika kujifunza taarifa changamano zaidi na ujuzi. Mwanafunzi anaanza kuelewa viwango vya kiwango cha darasa.',
                'lo': 'Minung sun a theihhngan ahcun thawhnak ih than bik a si lo ti le a sim a si.',
                'my': 'ကျောင်းသားသည်အဆင့်မီစံနှုန်းများတွင် ဖော်ပြထားသော အခြေခံ အချက်အလက်များနှင့် ကျွမ်းကျင်မှုများကို နားလည်မှုကို ပြသပါသည်။ သို့သော် ကျောင်းသားသည် ပိုရှုပ်ထွေးသော အချက်အလက်များနှင့် ကျွမ်းကျင်မှုများ၏ သင်ယူမှုအတွက် လိုအပ်ချက်များရှိသည်။',
                'es': 'El estudiante demuestra comprensión de información y habilidades fundamentales que se representan en los estándares de nivel de grado. Aunque el estudiante tiene lagunas en el aprendizaje de información y habilidades más complejas, está comenzando a entender los estándares de nivel de grado.',
            },
            '4cd59d6daabcfc5c12b93df5a1581e7b': { // The student demonstrates understanding of some key information and skills that are represented in grade-level standards, although they consistently shows gaps in demonstrating understanding.
                'bs': 'Učenik pokazuje razumijevanje nekih ključnih informacija i vještina predstavljenih u standardima za razredni nivo, iako dosljedno pokazuje praznine u razumijevanju.',
                'sw': 'Mwanafunzi anaonyesha uelewa wa baadhi ya taarifa muhimu na ujuzi unaowakilishwa katika viwango vya kiwango cha darasa, ingawa mara kwa mara huonyesha mapungufu katika kuonyesha uelewa.',
                'lo': 'Minung zohkhenh ahcun a si mi theihhnak nawnpawl tein a than hnga, theihhnak tiangin cung i simmi zohkhenh a um.',
                'my': 'ကျောင်းသားသည်အချို့သောအချက်အလက်နှင့် ကျွမ်းကျင်မှုများကို နားလည်မှုကိုပြသသော်လည်း နားလည်မှုကို ပြသရာတွင် အမြဲတမ်းပျက်ကွက်နေသည်။',
                'es': 'El estudiante demuestra comprensión de algunas informaciones y habilidades clave representadas en los estándares de nivel de grado, aunque constantemente muestra lagunas en su comprensión.'
            },
            'f0c3438cec97ef00860f34e8451fb660': { // The student demonstrates significant gaps in understanding information and skills that are represented in grade-level standards. Progress toward approaching grade level standards is inconsistent.
                'bs': 'Učenik pokazuje značajne praznine u razumijevanju informacija i vještina predstavljenih u standardima za razredni nivo. Napredak prema standardima razrednog nivoa je nedosljedan.',
                'sw': 'Mwanafunzi anaonyesha mapungufu makubwa katika uelewa wa taarifa na ujuzi unaowakilishwa katika viwango vya kiwango cha darasa. Maendeleo kuelekea kufikia viwango vya darasa hayako thabiti.',
                'lo': 'Minung zohkhenh in a theihhnak tein lungrelnak pawl dang an um lo. A ruahnak in cungmi zumhnak a pe lo.',
                'my': 'ကျောင်းသားသည်အဆင့်မီစံနှုန်းများတွင် ဖော်ပြထားသည့်အချက်များနှင့် ကျွမ်းကျင်မှုများကို နားလည်မှုတွင် ထင်ရှားသော အခက်အခဲများရှိသည်။',
                'es': 'El estudiante demuestra lagunas significativas en la comprensión de información y habilidades representadas en los estándares de nivel de grado. El progreso hacia alcanzar los estándares de nivel de grado es inconsistente.'
            },
            '376938e5c6702de1597c66bca10190a2': { // Based on student evidence that has been collected, the student has not demonstrated any understanding of grade-level information and skills.
                'bs': 'Na osnovu prikupljenih dokaza, učenik nije pokazao nikakvo razumijevanje informacija i vještina na nivou razreda.',
                'sw': 'Kulingana na ushahidi wa mwanafunzi uliokusanywa, mwanafunzi hajaonyesha uelewa wowote wa taarifa na ujuzi wa kiwango cha darasa.',
                'lo': 'Minung ruang in ummi cung ah cun a theihmi nawnpawl pek asi lo.',
                'my': 'ကျောင်းသား၏ အခိုင်အမာ အထောက်အထားများအပေါ်မူတည်၍ အဆင့်မီစံနှုန်းများကို နားလည်မှု မရှိကြောင်း ပြထားသည်။',
                'es': 'Basado en la evidencia del estudiante recopilada, el estudiante no ha demostrado ninguna comprensión de la información y habilidades de nivel de grado.'
            },
            '4c6e9523cd148e990587e2141cebd392': { // The student has not completed enough and/or is missing evidence for the teacher to determine to what extent the student demonstrates understanding of grade-level standards.
                'bs': 'Učenik nije završio dovoljno dokaza i/ili nedostaju dokazi kako bi učitelj mogao odrediti u kojoj mjeri učenik pokazuje razumijevanje standarda za razredni nivo.',
                'sw': 'Mwanafunzi hajakamilisha ushahidi wa kutosha na/au ushahidi unakosekana kwa mwalimu kuweza kuamua ni kwa kiwango gani mwanafunzi anaonyesha uelewa wa viwango vya kiwango cha darasa.',
                'lo': 'Minung cun bawmhnak ttialmi cung nih ai tuah hnga mawqhat mi a si lo ruangah an zohhlan lo.',
                'my': 'ကျောင်းသားသည်သက်သေမှုလုံလောက်စွာ မပြုလုပ်ရသေးပေ။',
                'es': 'El estudiante no ha completado suficientes evidencias y/o faltan evidencias para que el maestro determine hasta qué punto el estudiante demuestra comprensión de los estándares de nivel de grado.'
            },
            '6523213db1114fb8569be73794ebc094': { // The student has not completed any evidence for the teacher to determine to what extent the student demonstrats understanding of grade-level standards.
                'bs': 'Učenik nije završio nikakve dokaze kako bi učitelj mogao odrediti u kojoj mjeri učenik pokazuje razumijevanje standarda za razredni nivo.',
                'sw': 'Mwanafunzi hajakamilisha ushahidi wowote ili mwalimu aweza kuamua ni kwa kiwango gani mwanafunzi anaonyesha uelewa wa viwango vya kiwango cha darasa.',
                'lo': 'Minung nih ai theih zohdan pawl pek asi lo ahcun minung a zohnak zoh a herh.',
                'my': 'ကျောင်းသားသည်သက်သေမပြုလုပ်ပါ။',
                'es': 'El estudiante no ha completado ninguna evidencia para que el maestro determine hasta qué punto el estudiante demuestra comprensión de los estándares de nivel de grado.'
            },
            '9e21244bc8aa8117c061f213fea1cd25': { // "Exceeding grade level standard"
                'preHashed': 'Exceeding grade level standard',
                'bs': 'Premašivanje standarda razine razreda',
                'sw': 'Kuzidi viwango vya daraja la kiwango',
                'lo': 'A sianginn level te hnaquan a um',
                'my': 'တန်းထိအဆင့်စံချိန်ကျော်လွန်နေသည်',
                'es': 'Excediendo el estándar de nivel de grado'
            },
            '7ff85990376cdcfd32450855f220e188': { // "Partially exceeding grade level standard"
                'preHashed': 'Partially exceeding grade level standard',
                'bs': 'Djelomično premašivanje standarda razine razreda',
                'sw': 'Kuzidi sehemu viwango vya daraja la kiwango',
                'lo': 'A sianginn level te hnaquan le kha hlutlhia um',
                'my': 'တန်းထိအဆင့်စံချိန်ကိုတစ်စိတ်တစ်ပိုင်းကျော်လွန်နေသည်',
                'es': 'Superando parcialmente el estándar de nivel de grado'
            },
            '062b57f4cb9233eb8d76026fc95628a7': { // "Meeting grade level standard"
                'preHashed': 'Meeting grade level standard',
                'bs': 'Zadovoljenje standarda razine razreda',
                'sw': 'Kufikia viwango vya daraja la kiwango',
                'lo': 'A sianginn level te hnaquan le a dung',
                'my': 'တန်းထိအဆင့်စံချိန်ကိုတွေ့ဆုံ',
                'es': 'Cumpliendo el estándar de nivel de grado'
            },
            '8963d88e30187749599d98decd4bdfef': { // "Partially meeting grade level standard"
                'preHashed': 'Partially meeting grade level standard',
                'bs': 'Djelomično zadovoljenje standarda razine razreda',
                'sw': 'Kufikia sehemu viwango vya daraja la kiwango',
                'lo': 'A sianginn level te hnaquan le kha hlutlhia dung',
                'my': 'တန်းထိအဆင့်စံချိန်ကိုတစ်စိတ်တစ်ပိုင်းတွေ့ဆုံ',
                'es': 'Cumpliendo parcialmente el estándar de nivel de grado'
            },
            '9eea21969f3fae1f10aeca2f54d1720e': { // "Approaching grade level standard"
                'preHashed': 'Approaching grade level standard',
                'bs': 'Približavanje standardu razine razreda',
                'sw': 'Kukaribia viwango vya daraja la kiwango',
                'lo': 'A sianginn level te hnaquan a tlun',
                'my': 'တန်းထိအဆင့်စံချိန်ကိုနီးစပ်',
                'es': 'Aproximándose al estándar de nivel de grado'
            },
            'bbb5ee5c57c3ef6bcb1d94372d9f1134': { // Partially approaching grade level standard
                'preHashed': 'Partially approaching grade level standard',
                'bs': 'Djelomično približavanje standardu nivoa razreda',
                'sw': 'Kufikia viwango vya daraja kwa sehemu',
                'lo': 'Thlirin ngei in kaihnih nak bantukin phah dah a si',
                'my': 'အတန်းသတ်မှတ်စံချိန်ကို အပိုင်းပိုင်းနီးစပ်ခြင်း',
                'es': 'Acercándose parcialmente al estándar del nivel de grado',
            },
            'b4232e707bb215a2d3910c3ec022cfbe': { // Beginning level of proficiency
                'preHashed': 'Beginning level of proficiency',
                'bs': 'Početni nivo vještine',
                'sw': 'Kiwango cha mwanzo cha ustadi',
                'lo': 'Thiamna gam hman ding nunau',
                'my': 'ကျွမ်းကျင်မှုစွမ်းရည်အစ',
                'es': 'Nivel inicial de competencia',
            },
            '25442a9d3b37ad37cb6d8d2106f8643c': { // No evidence provided
                'bs': 'Nema dostavljenih dokaza',
                'sw': 'Hakuna ushahidi uliotolewa',
                'lo': 'Vawlei tawn pekmi a um lo',
                'my': 'သက်သေထောက်ခံချက် မပေးပါ',
                'es': 'No se proporcionó evidencia',
            },
            '6046e9ecdb63fca9f16f495863147620': { // Non-Participation
                'bs': 'Nedostatak učešća',
                'sw': 'Kutokushiriki',
                'lo': 'Hnaquan chung telmi a si lo',
                'my': 'တက်ရောက်မှုမရှိခြင်း',
                'es': 'No participación',
            },
            '4307e7e7986aa21a4b7c3ef2b5e948f6': { // Incomplete
                'bs': 'Nepotpuno',
                'sw': 'Haijakamilika',
                'lo': 'Tih feh mi',
                'my': 'မပြီးစီးသော',
                'es': 'Incompleto',
            },
            'ec36eecb212798bfc86076f1759b5824': { // Participation
                'bs': 'Učešće',
                'sw': 'Ushiriki',
                'lo': 'Hnaquan chung tel',
                'my': 'တက်ရောက်မှု',
                'es': 'Participación',
            },
            'e04898ea4ffe4c4a41f570b25e1d6aab': { // Not assessed in this reporting term
                'bs': 'Nije procijenjeno u ovom izvještajnom terminu',
                'sw': 'Haijapimwa katika muhula huu wa ripoti',
                'lo': 'Thilri ngahmi thla hi zohkhiat a si lo',
                'my': 'ဤမှတ်တမ်းကာလတွင် မဖော်ပြရသေးပါ',
                'es': 'No evaluado en este período de informe',
            },
            'f70cd553f0393ba6b768b269f3c133d9': { // Not assessed at this time
                'bs': 'Nije procijenjeno u ovom trenutku',
                'sw': 'Haijapimwa kwa wakati huu',
                'lo': 'Cunhnak cu a si lo',
                'my': 'ယခုအချိန်တွင် မဖော်ပြရသေးပါ',
                'es': 'No evaluado en este momento',
            },
            '0398d5be18c442b5fe7f1f7e6cfb5a67': { // The student consistently and independently demonstrates understanding of grade-level standards. Student performance reveals they consistently demonstrate in-depth inferences and applications that go beyond what was explicitly taught in class.
                'bs': 'Učenik dosljedno i samostalno pokazuje razumijevanje standarda za nivo razreda. Performanse učenika otkrivaju da dosljedno demonstriraju dubinske zaključke i primjene koje nadilaze ono što je eksplicitno podučavano u nastavi.',
                'sw': 'Mwanafunzi huonyesha kwa uthabiti na kujitegemea uelewa wa viwango vya daraja. Utendaji wa mwanafunzi unaonyesha mara kwa mara uwezo wa kufanya hitimisho za kina na matumizi yanayozidi yale yaliyoelekezwa darasani.',
                'lo': 'A sianginn i relnak le nihkhawn in hnaquan sang thilri a theihningah kan relh. A thil thu a piangmi cu thil rel lo te’n kan tuahmi bantuk a um ko.',
                'my': 'ကျောင်းသားသည် အတန်းအဆင့် စံနှုန်းများကို အမြဲတမ်းနှင့် ကိုယ်တိုင်နားလည်မှုကို ပြသသည်။ ကျောင်းသား၏ စွမ်းဆောင်ရည်က အတန်းတွင် သွားမထားသည့် နက်ရှိုင်းသော သုံးသပ်ချက်များနှင့် အက်ပလီကေးရှင်းများကို ဆောင်ရွက်နိုင်ကြောင်း သက်သေပြသည်။',
                'es': 'El estudiante demuestra de manera consistente e independiente comprensión de los estándares del nivel de grado. El desempeño del estudiante revela que consistentemente demuestra inferencias profundas y aplicaciones que van más allá de lo que se enseñó explícitamente en clase.',
            },
            '8a822fddf4019934ec0dbd93bfea1329': { // The content was not assessed during this reporting period.
                'bs': 'Sadržaj nije procijenjen tokom ovog izvještajnog perioda.',
                'sw': 'Yaliyomo hayakupimwa katika kipindi hiki cha ripoti.',
                'lo': 'Hnaquan a report caan thla cu a zohkhial a si lo.',
                'my': 'ဤမှတ်တမ်းကာလအတွင်း အကြောင်းအရာကို မစစ်ဆေးခဲ့ပါ။',
                'es': 'El contenido no fue evaluado durante este período de informes.',
            },
            '1c6dc734f245be4f147f2963e0c66576': { // The student consistently and independently demonstrates understanding of information and skills—simple and complex—that represent grade-level standards and expectations for learning.
                'bs': 'Učenik dosljedno i samostalno pokazuje razumijevanje informacija i vještina—jednostavnih i složenih—koje predstavljaju standarde za nivo razreda i očekivanja učenja.',
                'sw': 'Mwanafunzi huonyesha kwa uthabiti na kujitegemea uelewa wa taarifa na ujuzi—rahisi na changamano—ambayo yanawakilisha viwango vya daraja na matarajio ya kujifunza.',
                'lo': 'Relnak le nihkhawn in remnung le kaithiam theihning, le hnaquan nih relhmi hman te, hlawk te kan si.',
                'my': 'ကျောင်းသားသည် အတန်းအဆင့်စံနှုန်းများနှင့် သင်ယူမှု မျှော်မှန်းချက်များကို ကိုယ်တိုင်နားလည်ပြီး ရိုးရှင်းသော၊ စုံလင်သော အချက်အလက်နှင့် ကျွမ်းကျင်မှုများကို အမြဲပြသသည်။',
                'es': 'El estudiante demuestra de manera consistente e independiente comprensión de información y habilidades, simples y complejas, que representan los estándares de nivel de grado y las expectativas de aprendizaje.',
            },
            '5c4b907813647f53ec7f1f4cb99cab73': { // The student demonstrates some understanding of information and skills that are represented in grade-level standards, although he/she has gaps.
                'bs': 'Učenik pokazuje određeno razumijevanje informacija i vještina koje su predstavljene u standardima za nivo razreda, iako ima praznine.',
                'sw': 'Mwanafunzi huonyesha uelewa fulani wa taarifa na ujuzi unaowakilisha viwango vya daraja, ingawa ana mapungufu.',
                'lo': 'A sianginn i hnaquan nih relhmi thil hlawk le kaithiam a thei ning kan rak hmuh dih ko, gap te a um.',
                'my': 'ကျောင်းသားသည် အတန်းစံနှုန်းများကို ကိုယ်စားပြုသော အချက်အလက်များနှင့် ကျွမ်းကျင်မှုများကို နားလည်မှု အချို့ပြသသော်လည်း ချို့တာချက်များ ရှိပါသည်။',
                'es': 'El estudiante demuestra algún entendimiento de la información y habilidades que están representadas en los estándares de nivel de grado, aunque tiene lagunas.',
            },
            '8a6672b32b2d8a77025a2ac7d49993f6': { // The student demonstrates an understanding of foundational information and skills that are represented in grade-level standards. Though the student has gaps in learning with more complex information and skills. The student is beginning to understand grade-level standards.
                'bs': 'Učenik pokazuje razumijevanje osnovnih informacija i vještina koje su predstavljene u standardima za nivo razreda. Ipak, učenik ima praznine u učenju složenijih informacija i vještina. Učenik počinje razumijevati standarde za nivo razreda.',
                'sw': 'Mwanafunzi huonyesha uelewa wa taarifa za msingi na ujuzi unaowakilisha viwango vya daraja. Hata hivyo, mwanafunzi ana mapungufu katika kujifunza taarifa na ujuzi changamano zaidi. Mwanafunzi anaanza kuelewa viwango vya daraja.',
                'lo': 'A sianginn i hnaquan nih relhmi a hmanmi thil relnak le kaithiam theihning pawl a thei. Siloah a hnathlakmi thilri pawl a hman dih chungin gap te a ummi kan si. A sianginn i hnaquan rel thei tawn a cawnpiak dih.',
                'my': 'ကျောင်းသားသည် အတန်းအဆင့်စံနှုန်းများကို ကိုယ်စားပြုသော အခြေခံသတင်းအချက်အလက်နှင့် ကျွမ်းကျင်မှုများကို နားလည်သည်ဟု ပြသသည်။ သို့သော် ထို့ထက်ပို၍ ရှုပ်ထွေးသော သတင်းအချက်အလက်နှင့် ကျွမ်းကျင်မှုများကို သင်ယူရာတွင် ချို့တာချက်များရှိသည်။ ကျောင်းသားသည် အတန်းအဆင့်စံနှုန်းများကို နားလည်ဖို့ စတင်နေပြီဖြစ်သည်။',
                'es': 'El estudiante demuestra un entendimiento de la información y habilidades fundamentales que están representadas en los estándares de nivel de grado. Sin embargo, el estudiante tiene lagunas en el aprendizaje de información y habilidades más complejas. El estudiante está comenzando a comprender los estándares de nivel de grado.',
            },
            '4cd59d6daabcfc5c12b93df5a1581e7b': { // The student demonstrates understanding of some key information and skills that are represented in grade-level standards, although they consistently shows gaps in demonstrating understanding.
                'bs': 'Učenik pokazuje razumijevanje nekih ključnih informacija i vještina koje su predstavljene u standardima za nivo razreda, iako dosljedno pokazuje praznine u razumijevanju.',
                'sw': 'Mwanafunzi huonyesha uelewa wa baadhi ya taarifa muhimu na ujuzi unaowakilisha viwango vya daraja, ingawa mara kwa mara huonyesha mapungufu katika uelewa.',
                'lo': 'A sianginn i hnaquan nih relhmi a hmanmi thil hlawk le thilri pawl a theih, cunhlan ah thilri rel theinak ah gap pawl a hmanpiak dih.',
                'my': 'ကျောင်းသားသည် အတန်းအဆင့်စံနှုန်းများကို ကိုယ်စားပြုသော အချို့သော သတ်မှတ်ချက်များနှင့် ကျွမ်းကျင်မှုများကို နားလည်သည်ဟု ပြသသည်။ သို့သော် နားလည်မှု ပြသရာတွင် ချို့ယွင်းချက်များအမြဲရှိနေသည်။',
                'es': 'El estudiante demuestra comprensión de algunas informaciones clave y habilidades que están representadas en los estándares de nivel de grado, aunque constantemente muestra lagunas en demostrar comprensión.',
            },
            'f0c3438cec97ef00860f34e8451fb660': { // The student demonstrates significant gaps in understanding information and skills that are represented in grade-level standards. Progress toward approaching grade level standards is inconsistent.
                'bs': 'Učenik pokazuje značajne praznine u razumijevanju informacija i vještina koje su predstavljene u standardima za nivo razreda. Napredak ka postizanju standarda za nivo razreda je nedosljedan.',
                'sw': 'Mwanafunzi huonyesha mapungufu makubwa katika kuelewa taarifa na ujuzi unaowakilisha viwango vya daraja. Maendeleo kuelekea kufikia viwango vya daraja si thabiti.',
                'lo': 'A sianginn i hnaquan nih relhmi thilri le kaithiam theinak ah gap an tampi. Hnaquan rel thlak dan kan kai tikcuan tihtlawm a si lo.',
                'my': 'ကျောင်းသားသည် အတန်းအဆင့်စံနှုန်းများကို ကိုယ်စားပြုသော သတင်းအချက်အလက်နှင့် ကျွမ်းကျင်မှုများကို နားလည်မှုတွင် တော်တော်များများ ချို့ယွင်းချက်များရှိသည်။ အတန်းစံနှုန်းများဆီသို့ ရောက်ရှိရန်တိုးတက်မှုမှာ မတူညီမှုများရှိသည်။',
                'es': 'El estudiante demuestra lagunas significativas en la comprensión de la información y habilidades que están representadas en los estándares de nivel de grado. El progreso hacia alcanzar los estándares de nivel de grado es inconsistente.',
            },
            '7ee9bfe4a5cfa6f8faa3b8e97724ce55': { // The student has produced no evidence for the teacher to determine to what extent the student understands the learning requirement.
                'bs': 'Učenik nije dostavio nikakve dokaze na osnovu kojih bi nastavnik mogao utvrditi u kojoj mjeri učenik razumije zahtjev za učenje.',
                'sw': 'Mwanafunzi hajatoa ushahidi wowote kwa mwalimu kuamua ni kwa kiwango gani mwanafunzi anaelewa mahitaji ya kujifunza.',
                'lo': 'A sianginn i cawnpiak hnaquan nih rel a thei ruang an thanmi thilri cawnnak a um lo.',
                'my': 'ကျောင်းသားသည် သင်ယူရန်လိုအပ်ချက်ကို နားလည်သဘောပေါက်မှုကို ဆရာ/ဆရာမ သတ်မှတ်နိုင်ရန် အထောက်အထားမပြုနိုင်ပါ။',
                'es': 'El estudiante no ha presentado evidencia para que el maestro pueda determinar hasta qué punto comprende el requisito de aprendizaje.',
            },
            '61a2a6c40abb2f8b4065b8cb22b15727': { // The student did not regularly and actively participate in extension activities.
                'bs': 'Učenik nije redovno i aktivno učestvovao u dodatnim aktivnostima.',
                'sw': 'Mwanafunzi hakushiriki mara kwa mara na kwa bidii katika shughuli za nyongeza.',
                'lo': 'A sianginn i hnaquan nih hman dih le ruangam in hmunkip thilri i an telh dih lo.',
                'my': 'ကျောင်းသားသည် တိုးချဲ့လုပ်ဆောင်ချက်များတွင် ပုံမှန်နှင့် တက်ကြွစွာ ပါဝင်မဆောင်ရွက်ခဲ့ပါ။',
                'es': 'El estudiante no participó regularmente ni activamente en las actividades de extensión.',
            },
            '74f45f07291b28d395eea2e0ea17461a': { // The student has produced insufficient evidence for the teacher to determine to what extent the student understands the learning requirement.
                'bs': 'Učenik nije dostavio dovoljno dokaza da nastavnik može utvrditi u kojoj mjeri razumije zahtjev za učenje.',
                'sw': 'Mwanafunzi hakuonyesha ushahidi wa kutosha kwa mwalimu kuamua kiwango ambacho mwanafunzi anaelewa mahitaji ya kujifunza.',
                'lo': 'A sianginn i hnaquan nih rel le kaithiam theinak ruang an thanmi thilri a um deuh lo.',
                'my': 'ကျောင်းသားသည် သင်ယူရန်လိုအပ်ချက်ကို နားလည်သဘောပေါက်မှုအတန်းအထိကို ဆရာ/ဆရာမ သတ်မှတ်နိုင်ရန် လုံလောက်သော အထောက်အထားမပြုနိုင်ပါ။',
                'es': 'El estudiante no ha presentado evidencia suficiente para que el maestro pueda determinar hasta qué punto comprende el requisito de aprendizaje.',
            },
            '2121de1feb03faa1f5cbb3fba2cc9f1d': { // The student participated as expected in the extension activities
                'bs': 'Učenik je učestvovao u dodatnim aktivnostima kako se očekivalo.',
                'sw': 'Mwanafunzi alishiriki kama ilivyotarajiwa katika shughuli za nyongeza.',
                'lo': 'A sianginn i hnaquan nih hmunkip thilri i an telh dih cang.',
                'my': 'ကျောင်းသားသည် တိုးချဲ့လုပ်ဆောင်ချက်များတွင် မျှော်လင့်ထားသလို ပါဝင်ဆောင်ရွက်ခဲ့ပါသည်။',
                'es': 'El estudiante participó como se esperaba en las actividades de extensión.',
            }
        };

        function getMD5(text) {
            return CryptoJS.MD5(text).toString(CryptoJS.enc.Hex);
        }

        function translateGradeScales(gradescaleList, lang) {
            if (lang !== 'en') {
                for (const gradescales of gradescaleList) {
                    for (const gradescale of gradescales.gradeScales) {
                        const lokKey = getMD5(gradescale.lok);
                        const desKey = getMD5(gradescale.description);

                        gradescale.lok = gsLookup[lokKey]?.[lang] || gradescale.lok;
                        gradescale.description = gsLookup[desKey]?.[lang] || gradescale.description;
                    }
                }  
            }

            return gradescaleList;
        }

        return {
            translateGradeScales
        };
    }]);
});