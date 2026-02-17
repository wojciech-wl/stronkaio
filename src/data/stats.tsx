import { BsBarChartFill } from "react-icons/bs";
import { PiGlobeFill } from "react-icons/pi";
import { FiBook } from "react-icons/fi";

import { IStats } from "@/types";

export const stats: IStats[] = [
    {
        title: "4M+",
        icon: <BsBarChartFill size={34} className="text-primary" />,
        description: "Produktów w bazie danych, dostępnych do skanowania kodów kreskowych.",
        descriptionEn: "Products in Open Food Facts database, available for barcode scanning."
    },
    {
        title: "420+",
        icon: <FiBook size={34} className="text-primary" />,
        description: "Pytań edukacyjnych w quizie wiedzy o insulinooporności.",
        descriptionEn: "Educational questions in the insulin resistance knowledge quiz."
    },
    {
        title: "100%",
        icon: <PiGlobeFill size={34} className="text-primary" />,
        description: "Prywatności. Brak kont, brak reklam, brak zbierania danych osobowych.",
        descriptionEn: "Privacy. No accounts, no ads, no personal data collection."
    }
];
