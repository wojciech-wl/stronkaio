import { FiCamera, FiSearch, FiBookOpen, FiShield, FiSmartphone, FiZap } from "react-icons/fi";

import { IBenefit } from "@/types"

export const benefits: IBenefit[] = [
    {
        title: "Skanowanie produktow",
        titleEn: "Product Scanning",
        description: "Skanuj kody kreskowe i etykiety produktow. Uzyskaj natychmiastowa ocene wplywu na poziom cukru we krwi.",
        descriptionEn: "Scan barcodes and product labels. Get instant assessment of impact on blood sugar levels.",
        bullets: [
            {
                title: "Baza 4M+ produktow",
                titleEn: "4M+ Products Database",
                description: "Integracja z Open Food Facts - globalna baza danych produktow spozywczych.",
                descriptionEn: "Integration with Open Food Facts - a global food products database.",
                icon: <FiSearch size={26} />
            },
            {
                title: "OCR offline",
                titleEn: "Offline OCR",
                description: "Rozpoznawanie etykiet dziala bez internetu dzieki AI na urzadzeniu.",
                descriptionEn: "Label recognition works without internet thanks to on-device AI.",
                icon: <FiCamera size={26} />
            },
            {
                title: "Wynik 0-100",
                titleEn: "Score 0-100",
                description: "Przejrzysty scoring uwzgledniajacy IO - od razu wiesz, czy produkt jest dla Ciebie.",
                descriptionEn: "Clear scoring considering IR - you immediately know if the product is right for you.",
                icon: <FiZap size={26} />
            }
        ],
        imageSrc: "/images/feature-scan.png"
    },
    {
        title: "Analiza dan i menu",
        titleEn: "Dish & Menu Analysis",
        description: "Zrob zdjecie dania lub menu restauracyjnego. AI przeanalizuje sklad i poda ranking najlepszych wyborow.",
        descriptionEn: "Take a photo of a dish or restaurant menu. AI will analyze the composition and provide a ranking of the best choices.",
        bullets: [
            {
                title: "Analiza zdjec dan",
                titleEn: "Dish Photo Analysis",
                description: "Zrob zdjecie talerza - AI rozpozna skladniki i oceni wplyw na glikemie.",
                descriptionEn: "Take a photo of your plate - AI will recognize ingredients and assess glycemic impact.",
                icon: <FiCamera size={26} />
            },
            {
                title: "Skanowanie menu",
                titleEn: "Menu Scanning",
                description: "Zrob zdjecie karty menu - uzyskaj ranking dan od najlepszych do tych, ktorych lepiej unikac.",
                descriptionEn: "Take a photo of the menu card - get a ranking from best to dishes to avoid.",
                icon: <FiSearch size={26} />
            },
            {
                title: "Wskazowki i tipy",
                titleEn: "Tips & Guidance",
                description: "Kazda analiza zawiera wyjasnienie wyniku i praktyczne wskazowki.",
                descriptionEn: "Each analysis includes explanation of the score and practical tips.",
                icon: <FiBookOpen size={26} />
            }
        ],
        imageSrc: "/images/feature-menu.png"
    },
    {
        title: "Nauka o insulinoopornosci",
        titleEn: "Learning About IR",
        description: "Quiz z 420+ pytaniami, codzienne wskazowki i seria aktywnosci. Ucz sie przez dzialanie, nie przez reguly.",
        descriptionEn: "Quiz with 420+ questions, daily tips and activity streaks. Learn by doing, not by rules.",
        bullets: [
            {
                title: "Quiz wiedzy",
                titleEn: "Knowledge Quiz",
                description: "Ponad 420 pytan w 5 kategoriach. Sprawdz swoja wiedze i ucz sie nowych rzeczy.",
                descriptionEn: "Over 420 questions in 5 categories. Test your knowledge and learn new things.",
                icon: <FiBookOpen size={26} />
            },
            {
                title: "Codzienna wskazowka",
                titleEn: "Daily Tip",
                description: "Codziennie nowa, praktyczna porada o zyciu z insulinoopornoscia.",
                descriptionEn: "A new practical tip about living with insulin resistance every day.",
                icon: <FiZap size={26} />
            },
            {
                title: "Seria aktywnosci",
                titleEn: "Activity Streak",
                description: "Buduj nawyk codziennego korzystania z aplikacji i sledz swoj postep.",
                descriptionEn: "Build a habit of using the app daily and track your progress.",
                icon: <FiSmartphone size={26} />
            }
        ],
        imageSrc: "/images/feature-learn.png"
    },
    {
        title: "Prywatnosc w DNA",
        titleEn: "Privacy in DNA",
        description: "Nie zbieramy danych uzytkownikow. Brak kont, brak rejestracji, brak reklam. Twoje zdrowie, Twoja prywatnosc.",
        descriptionEn: "We don't collect user data. No accounts, no registration, no ads. Your health, your privacy.",
        bullets: [
            {
                title: "Brak kont",
                titleEn: "No Accounts",
                description: "Nie wymagamy rejestracji ani logowania. Zainstaluj i korzystaj.",
                descriptionEn: "No registration or login required. Install and use.",
                icon: <FiShield size={26} />
            },
            {
                title: "Brak reklam",
                titleEn: "No Ads",
                description: "Zero reklam, zero trackerow, zero profilowania behawioralnego.",
                descriptionEn: "Zero ads, zero trackers, zero behavioral profiling.",
                icon: <FiShield size={26} />
            },
            {
                title: "Lokalne przetwarzanie",
                titleEn: "Local Processing",
                description: "Zdjecia sa przetwarzane lokalnie i natychmiast usuwane. Nic nie opuszcza Twojego urzadzenia.",
                descriptionEn: "Photos are processed locally and immediately deleted. Nothing leaves your device.",
                icon: <FiSmartphone size={26} />
            }
        ],
        imageSrc: "/images/feature-privacy-v2.png"
    },
]
