import { BsBarChartFill } from "react-icons/bs";
import { PiGlobeFill } from "react-icons/pi";
import { FiBook } from "react-icons/fi";

import { IStats } from "@/types";

export const stats: IStats[] = [
    {
        title: "4M+",
        icon: <BsBarChartFill size={34} className="text-primary" />,
        description: "Produktów w bazie Open Food Facts, dostępnych do skanowania kodów kreskowych."
    },
    {
        title: "420+",
        icon: <FiBook size={34} className="text-primary" />,
        description: "Pytań edukacyjnych w quizie wiedzy o insulinooporności."
    },
    {
        title: "100%",
        icon: <PiGlobeFill size={34} className="text-primary" />,
        description: "Prywatności. Brak kont, brak reklam, brak zbierania danych osobowych."
    }
];
