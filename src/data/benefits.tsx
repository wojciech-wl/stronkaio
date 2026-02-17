import { FiCamera, FiSearch, FiBookOpen, FiShield, FiSmartphone, FiZap } from "react-icons/fi";

import { IBenefit } from "@/types"

export const benefits: IBenefit[] = [
    {
        title: "Skanowanie produktow",
        description: "Skanuj kody kreskowe i etykiety produktow. Uzyskaj natychmiastowa ocene wpływu na poziom cukru we krwi.",
        bullets: [
            {
                title: "Baza 4M+ produktow",
                description: "Integracja z Open Food Facts - globalną bazą danych produktów spożywczych.",
                icon: <FiSearch size={26} />
            },
            {
                title: "OCR offline",
                description: "Rozpoznawanie etykiet działa bez internetu dzięki AI na urządzeniu.",
                icon: <FiCamera size={26} />
            },
            {
                title: "Wynik 0-100",
                description: "Przejrzysty scoring uwzględniający IO - od razu wiesz, czy produkt jest dla Ciebie.",
                icon: <FiZap size={26} />
            }
        ],
        imageSrc: "/images/mockup-1.webp"
    },
    {
        title: "Analiza dan i menu",
        description: "Zrób zdjęcie dania lub menu restauracyjnego. AI przeanalizuje skład i poda ranking najlepszych wyborow.",
        bullets: [
            {
                title: "Analiza zdjęć dań",
                description: "Zrób zdjęcie talerza - AI rozpozna składniki i oceni wpływ na glikemię.",
                icon: <FiCamera size={26} />
            },
            {
                title: "Skanowanie menu",
                description: "Zrób zdjęcie karty menu - uzyskaj ranking dań od najlepszych do tych, których lepiej unikać.",
                icon: <FiSearch size={26} />
            },
            {
                title: "Wskazowki i tipy",
                description: "Kazda analiza zawiera wyjaśnienie wyniku i praktyczne wskazówki.",
                icon: <FiBookOpen size={26} />
            }
        ],
        imageSrc: "/images/mockup-2.webp"
    },
    {
        title: "Nauka o insulinoopornosci",
        description: "Quiz z 420+ pytaniami, codzienne wskazówki i seria aktywności. Ucz się przez działanie, nie przez reguly.",
        bullets: [
            {
                title: "Quiz wiedzy",
                description: "Ponad 420 pytań w 5 kategoriach. Sprawdź swoją wiedzę i ucz się nowych rzeczy.",
                icon: <FiBookOpen size={26} />
            },
            {
                title: "Codzienna wskazówka",
                description: "Codziennie nowa, praktyczna porada o życiu z insulinoopornością.",
                icon: <FiZap size={26} />
            },
            {
                title: "Seria aktywności",
                description: "Buduj nawyk codziennego korzystania z aplikacji i śledź swój postęp.",
                icon: <FiSmartphone size={26} />
            }
        ],
        imageSrc: "/images/mockup-1.webp"
    },
    {
        title: "Prywatnosc w DNA",
        description: "Nie zbieramy danych użytkowników. Brak kont, brak rejestracji, brak reklam. Twoje zdrowie, Twoja prywatność.",
        bullets: [
            {
                title: "Brak kont",
                description: "Nie wymagamy rejestracji ani logowania. Zainstaluj i korzystaj.",
                icon: <FiShield size={26} />
            },
            {
                title: "Brak reklam",
                description: "Zero reklam, zero trackerów, zero profilowania behawioralnego.",
                icon: <FiShield size={26} />
            },
            {
                title: "Lokalne przetwarzanie",
                description: "Zdjęcia są przetwarzane lokalnie i natychmiast usuwane. Nic nie opuszcza Twojego urządzenia.",
                icon: <FiSmartphone size={26} />
            }
        ],
        imageSrc: "/images/mockup-2.webp"
    },
]
