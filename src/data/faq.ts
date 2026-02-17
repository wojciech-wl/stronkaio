import { IFAQ } from "@/types";
import { siteDetails } from "./siteDetails";

export const faqs: IFAQ[] = [
    {
        question: `Czy ${siteDetails.siteName} jest darmowy?`,
        answer: 'Tak! Aplikacja jest całkowicie darmowa i taka pozostanie. Podstawowe funkcje (skanowanie produktów, OCR etykiet, historia skanów, quiz wiedzy) zawsze będą dostępne za darmo. Nie ma reklam ani ukrytych opłat.',
    },
    {
        question: `Czy muszę zakładać konto?`,
        answer: 'Nie! Asystent IO nie wymaga rejestracji ani logowania. Po prostu pobierz aplikację i zacznij korzystać. Wszystkie dane są przechowywane lokalnie na Twoim urządzeniu.',
    },
    {
        question: 'Czy aplikacja działa offline?',
        answer: 'Częściowo tak. Skanowanie kodów kreskowych wymaga połączenia z internetem (żeby pobrać dane produktu), ale OCR etykiet działa całkowicie offline dzięki AI na urządzeniu. Historia skanów jest zawsze dostępna offline.'
    },
    {
        question: 'Jakie dane zbieracie?',
        answer: 'Praktycznie żadne. Nie zbieramy danych osobowych, nie identyfikujemy użytkowników, nie śledzimy lokalizacji. Zdjęcia są przetwarzane lokalnie i natychmiast usuwane. Jedyne zbierane dane to anonimowe, zagregowane statystyki użycia (opcjonalne).',
    },
    {
        question: 'Jak działa scoring 0-100?',
        answer: 'Algorytm uwzględnia zawartość cukrów, węglowodanów netto, błonnika, białka oraz wykryte składniki wysokoGI (syropy, maltodekstryna). Wynik 80-100 to "OK" (zielony), 40-79 to "Limit" (żółty), poniżej 40 to "Ryzyko" (czerwony). Szczegóły znajdziesz w aplikacji.'
    },
    {
        question: 'Na jakich urządzeniach działa aplikacja?',
        answer: 'Obecnie Asystent IO jest dostępny na Androida (Google Play). Wersja na iOS jest w przygotowaniu. Aplikacja wymaga Androida 6.0 lub nowszego.'
    }
];
